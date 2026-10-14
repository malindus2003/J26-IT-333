import os
import json
import joblib
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from ..schemas import SensorReading, VisionFeatures, SpoilagePredictionResult

class MultiModalSpoilageMLEngine:
    """
    AI Multi-Modal Fusion Spoilage Prediction & Remaining Shelf-Life (RSL) Model.
    Integrates:
    1. Trained Supervised ML Models (XGBoost Regressor for RSL, Random Forest for Spoilage Probability & Risk Level)
    2. Real-time Multi-Modal Computer Vision Visual Defect Fusion (Discoloration, Mould, Texture degradation)
    3. Food-biology decay kinetics calibrated for Sri Lankan tropical & cold-chain restaurant conditions.
    """

    # Baseline shelf-life under optimal storage conditions (in hours)
    BASELINE_SHELF_LIFE_HOURS = {
        "Fruits": 168.0,      # ~7 days in tropical fruit cold chamber (10-12°C)
        "Vegetables": 144.0,  # ~6 days in crisper (4-6°C)
        "Meat": 96.0,         # ~4 days in meat chiller (0-4°C)
        "Fish": 48.0,         # ~2 days on crushed ice (0-2°C)
        "Dairy": 168.0,       # ~7 days in refrigerator (2-4°C)
    }

    # Optimal environmental thresholds per category
    OPTIMAL_ENVIRONMENTS = {
        "Fruits": {
            "temp_range": (8.0, 12.5),
            "humidity_range": (85.0, 92.0),
            "max_nh3": 0.08,
            "max_co2": 950.0,
            "max_voc": 0.45,
            "critical_factors": ["High CO2 respiration", "Ethylene gas buildup", "Botrytis mould", "Enzymatic browning"]
        },
        "Vegetables": {
            "temp_range": (3.5, 7.5),
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
            "critical_factors": ["Ammonia (NH3) generation", "Metmyoglobin oxidation (graying)", "Proteolysis", "Temperature abuse"]
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

    def __init__(self):
        self.models_loaded = False
        self.rsl_model = None
        self.prob_model = None
        self.risk_model = None
        self.produce_encoder = None
        self.metadata = {}
        self.load_trained_models()

    def load_trained_models(self):
        """Attempts to load persisted ML models from the saved_models directory."""
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            saved_models_dir = os.path.join(base_dir, "saved_models")
            
            rsl_path = os.path.join(saved_models_dir, "spoilage_rsl_model.joblib")
            prob_path = os.path.join(saved_models_dir, "spoilage_prob_model.joblib")
            risk_path = os.path.join(saved_models_dir, "spoilage_risk_model.joblib")
            encoder_path = os.path.join(saved_models_dir, "produce_encoder.joblib")
            meta_path = os.path.join(saved_models_dir, "model_metadata.json")

            if (os.path.exists(rsl_path) and os.path.exists(prob_path) and 
                os.path.exists(risk_path) and os.path.exists(encoder_path)):
                
                self.rsl_model = joblib.load(rsl_path)
                self.prob_model = joblib.load(prob_path)
                self.risk_model = joblib.load(risk_path)
                self.produce_encoder = joblib.load(encoder_path)
                
                if os.path.exists(meta_path):
                    with open(meta_path, "r", encoding="utf-8") as f:
                        self.metadata = json.load(f)
                        
                uci_gas_path = os.path.join(saved_models_dir, "uci_gas_spoilage_model.joblib")
                if os.path.exists(uci_gas_path):
                    self.uci_gas_model = joblib.load(uci_gas_path)
                else:
                    self.uci_gas_model = None

                self.models_loaded = True
                print(f"[MultiModalSpoilageMLEngine] Successfully loaded trained ML models from {saved_models_dir}")
            else:
                self.uci_gas_model = None
                print("[MultiModalSpoilageMLEngine] Pre-trained models not found; using calibrated biological baseline engine.")
        except Exception as e:
            print(f"[MultiModalSpoilageMLEngine] Warning loading ML models: {e}. Falling back to domain model.")
            self.models_loaded = False
            self.uci_gas_model = None

    def predict(
        self,
        item_name: str,
        category: str,
        storage_duration_hours: float,
        sensor: SensorReading,
        vision: Optional[VisionFeatures] = None
    ) -> SpoilagePredictionResult:
        cat_key = category.capitalize() if category and category.capitalize() in self.BASELINE_SHELF_LIFE_HOURS else "Fruits"
        env_specs = self.OPTIMAL_ENVIRONMENTS.get(cat_key, self.OPTIMAL_ENVIRONMENTS["Fruits"])

        # Try ML Inference if produce models are available and category is Fruit/Veg
        ml_prediction = self._predict_with_ml(item_name, cat_key, storage_duration_hours, sensor)

        if ml_prediction is not None:
            raw_rsl, raw_prob, raw_risk = ml_prediction
            risk_score = float(np.clip(raw_prob, 0.0, 100.0))
            spoilage_prob = float(np.clip(raw_prob, 0.0, 99.9))
            remaining_rsl = float(max(0.0, raw_rsl))
            risk_level = raw_risk
        else:
            # Domain-Knowledge Decay Kinetic Engine (Fallback / Non-produce items)
            risk_score, spoilage_prob, remaining_rsl, risk_level = self._predict_with_domain_physics(
                item_name, cat_key, storage_duration_hours, sensor, env_specs
            )

        # Multi-Modal Vision Fusion adjustment
        if vision:
            visual_risk = (
                (vision.discoloration_score * 0.30) +
                (100.0 if vision.mould_detected else (vision.mould_coverage * 15.0)) * 0.45 +
                (vision.texture_degradation * 0.15) +
                (vision.visual_spoilage_score * 0.10)
            )
            visual_risk = min(100.0, visual_risk)
            
            # Fuse IoT Sensor ML prediction with CV Visual Assessment (60% IoT ML, 40% Visual)
            fused_risk_score = (risk_score * 0.60) + (visual_risk * 0.40)
            risk_score = round(float(np.clip(fused_risk_score, 0.0, 100.0)), 1)
            spoilage_prob = round(float(np.clip(fused_risk_score * 0.95, 0.0, 99.9)), 1)

            if vision.mould_detected:
                spoilage_prob = max(spoilage_prob, 95.0)
                remaining_rsl = 0.0
                risk_level = "Critical"
            elif risk_score >= 76.0:
                risk_level = "Critical"
                remaining_rsl = min(remaining_rsl, 4.0)
            elif risk_score >= 52.0:
                risk_level = "High"
            elif risk_score >= 25.0:
                risk_level = "Medium"
            else:
                risk_level = "Low"

        # Generate Food Category-Specific Actionable Insights
        dominant_factors, recommendations, storage_action = self._generate_category_insights(
            item_name, cat_key, sensor, vision, risk_level, env_specs, remaining_rsl
        )

        return SpoilagePredictionResult(
            item_name=item_name,
            category=cat_key,
            spoilage_probability=round(spoilage_prob, 1),
            remaining_shelf_life_hours=round(remaining_rsl, 1),
            risk_level=risk_level,
            risk_score=round(risk_score, 1),
            dominant_spoilage_factors=dominant_factors,
            recommendations=recommendations,
            storage_action=storage_action
        )

    def _predict_with_ml(
        self, item_name: str, category: str, storage_duration_hours: float, sensor: SensorReading
    ) -> Optional[Tuple[float, float, str]]:
        if not self.models_loaded or not self.produce_encoder:
            return None

        try:
            # Estimate reasonable weight & transpiration based on duration & temp
            est_weight = 4.0
            est_weight_loss = min(15.0, (storage_duration_hours * 0.08) + max(0.0, (sensor.temperature - 10.0) * 0.3))

            num_feats = np.array([[
                sensor.temperature,
                sensor.humidity,
                sensor.nh3,
                sensor.co2,
                sensor.voc,
                storage_duration_hours,
                est_weight,
                est_weight_loss
            ]])

            # Try exact match or nearest known produce name for one-hot encoding
            known_cats = self.produce_encoder.categories_[0]
            matched_name = item_name if item_name in known_cats else None
            if not matched_name:
                for k in known_cats:
                    if any(word.lower() in k.lower() for word in item_name.split()):
                        matched_name = k
                        break
            if not matched_name:
                matched_name = known_cats[0] # Default fallback produce

            cat_encoded = self.produce_encoder.transform([[matched_name]])
            x_input = np.hstack([num_feats, cat_encoded])

            # Inference
            rsl_pred = float(self.rsl_model.predict(x_input)[0])
            prob_pred = float(self.prob_model.predict(x_input)[0])
            risk_idx = int(self.risk_model.predict(x_input)[0])

            inv_map = {0: "Low", 1: "Medium", 2: "High", 3: "Critical"}
            risk_str = inv_map.get(risk_idx, "Medium")

            return (rsl_pred, prob_pred, risk_str)
        except Exception as e:
            print(f"[MultiModalSpoilageMLEngine] ML inference exception: {e}")
            return None

    def _predict_with_domain_physics(
        self, item_name: str, cat_key: str, storage_duration_hours: float,
        sensor: SensorReading, env_specs: dict
    ) -> Tuple[float, float, float, str]:
        baseline_rsl = self.BASELINE_SHELF_LIFE_HOURS.get(cat_key, 120.0)
        min_temp, max_temp = env_specs["temp_range"]
        min_h, max_h = env_specs["humidity_range"]

        temp_penalty = 0.0
        if sensor.temperature > max_temp:
            temp_penalty = (sensor.temperature - max_temp) * 4.8
        elif sensor.temperature < min_temp:
            temp_penalty = abs(sensor.temperature - min_temp) * 2.2

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

        hum_penalty = 0.0
        if sensor.humidity > max_h:
            hum_penalty = (sensor.humidity - max_h) * 0.9
        elif sensor.humidity < min_h:
            hum_penalty = (min_h - sensor.humidity) * 0.7

        sensor_risk = min(100.0, max(0.0, temp_penalty + gas_penalty + hum_penalty))
        time_factor = min(1.0, storage_duration_hours / (baseline_rsl * 1.25)) * 30.0
        total_risk = (0.70 * sensor_risk) + (0.30 * time_factor)

        risk_score = float(np.clip(total_risk, 0.0, 100.0))
        spoilage_prob = float(np.clip(risk_score * 0.94, 0.0, 99.9))

        decay_rate = 1.0 + (risk_score / 22.0)
        elapsed_equivalent = storage_duration_hours * decay_rate
        calculated_rsl = max(0.0, baseline_rsl - elapsed_equivalent)

        if risk_score < 25.0:
            risk_level = "Low"
        elif risk_score < 52.0:
            risk_level = "Medium"
        elif risk_score < 76.0:
            risk_level = "High"
        else:
            risk_level = "Critical"

        return risk_score, spoilage_prob, calculated_rsl, risk_level

    def _generate_category_insights(
        self, item_name: str, category: str, sensor: SensorReading,
        vision: Optional[VisionFeatures], risk_level: str, env_specs: dict, rsl_hours: float
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
            factors.append(f"High CO2 respiration accumulation ({sensor.co2} ppm)")
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
