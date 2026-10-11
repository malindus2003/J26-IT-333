"""
Sri Lankan IoT Cold Chain & Food Spoilage Dataset Generator
Project: J26-IT-333 (Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

Generates realistic physical sensor telemetry calibrated for Sri Lanka's tropical climate
(High ambient temperature 27-34°C, High ambient humidity 75-92%, frequent kitchen rush door cycles,
and power/thermal fluctuation scenarios).
"""

import csv
import math
import random
import os
from datetime import datetime, timedelta

def generate_sri_lankan_iot_dataset(output_filepath, days=14, interval_mins=30):
    os.makedirs(os.path.dirname(output_filepath), exist_ok=True)

    # 5 Food Zones & Sri Lankan produce specifications
    ZONES_CONFIG = [
        {
            "zone_id": "zone-meat",
            "zone_name": "Zone 4: Walk-In Poultry & Meat Chiller",
            "food_category": "Meat",
            "food_item": "Fresh Broiler Chicken Cuts",
            "batch_prefix": "MT-CMB",
            "target_temp": 1.5,
            "temp_std": 0.6,
            "target_hum": 75.0,
            "hum_std": 2.5,
            "base_nh3": 0.05,
            "base_co2": 450.0,
            "base_voc": 0.15,
            "max_shelf_life": 96.0, # 4 days fresh at 1.5°C
            "nh3_sensitivity": 1.8, # High NH3 emission during protein proteolysis
            "voc_sensitivity": 0.8
        },
        {
            "zone_id": "zone-seafood",
            "zone_name": "Zone 5: Deep Chill Seafood & Ice Vault",
            "food_category": "Seafood",
            "food_item": "Yellowfin Tuna (Kelawalla) & Prawns",
            "batch_prefix": "SF-NEG",
            "target_temp": 0.5,
            "temp_std": 0.5,
            "target_hum": 88.0,
            "hum_std": 2.0,
            "base_nh3": 0.08,
            "base_co2": 420.0,
            "base_voc": 0.20,
            "max_shelf_life": 72.0, # 3 days fresh on ice
            "nh3_sensitivity": 2.4, # Very rapid TMA / Ammonia formation
            "voc_sensitivity": 1.2
        },
        {
            "zone_id": "zone-dairy",
            "zone_name": "Zone 3: Dairy & Pastry Refrigerator",
            "food_category": "Dairy",
            "food_item": "Pasteurized Whole Milk & Buffalo Curd",
            "batch_prefix": "DY-KND",
            "target_temp": 3.0,
            "temp_std": 0.5,
            "target_hum": 65.0,
            "hum_std": 3.0,
            "base_nh3": 0.02,
            "base_co2": 410.0,
            "base_voc": 0.08,
            "max_shelf_life": 120.0, # 5 days
            "nh3_sensitivity": 0.5,
            "voc_sensitivity": 1.5 # Lactic acid / sour fermentation volatiles
        },
        {
            "zone_id": "zone-fruit",
            "zone_name": "Zone 1: Tropical Fruit Chamber",
            "food_category": "Fruits",
            "food_item": "Local Cavendish Bananas & Red Papaya",
            "batch_prefix": "FR-GPH",
            "target_temp": 9.0,
            "temp_std": 0.8,
            "target_hum": 90.0,
            "hum_std": 2.5,
            "base_nh3": 0.01,
            "base_co2": 750.0,
            "base_voc": 0.35,
            "max_shelf_life": 168.0, # 7 days
            "nh3_sensitivity": 0.2,
            "voc_sensitivity": 2.5 # Heavy ethylene & ester off-gassing
        },
        {
            "zone_id": "zone-veg",
            "zone_name": "Zone 2: Leafy Greens & Vegetable Crisper",
            "food_category": "Vegetables",
            "food_item": "Gotukola, Kankun & Nuwara Eliya Carrots",
            "batch_prefix": "VG-NWE",
            "target_temp": 5.0,
            "temp_std": 0.6,
            "target_hum": 92.0,
            "hum_std": 2.0,
            "base_nh3": 0.02,
            "base_co2": 580.0,
            "base_voc": 0.18,
            "max_shelf_life": 144.0, # 6 days
            "nh3_sensitivity": 0.3,
            "voc_sensitivity": 1.4 # High respiration & moisture condensation
        }
    ]

    start_date = datetime(2026, 9, 1, 0, 0, 0)
    total_steps = int((days * 24 * 60) / interval_mins)

    fieldnames = [
        "timestamp",
        "zone_id",
        "zone_name",
        "food_category",
        "food_item",
        "batch_id",
        "storage_temp_c",
        "storage_humidity_pct",
        "nh3_ppm",
        "co2_ppm",
        "voc_ppm",
        "door_open_events_hr",
        "ambient_kitchen_temp_c",
        "ambient_kitchen_hum_pct",
        "power_status",
        "hours_in_storage",
        "spoilage_probability_pct",
        "remaining_shelf_life_hours",
        "risk_level",
        "recommended_action"
    ]

    with open(output_filepath, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for step in range(total_steps):
            current_time = start_date + timedelta(minutes=step * interval_mins)
            hour_of_day = current_time.hour + (current_time.minute / 60.0)
            day_idx = current_time.day

            # Sri Lankan Ambient Kitchen Climate Model
            # Daytime solar peak at 13:00 - 15:00 reaching 32-34°C; Nighttime dip to 26-27°C
            solar_cycle = math.sin((hour_of_day - 9.0) * math.pi / 12.0)
            ambient_temp = 28.5 + (4.0 * max(-0.5, solar_cycle)) + random.uniform(-0.6, 0.6)
            # Tropical humidity inversely linked to peak heat, ranging 76% to 92%
            ambient_hum = 86.0 - (8.0 * max(-0.2, solar_cycle)) + random.uniform(-1.5, 1.5)

            # Kitchen Service Shift Dynamics:
            # High activity / frequent door openings during Lunch Prep (11:00-14:30) and Dinner Rush (18:30-22:00)
            is_lunch_rush = 11.0 <= hour_of_day <= 14.5
            is_dinner_rush = 18.5 <= hour_of_day <= 22.0
            
            if is_lunch_rush or is_dinner_rush:
                door_open_rate = random.randint(12, 28) # openings per hour
            elif 6.0 <= hour_of_day <= 10.5 or 15.0 <= hour_of_day <= 18.0:
                door_open_rate = random.randint(4, 10)
            else:
                door_open_rate = random.randint(0, 2) # Night rest period

            # Inject Realistic Sri Lankan Operational Anomaly Scenarios:
            # 1. Day 4 (Sept 4) 12:30 - 15:30: Grid Power Fluctuation & Condenser Strain
            is_power_failure = (day_idx == 4 and 12.5 <= hour_of_day <= 15.5)
            # 2. Day 8 (Sept 8) 19:00 - 23:00: Walk-In Door Accidentally Left Ajar during Dinner Rush
            is_door_ajar = (day_idx == 8 and 19.0 <= hour_of_day <= 23.0)
            # 3. Day 11 (Sept 11): High Humidity Monsoon Ingress (Mold acceleration in fruits & vegetables)
            is_monsoon_spike = (day_idx == 11)

            for zone in ZONES_CONFIG:
                hours_in_storage = round((step * interval_mins) / 60.0 % (zone["max_shelf_life"] * 1.5), 1)
                batch_num = 100 + int((step * interval_mins) / (zone["max_shelf_life"] * 60.0))
                batch_id = f"BATCH-{zone['batch_prefix']}-{batch_num}"

                # Base internal temperature & humidity
                target_t = zone["target_temp"]
                target_h = zone["target_hum"]

                # Thermal load calculation based on door openings & ambient heat ingress
                door_heat_ingress = (door_open_rate / 25.0) * (ambient_temp - target_t) * 0.08
                current_temp = target_t + random.gauss(0, zone["temp_std"]) + door_heat_ingress
                current_hum = target_h + random.gauss(0, zone["hum_std"]) + (ambient_hum - target_h) * 0.03

                power_status = "Normal"

                if is_power_failure:
                    power_status = "Grid Power Outage (Generator Lag)"
                    current_temp += random.uniform(5.5, 9.0) # Thermal spike up to 8-12°C
                    current_hum += random.uniform(4.0, 8.0)
                elif is_door_ajar:
                    power_status = "Door Ajar Ingress"
                    current_temp += random.uniform(3.5, 6.0)
                    current_hum += random.uniform(6.0, 10.0)
                elif is_monsoon_spike and zone["food_category"] in ["Fruits", "Vegetables"]:
                    current_hum += random.uniform(5.0, 8.0)

                # Gas Sensor Dynamics (MQ-137 NH3, MQ-135 CO2, SGP30 VOC)
                # Spoilage kinetics modeled via Arrhenius Q10 temperature-dependent degradation rate
                temp_stress_factor = max(1.0, math.exp(0.12 * (current_temp - target_t)))
                storage_progress = hours_in_storage / zone["max_shelf_life"] # 0.0 (fresh) to >1.0 (decayed)

                # NH3 gas evolution (ppm)
                nh3 = zone["base_nh3"] + (0.04 * (storage_progress ** 2.2) * temp_stress_factor * zone["nh3_sensitivity"])
                nh3 += random.uniform(-0.005, 0.015)
                nh3 = max(0.01, round(nh3, 3))

                # CO2 gas evolution (ppm)
                co2 = zone["base_co2"] + (180.0 * storage_progress * temp_stress_factor)
                if zone["food_category"] in ["Fruits", "Vegetables"]:
                    co2 += 250.0 * (storage_progress ** 1.8) # Elevated biological respiration
                co2 += random.uniform(-15.0, 25.0)
                co2 = max(380.0, round(co2, 1))

                # VOC / Ethylene evolution (ppm)
                voc = zone["base_voc"] + (0.35 * (storage_progress ** 1.9) * temp_stress_factor * zone["voc_sensitivity"])
                voc += random.uniform(-0.02, 0.04)
                voc = max(0.05, round(voc, 2))

                # Multi-Modal Spoilage Probability & Remaining Shelf-Life Estimation
                # Combine physical IoT stressors: Temp drift, NH3 spike, VOC accumulation, and Storage Age
                spoilage_score = (storage_progress * 55.0) + \
                                 (max(0.0, (current_temp - target_t)) * 4.5) + \
                                 ((nh3 / zone["base_nh3"]) * 6.5) + \
                                 ((voc / zone["base_voc"]) * 5.0)
                
                spoilage_prob = max(2.0, min(99.4, round(spoilage_score, 1)))

                # Remaining shelf-life in hours
                calc_rsl = max(0.0, round(zone["max_shelf_life"] * (1.0 - (spoilage_prob / 100.0)), 1))

                # Risk Categorization & Chef Directives
                if spoilage_prob < 30.0:
                    risk_level = "Low (Fresh)"
                    action = "Optimal cold storage environment. Batch suitable for regular menu prep."
                elif spoilage_prob < 60.0:
                    risk_level = "Medium (Caution)"
                    action = "Minor gas/thermal drift. Prioritize batch consumption in today's evening service."
                elif spoilage_prob < 85.0:
                    risk_level = "High (Priority FIFO)"
                    action = "Immediate FIFO culinary routing. Cook in curries, stews, or baked items within 6 hours."
                else:
                    risk_level = "Critical (Disposal)"
                    action = "Severe microbial/chemical decay detected. Isolate immediately and condemn to waste."

                writer.writerow({
                    "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "zone_id": zone["zone_id"],
                    "zone_name": zone["zone_name"],
                    "food_category": zone["food_category"],
                    "food_item": zone["food_item"],
                    "batch_id": batch_id,
                    "storage_temp_c": round(current_temp, 2),
                    "storage_humidity_pct": round(current_hum, 1),
                    "nh3_ppm": nh3,
                    "co2_ppm": co2,
                    "voc_ppm": voc,
                    "door_open_events_hr": door_open_rate,
                    "ambient_kitchen_temp_c": round(ambient_temp, 1),
                    "ambient_kitchen_hum_pct": round(ambient_hum, 1),
                    "power_status": power_status,
                    "hours_in_storage": hours_in_storage,
                    "spoilage_probability_pct": spoilage_prob,
                    "remaining_shelf_life_hours": calc_rsl,
                    "risk_level": risk_level,
                    "recommended_action": action
                })

    print(f"[SUCCESS] Generated {total_steps * len(ZONES_CONFIG)} sensor readings at: {output_filepath}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(current_dir, "sri_lanka_iot_spoilage_dataset.csv")
    generate_sri_lankan_iot_dataset(out_path, days=14, interval_mins=30)

