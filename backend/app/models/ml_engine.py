import numpy as np
from typing import Dict, Any, List, Tuple
from ..schemas import SensorReading, VisionFeatures, SpoilagePredictionResult

class MultiModalSpoilageMLEngine:
    """
    AI Multi-Modal Fusion Spoilage Prediction & Remaining Shelf-Life (RSL) Model.
    Fully covers all food categories:
    - Fruits (Bananas, Strawberries, Apples, Avocados, Citrus, Berries)
    - Vegetables (Lettuce, Spinach, Tomatoes, Peppers, Broccoli, Carrots)
    - Dairy Products (Milk, Cheese, Butter, Yogurt)
    - Fish & Seafood (Tuna, Salmon, Prawns, Whitefish)
    - Meat & Poultry (Chicken, Beef, Pork, Lamb)
    """

    # Baseline shelf-life under optimal storage conditions (in hours)
    BASELINE_SHELF_LIFE_HOURS = {
        "Fruits": 120.0,      # ~5 days in fruit cold chamber (8-12°C)
        "Vegetables": 96.0,   # ~4 days in crisper (4-8°C)
        "Meat": 96.0,         # ~4 days in meat chiller (0-4°C)
        "Fish": 48.0,         # ~2 days on crushed ice (0-2°C)
        "Dairy": 168.0,       # ~7 days in refrigerator (2-4°C)
    }

    # Optimal environmental thresholds per category
    OPTIMAL_ENVIRONMENTS = {
        "Fruits": {
            "temp_range": (6.0, 12.0),
            "humidity_range": (85.0, 92.0),
            "max_nh3": 0.08,
            "max_co2": 950.0,
            "max_voc": 0.45,
            "critical_factors": ["High CO₂ respiration", "Ethylene gas buildup", "Botrytis mould", "Enzymatic browning"]
        },
        "Vegetables": {
            "temp_range": (3.0, 7.0),
            "humidity_range": (88.0, 95.0),
            "max_nh3": 0.08,
            "max_co2": 800.0,
            "max_voc": 0.35,
            "critical_factors": ["Chlorophyll breakdown (yellowing)", "Desiccation / wilting", "Brown bacterial rot", "High moisture mildew"]
        },
        "Meat": {
            "temp_range": (0.0, 4.0),
            "humidity_range": (70.0, 80.0),
            "max_nh3": 0.20,
            "max_co2": 600.0,
            "max_voc": 0.30,
            "critical_factors": ["Ammonia (NH₃) generation", "Metmyoglobin oxidation (graying)", "Proteolysis", "Temperature abuse"]
        },
        "Fish": {
            "temp_range": (0.0, 2.0),
            "humidity_range": (80.0, 90.0),
            "max_nh3": 0.15,
            "max_co2": 500.0,
            "max_voc": 0.25,
            "critical_factors": ["TVB-N / Ammonia release", "Loss of opalescence", "Lipid oxidation", "Bacterial slime"]
        },
        "Dairy": {
            "temp_range": (2.0, 4.0),
            "humidity_range": (60.0, 70.0),
            "max_nh3": 0.06,
            "max_co2": 450.0,
            "max_voc": 0.20,
            "critical_factors": ["Lactic fermentation / Souring", "Curdling & whey separation", "Surface fungal mould", "Temperature elevation"]
        },
    }

    def predict(
        self,
        item_name: str,
        category: str,
        storage_duration_hours: float,
        sensor: SensorReading,
        vision: VisionFeatures = None
    ) -> SpoilagePredictionResult:
        cat_key = category.capitalize() if category and category.capitalize() in self.BASELINE_SHELF_LIFE_HOURS else "Fruits"
        baseline_rsl = self.BASELINE_SHELF_LIFE_HOURS[cat_key]
        env_specs = self.OPTIMAL_ENVIRONMENTS[cat_key]

        # 1. Environmental Sensor Impact Evaluation
        temp_penalty = 0.0
        min_temp, max_temp = env_specs["temp_range"]
        if sensor.temperature > max_temp:
            temp_diff = sensor.temperature - max_temp
            # Arrhenius microbial acceleration
            temp_penalty = temp_diff * 4.8
        elif sensor.temperature < min_temp:
            # Chilling injury in sensitive fruits / freezing in veg
            temp_penalty = abs(sensor.temperature - min_temp) * 2.2

        # Gas concentration penalties
        gas_penalty = 0.0
        if sensor.nh3 > env_specs["max_nh3"]:
            ratio = sensor.nh3 / env_specs["max_nh3"]
            gas_penalty += (ratio - 1.0) * (24.0 if cat_key in ["Meat", "Fish"] else 12.0)

        if sensor.voc > env_specs["max_voc"]:
            ratio = sensor.voc / env_specs["max_voc"]
            gas_penalty += (ratio - 1.0) * (20.0 if cat_key in ["Fruits", "Vegetables"] else 15.0)

        if sensor.co2 > env_specs["max_co2"]:
            ratio = sensor.co2 / env_specs["max_co2"]
            gas_penalty += (ratio - 1.0) * (18.0 if cat_key in ["Fruits", "Vegetables"] else 10.0)

        # Humidity Penalty
        hum_penalty = 0.0
        min_h, max_h = env_specs["humidity_range"]
        if sensor.humidity > max_h:
            hum_penalty = (sensor.humidity - max_h) * 0.9  # Excess humidity triggers mould & slime
        elif sensor.humidity < min_h:
            hum_penalty = (min_h - sensor.humidity) * 0.7  # Low humidity causes produce wilting & shriveling

        sensor_risk_component = min(100.0, max(0.0, temp_penalty + gas_penalty + hum_penalty))

        # 2. Visual Quality Assessment Impact
        if vision:
            visual_risk_component = (
                (vision.discoloration_score * 0.30) +
                (100.0 if vision.mould_detected else (vision.mould_coverage * 15.0)) * 0.40 +
                (vision.texture_degradation * 0.15) +
                (vision.visual_spoilage_score * 0.15)
            )
            visual_risk_component = min(100.0, visual_risk_component)
        else:
            visual_risk_component = sensor_risk_component * 0.55

        # 3. Multi-Modal Weight Fusion based on Food Biology
        time_factor = min(1.0, storage_duration_hours / (baseline_rsl * 1.25)) * 30.0

        if cat_key in ["Fruits", "Vegetables"]:
            # Produce: Respiration, wilting, mould & discoloration dominate
            total_risk = (0.35 * sensor_risk_component) + (0.45 * visual_risk_component) + (0.20 * time_factor)
        elif cat_key in ["Meat", "Fish"]:
            # Meat/Fish: Volatile basic nitrogen, NH3, VOC & temp dominate
            total_risk = (0.45 * sensor_risk_component) + (0.35 * visual_risk_component) + (0.20 * time_factor)
        else: # Dairy
            total_risk = (0.40 * sensor_risk_component) + (0.40 * visual_risk_component) + (0.20 * time_factor)

        risk_score = round(float(np.clip(total_risk, 0.0, 100.0)), 1)
        spoilage_prob = round(float(np.clip(risk_score * 0.94 + (6.0 if risk_score > 48 else 0.0), 0.0, 99.9)), 1)

        # 4. Remaining Shelf-Life (Hours) Calculation
        decay_rate = 1.0 + (risk_score / 22.0)
        elapsed_equivalent = storage_duration_hours * decay_rate
        calculated_rsl = max(0.0, baseline_rsl - elapsed_equivalent)

        if risk_score >= 78.0 or (vision and vision.mould_detected):
            calculated_rsl = 0.0
            spoilage_prob = max(spoilage_prob, 92.5)

        remaining_shelf_life_hours = round(float(calculated_rsl), 1)

        # 5. Risk Level Categorization
        if risk_score < 25.0:
            risk_level = "Low"
        elif risk_score < 52.0:
            risk_level = "Medium"
        elif risk_score < 76.0:
            risk_level = "High"
        else:
            risk_level = "Critical"

        # 6. Generate Food Category-Specific Actionable Insights
        dominant_factors, recommendations, storage_action = self._generate_category_insights(
            item_name, cat_key, sensor, vision, risk_level, env_specs, remaining_shelf_life_hours
        )

        return SpoilagePredictionResult(
            item_name=item_name,
            category=cat_key,
            spoilage_probability=spoilage_prob,
            remaining_shelf_life_hours=remaining_shelf_life_hours,
            risk_level=risk_level,
            risk_score=risk_score,
            dominant_spoilage_factors=dominant_factors,
            recommendations=recommendations,
            storage_action=storage_action
        )

    def _generate_category_insights(
        self, item_name: str, category: str, sensor: SensorReading,
        vision: VisionFeatures, risk_level: str, env_specs: dict, rsl_hours: float
    ) -> Tuple[List[str], List[str], str]:
        factors = []
        recommendations = []

        min_t, max_t = env_specs["temp_range"]
        min_h, max_h = env_specs["humidity_range"]

        if sensor.temperature > max_t:
            factors.append(f"Temperature elevation (+{round(sensor.temperature - max_t, 1)}°C above {max_t}°C)")
        if sensor.temperature < min_t:
            factors.append(f"Chilling / freezing deviation ({sensor.temperature}°C < {min_t}°C)")
        if sensor.humidity > max_h:
            factors.append(f"Excess moisture condensation ({sensor.humidity}% RH)")
        if sensor.humidity < min_h:
            factors.append(f"Dry air causing moisture loss / wilting ({sensor.humidity}% RH)")
        if sensor.co2 > env_specs["max_co2"]:
            factors.append(f"High CO₂ respiration accumulation ({sensor.co2} ppm)")
        if sensor.voc > env_specs["max_voc"]:
            factors.append(f"Elevated VOC degassing ({sensor.voc} ppm)")
        if sensor.nh3 > env_specs["max_nh3"]:
            factors.append(f"Ammonia gas detected ({sensor.nh3} ppm)")
        if vision and vision.mould_detected:
            factors.append("Active fungal mould colony detected")
        if vision and vision.discoloration_score > 12.0:
            factors.append(f"Surface discoloration / browning ({vision.discoloration_score}%)")

        if not factors:
            factors.append("Normal aging under stable environmental parameters")

        # Category-Specific Culinary & Actionable Prescriptions
        if risk_level == "Critical" or rsl_hours <= 0:
            storage_action = "CRITICAL: Immediate Quarantine & Safe Disposal"
            recommendations.append(f"DO NOT SERVE '{item_name}': Advanced degradation or microbial growth detected.")
            recommendations.append("Immediately remove from cold storage to prevent cross-contaminating neighboring fresh batches.")
            if category in ["Fruits", "Vegetables"]:
                recommendations.append("Divert non-toxic spoiled organic matter to restaurant compost or smart waste bin.")
            else:
                recommendations.append("Sanitize storage container and shelves with food-safe disinfectant.")

        elif risk_level == "High" or rsl_hours < 18.0:
            storage_action = f"PRIORITY FIRST (FIFO) - Consume within {int(rsl_hours)}h"
            if category == "Fruits":
                recommendations.append(f"EXPEDITED FRUIT USAGE: Divert '{item_name}' immediately to dessert bar, fresh juices, coulis, or smoothies today.")
                recommendations.append("Separate ripe batches from unripe produce to avoid ethylene-accelerated ripening.")
            elif category == "Vegetables":
                recommendations.append(f"EXPEDITED VEG USAGE: Dispatch '{item_name}' for today's soup stock, stir-fry, or blanch and freeze immediately.")
                recommendations.append(f"Adjust crisper humidity: Ensure target is between {min_h}% - {max_h}%.")
            elif category == "Meat":
                recommendations.append(f"PRIORITIZE MEAT PREP: Dispatch '{item_name}' for today's lunch/dinner braising or grill specials.")
                recommendations.append(f"Lower chiller temperature to {min_t}°C to inhibit microbial growth.")
            elif category == "Fish":
                recommendations.append(f"SEAFOOD PRIORITY: Cook '{item_name}' for today's fish curries / pan-seared menu items.")
                recommendations.append("Replenish crushed ice bed to maintain 0°C core temperature.")
            else: # Dairy
                recommendations.append(f"DAIRY DISPATCH: Use '{item_name}' in bakery sauces, quiches, or hot beverages immediately.")

        elif risk_level == "Medium":
            storage_action = f"Monitor Closely - Schedule Usage within {round(rsl_hours / 24.0, 1)} Days"
            if category == "Fruits":
                recommendations.append(f"Plan '{item_name}' for fruit platters and bakery tarts within 48 hours.")
            elif category == "Vegetables":
                recommendations.append(f"Prioritize '{item_name}' in salad bar rotation before fresh deliveries.")
            else:
                recommendations.append(f"Item is stable. Schedule regular kitchen rotation for '{item_name}'.")
            recommendations.append(f"Verify storage zone climate is maintained within {min_t}°C - {max_t}°C.")

        else: # Low
            storage_action = "Storage Conditions Optimal (Fresh Harvest)"
            recommendations.append(f"'{item_name}' is in peak quality. Continue standard FIFO inventory rotation.")
            recommendations.append(f"Maintain {sensor.storage_zone} within target range ({min_t}°C - {max_t}°C).")

        return factors, recommendations, storage_action

ml_spoilage_engine = MultiModalSpoilageMLEngine()
