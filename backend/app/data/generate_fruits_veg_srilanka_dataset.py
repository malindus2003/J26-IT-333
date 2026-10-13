"""
Sri Lankan IoT Fruit & Vegetable Spoilage Telemetry Dataset Generator
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)
GitHub Repo: https://github.com/malindus2003/J26-IT-333

Physical IoT Sensor Hardware Specification:
- Node Controller: ESP32-WROOM-32 (Dual Core 240MHz, Wi-Fi / MQTT telemetry)
- Temperature & Humidity: DHT22 (AM2302) & DS18B20 digital probe
- Ammonia (NH3) & Amines: MQ-137 Electrochemical / Metal Oxide Gas Sensor
- Carbon Dioxide (CO2): SCD30 NDIR Dual-Beam Optical Sensor / MQ-135
- Volatile Organic Compounds (VOC) & Ethylene (C2H4): Sensirion SGP30 / MQ-138 MOX Gas Sensor
- Weight / Transpiration Loss: Load Cell HX711 5kg ADC Strain Gauge

Environmental Calibration:
- Sri Lankan Tropical Ambient: 27.5°C to 34.0°C, 72% to 92% Relative Humidity
- Commercial Restaurant Cold Vault: 4.0°C to 11.0°C (Produce-specific), 85% to 95% Relative Humidity
"""

import csv
import json
import math
import random
import os
from datetime import datetime, timedelta

def create_fruits_vegetables_dataset(output_csv_path, output_json_path=None):
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    random.seed(42) # Deterministic reproducibility for scientific research

    PRODUCE_PROFILES = [
        # --- TROPICAL FRUITS (SRI LANKA) ---
        {
            "produce_name": "Embul Banana (Ambul Kesel)",
            "category": "Fruit",
            "variety": "Musa acuminata (Embul)",
            "climacteric": True,
            "origin": "Embilipitiya / Gampaha, Sri Lanka",
            "base_cold_temp": 12.5, # Chilling sensitive below 11°C
            "base_cold_hum": 90.0,
            "cold_shelf_hours": 168.0, # 7 days
            "ambient_shelf_hours": 72.0, # 3 days at Sri Lankan 30°C
            "initial_weight": 4.5,
            "respiration_rate": "Very High",
            "ethylene_production": "High",
            "base_nh3": 0.015,
            "base_co2": 520.0,
            "base_voc": 0.30,
            "max_voc_spoil": 5.80,
            "max_co2_spoil": 2400.0,
            "max_nh3_spoil": 0.18,
            "device_node": "ESP32-NODE-FR-01",
            "chamber_cold": "Chamber 1: Tropical Fruit Chiller (12°C)",
            "chamber_ambient": "Ambient Fruit Storage Rack (Kitchen Room Temp)"
        },
        {
            "produce_name": "Karthakolomban Mango",
            "category": "Fruit",
            "variety": "Mangifera indica (Karthakolomban)",
            "climacteric": True,
            "origin": "Jaffna / Vavuniya, Sri Lanka",
            "base_cold_temp": 11.0,
            "base_cold_hum": 88.0,
            "cold_shelf_hours": 192.0, # 8 days
            "ambient_shelf_hours": 84.0, # 3.5 days
            "initial_weight": 5.0,
            "respiration_rate": "High",
            "ethylene_production": "High",
            "base_nh3": 0.012,
            "base_co2": 490.0,
            "base_voc": 0.25,
            "max_voc_spoil": 5.20,
            "max_co2_spoil": 2200.0,
            "max_nh3_spoil": 0.15,
            "device_node": "ESP32-NODE-FR-02",
            "chamber_cold": "Chamber 1: Tropical Fruit Chiller (11°C)",
            "chamber_ambient": "Ambient Fruit Storage Rack (Kitchen Room Temp)"
        },
        {
            "produce_name": "Red Lady Papaya (Rathu Papol)",
            "category": "Fruit",
            "variety": "Carica papaya (Red Lady F1)",
            "climacteric": True,
            "origin": "Anuradhapura / Kurunegala, Sri Lanka",
            "base_cold_temp": 9.5,
            "base_cold_hum": 89.0,
            "cold_shelf_hours": 144.0, # 6 days
            "ambient_shelf_hours": 60.0, # 2.5 days
            "initial_weight": 6.2,
            "respiration_rate": "High",
            "ethylene_production": "Moderate",
            "base_nh3": 0.018,
            "base_co2": 510.0,
            "base_voc": 0.28,
            "max_voc_spoil": 4.90,
            "max_co2_spoil": 2350.0,
            "max_nh3_spoil": 0.22,
            "device_node": "ESP32-NODE-FR-03",
            "chamber_cold": "Chamber 1: Tropical Fruit Chiller (10°C)",
            "chamber_ambient": "Ambient Prep Counter (Kitchen Room Temp)"
        },
        {
            "produce_name": "Mauritius Pineapple (Gampaha Annasi)",
            "category": "Fruit",
            "variety": "Ananas comosus (Mauritius)",
            "climacteric": False,
            "origin": "Giriulla / Gampaha, Sri Lanka",
            "base_cold_temp": 8.5,
            "base_cold_hum": 88.0,
            "cold_shelf_hours": 216.0, # 9 days
            "ambient_shelf_hours": 96.0, # 4 days
            "initial_weight": 5.8,
            "respiration_rate": "Moderate",
            "ethylene_production": "Low",
            "base_nh3": 0.010,
            "base_co2": 460.0,
            "base_voc": 0.22,
            "max_voc_spoil": 4.50, # Fermentation esters
            "max_co2_spoil": 1950.0,
            "max_nh3_spoil": 0.12,
            "device_node": "ESP32-NODE-FR-04",
            "chamber_cold": "Chamber 2: Low-Temp Produce Chiller (8°C)",
            "chamber_ambient": "Ambient Fruit Storage Rack (Kitchen Room Temp)"
        },
        {
            "produce_name": "Sri Lankan Avocado (Butter Fruit)",
            "category": "Fruit",
            "variety": "Persea americana (Local Butter)",
            "climacteric": True,
            "origin": "Kandy / Bandarawela, Sri Lanka",
            "base_cold_temp": 7.5,
            "base_cold_hum": 90.0,
            "cold_shelf_hours": 180.0, # 7.5 days
            "ambient_shelf_hours": 72.0, # 3 days
            "initial_weight": 3.5,
            "respiration_rate": "High",
            "ethylene_production": "Very High",
            "base_nh3": 0.014,
            "base_co2": 530.0,
            "base_voc": 0.32,
            "max_voc_spoil": 5.60,
            "max_co2_spoil": 2500.0,
            "max_nh3_spoil": 0.20,
            "device_node": "ESP32-NODE-FR-05",
            "chamber_cold": "Chamber 2: Low-Temp Produce Chiller (8°C)",
            "chamber_ambient": "Ambient Kitchen Display Rack"
        },

        # --- INDIGENOUS & COMMODITY VEGETABLES (SRI LANKA) ---
        {
            "produce_name": "Gotukola (Centella Asiatica)",
            "category": "Vegetable",
            "variety": "Centella asiatica (Local Leafy)",
            "climacteric": False,
            "origin": "Kalutara / Western Province, Sri Lanka",
            "base_cold_temp": 4.5,
            "base_cold_hum": 94.0,
            "cold_shelf_hours": 96.0, # 4 days
            "ambient_shelf_hours": 24.0, # 1 day ambient before heavy wilting & decay
            "initial_weight": 2.0,
            "respiration_rate": "Extremely High",
            "ethylene_production": "Very Low",
            "base_nh3": 0.020,
            "base_co2": 580.0,
            "base_voc": 0.15,
            "max_voc_spoil": 3.10,
            "max_co2_spoil": 2700.0,
            "max_nh3_spoil": 0.38, # Bacterial soft rot breakdown
            "device_node": "ESP32-NODE-VG-01",
            "chamber_cold": "Chamber 3: Leafy Greens Crisper Vault (4°C)",
            "chamber_ambient": "Open Vegetable Basket (Kitchen Ambient)"
        },
        {
            "produce_name": "Kankun (Water Spinach)",
            "category": "Vegetable",
            "variety": "Ipomoea aquatica (Sri Lankan Green)",
            "climacteric": False,
            "origin": "Bolgoda / Gampaha, Sri Lanka",
            "base_cold_temp": 5.0,
            "base_cold_hum": 93.0,
            "cold_shelf_hours": 90.0, # 3.75 days
            "ambient_shelf_hours": 28.0, # ~1.2 days
            "initial_weight": 2.5,
            "respiration_rate": "Extremely High",
            "ethylene_production": "Very Low",
            "base_nh3": 0.022,
            "base_co2": 560.0,
            "base_voc": 0.18,
            "max_voc_spoil": 3.40,
            "max_co2_spoil": 2650.0,
            "max_nh3_spoil": 0.35,
            "device_node": "ESP32-NODE-VG-02",
            "chamber_cold": "Chamber 3: Leafy Greens Crisper Vault (5°C)",
            "chamber_ambient": "Open Vegetable Basket (Kitchen Ambient)"
        },
        {
            "produce_name": "Mukunuwenna (Alternanthera)",
            "category": "Vegetable",
            "variety": "Alternanthera sessilis",
            "climacteric": False,
            "origin": "Bandaragama, Sri Lanka",
            "base_cold_temp": 4.5,
            "base_cold_hum": 94.0,
            "cold_shelf_hours": 84.0, # 3.5 days
            "ambient_shelf_hours": 22.0, # <1 day
            "initial_weight": 2.0,
            "respiration_rate": "Extremely High",
            "ethylene_production": "Very Low",
            "base_nh3": 0.025,
            "base_co2": 590.0,
            "base_voc": 0.16,
            "max_voc_spoil": 3.20,
            "max_co2_spoil": 2800.0,
            "max_nh3_spoil": 0.40,
            "device_node": "ESP32-NODE-VG-03",
            "chamber_cold": "Chamber 3: Leafy Greens Crisper Vault (4°C)",
            "chamber_ambient": "Open Vegetable Basket (Kitchen Ambient)"
        },
        {
            "produce_name": "Nuwara Eliya Carrots",
            "category": "Vegetable",
            "variety": "Daucus carota (Upcountry Kuroda)",
            "climacteric": False,
            "origin": "Nuwara Eliya / Kandapola, Sri Lanka",
            "base_cold_temp": 3.5,
            "base_cold_hum": 92.0,
            "cold_shelf_hours": 360.0, # 15 days in cold vault
            "ambient_shelf_hours": 120.0, # 5 days
            "initial_weight": 8.0,
            "respiration_rate": "Low",
            "ethylene_production": "Very Low",
            "base_nh3": 0.010,
            "base_co2": 440.0,
            "base_voc": 0.12,
            "max_voc_spoil": 2.60,
            "max_co2_spoil": 1600.0,
            "max_nh3_spoil": 0.14,
            "device_node": "ESP32-NODE-VG-04",
            "chamber_cold": "Chamber 4: Root & Solid Vegetable Vault (3°C)",
            "chamber_ambient": "Ambient Root Veg Rack (Kitchen Store)"
        },
        {
            "produce_name": "Local Tomatoes (Thakkali)",
            "category": "Vegetable", # Culturally & culinarily treated as vegetable
            "variety": "Solanum lycopersicum (Maheshi / Padma)",
            "climacteric": True,
            "origin": "Dambulla / Matale, Sri Lanka",
            "base_cold_temp": 10.5, # Chilling injury if < 10°C
            "base_cold_hum": 89.0,
            "cold_shelf_hours": 168.0, # 7 days
            "ambient_shelf_hours": 60.0, # 2.5 days in humid tropical heat
            "initial_weight": 5.0,
            "respiration_rate": "High",
            "ethylene_production": "High",
            "base_nh3": 0.015,
            "base_co2": 510.0,
            "base_voc": 0.26,
            "max_voc_spoil": 4.80,
            "max_co2_spoil": 2150.0,
            "max_nh3_spoil": 0.20,
            "device_node": "ESP32-NODE-VG-05",
            "chamber_cold": "Chamber 1: Produce Chiller (10°C)",
            "chamber_ambient": "Prep Table Storage Crate (Ambient 30°C)"
        },
        {
            "produce_name": "Green Beans (Bonchi)",
            "category": "Vegetable",
            "variety": "Phaseolus vulgaris (Welimada Bush Bean)",
            "climacteric": False,
            "origin": "Welimada / Nuwara Eliya, Sri Lanka",
            "base_cold_temp": 6.0,
            "base_cold_hum": 91.0,
            "cold_shelf_hours": 144.0, # 6 days
            "ambient_shelf_hours": 48.0, # 2 days
            "initial_weight": 4.0,
            "respiration_rate": "High",
            "ethylene_production": "Low",
            "base_nh3": 0.016,
            "base_co2": 520.0,
            "base_voc": 0.17,
            "max_voc_spoil": 3.00,
            "max_co2_spoil": 2100.0,
            "max_nh3_spoil": 0.22,
            "device_node": "ESP32-NODE-VG-06",
            "chamber_cold": "Chamber 3: Vegetable Crisper (6°C)",
            "chamber_ambient": "Ambient Kitchen Shelf (Room Temp)"
        },
        {
            "produce_name": "Green Chillies (Amu Miris)",
            "category": "Vegetable",
            "variety": "Capsicum annuum (MI-2 Local)",
            "climacteric": False,
            "origin": "Anuradhapura / Mahailluppallama, Sri Lanka",
            "base_cold_temp": 7.5,
            "base_cold_hum": 88.0,
            "cold_shelf_hours": 192.0, # 8 days
            "ambient_shelf_hours": 72.0, # 3 days
            "initial_weight": 3.0,
            "respiration_rate": "Moderate",
            "ethylene_production": "Low",
            "base_nh3": 0.012,
            "base_co2": 470.0,
            "base_voc": 0.20,
            "max_voc_spoil": 3.50,
            "max_co2_spoil": 1850.0,
            "max_nh3_spoil": 0.16,
            "device_node": "ESP32-NODE-VG-07",
            "chamber_cold": "Chamber 2: Vegetable Chiller (7.5°C)",
            "chamber_ambient": "Ambient Kitchen Spice / Veg Bin"
        }
    ]

    # Time configuration
    start_time = datetime(2026, 8, 20, 6, 0, 0)
    time_step_hours = 1.0 # Hourly physical sensor sampling
    
    rows = []
    
    # We simulate 3 real-world Restaurant scenarios for each produce:
    # 1. 'Controlled Cold Storage' (Ideal refrigerated supply chain)
    # 2. 'Ambient Tropical Storage' (Typical Sri Lankan kitchen rack / pantry)
    # 3. 'Temperature Abuse / Cold Chain Failure' (Power outage or chiller door ajar)
    
    batch_counter = 101

    for item in PRODUCE_PROFILES:
        scenarios = [
            {"mode": "Cold Storage", "hours": int(item["cold_shelf_hours"] * 1.15)},
            {"mode": "Ambient Tropical", "hours": int(item["ambient_shelf_hours"] * 1.25)},
            {"mode": "Cold Chain Abuse", "hours": int(item["cold_shelf_hours"] * 0.70)}
        ]

        for scen in scenarios:
            mode = scen["mode"]
            total_steps = scen["hours"]
            batch_id = f"BATCH-SL-{item['category'][:2].upper()}-{batch_counter}"
            batch_counter += 1
            
            # Initial baseline shelf life
            nominal_shelf = item["cold_shelf_hours"] if mode == "Cold Storage" else item["ambient_shelf_hours"]
            
            for step in range(0, total_steps, 1):
                curr_time = start_time + timedelta(hours=step)
                hour_of_day = curr_time.hour
                
                # Diurnal ambient temperature in Sri Lanka (27.5°C at 5 AM to 33.8°C at 2 PM)
                sri_lanka_ambient_temp = 28.0 + 4.5 * math.sin(math.pi * (hour_of_day - 8) / 14) + random.gauss(0, 0.4)
                sri_lanka_ambient_hum = 88.0 - 14.0 * math.sin(math.pi * (hour_of_day - 8) / 14) + random.gauss(0, 1.2)
                sri_lanka_ambient_hum = max(68.0, min(96.0, sri_lanka_ambient_hum))

                # Environmental Simulation by Mode
                if mode == "Cold Storage":
                    storage_loc = item["chamber_cold"]
                    storage_type = "Cold Storage Vault"
                    # Kitchen rush door cycles (11:30 - 14:00 Lunch, 18:30 - 21:30 Dinner)
                    door_rush = 1.8 if (11 <= hour_of_day <= 14 or 18 <= hour_of_day <= 21) else 0.0
                    temp = item["base_cold_temp"] + door_rush * random.uniform(0.4, 1.2) + random.gauss(0, 0.35)
                    hum = item["base_cold_hum"] - door_rush * 3.0 + random.gauss(0, 0.8)
                    hum = max(75.0, min(98.0, hum))
                    thermal_stress = max(0.0, (temp - item["base_cold_temp"]) / 5.0)
                
                elif mode == "Ambient Tropical":
                    storage_loc = item["chamber_ambient"]
                    storage_type = "Ambient Kitchen / Storage Rack"
                    temp = sri_lanka_ambient_temp
                    hum = sri_lanka_ambient_hum
                    thermal_stress = max(1.0, (temp - 25.0) / 4.0)
                
                else: # Cold Chain Abuse (e.g. Compressor failure at step 24 or door left wide open)
                    storage_loc = item["chamber_cold"] + " (Abuse Incident)"
                    storage_type = "Faulty / Abused Cold Storage"
                    if step < 20:
                        temp = item["base_cold_temp"] + random.gauss(0, 0.4)
                        hum = item["base_cold_hum"] + random.gauss(0, 1.0)
                        thermal_stress = 0.1
                    else:
                        # Rapid temperature rise to tropical ambient
                        warmup = min(1.0, (step - 20) / 12.0)
                        temp = item["base_cold_temp"] + (sri_lanka_ambient_temp - item["base_cold_temp"]) * warmup + random.gauss(0, 0.5)
                        hum = item["base_cold_hum"] + (sri_lanka_ambient_hum - item["base_cold_hum"]) * warmup + random.gauss(0, 1.5)
                        thermal_stress = max(0.5, (temp - 10.0) / 3.5)

                # Biochemical Spoilage & Decay Kinetic Modeling
                # Effective aging hours accelerates under thermal stress (Q10 biological law)
                aging_rate = 1.0 * (1.8 ** ((temp - (item['base_cold_temp'] if mode == "Cold Storage" else 28.0)) / 10.0))
                effective_shelf_hours = nominal_shelf / max(0.5, aging_rate if mode != "Cold Storage" else (1.0 + thermal_stress * 0.8))
                
                # Progress fraction [0.0 = completely fresh, 1.0 = nominal end of shelf life, >1.0 = spoiled]
                decay_fraction = min(2.0, step / max(1.0, effective_shelf_hours))
                
                # Sigmoidal Spoilage Probability
                spoilage_prob = 1.0 / (1.0 + math.exp(-6.5 * (decay_fraction - 0.78)))
                spoilage_percentage = round(spoilage_prob * 100.0, 2)
                
                # Remaining Shelf-Life (hours)
                remaining_rsl = max(0.0, round(effective_shelf_hours * (1.0 - (decay_fraction / 1.1)), 1))
                if spoilage_percentage >= 90.0:
                    remaining_rsl = 0.0

                # Sensor Emission Dynamics:
                # 1. CO2 (Respiration + Microbial Activity)
                if item["climacteric"]:
                    # Climacteric peak around decay_fraction 0.55 - 0.75
                    climacteric_boost = math.exp(-((decay_fraction - 0.65) ** 2) / 0.04) * 1100.0
                else:
                    climacteric_boost = 0.0
                
                microbial_co2 = (item["max_co2_spoil"] - item["base_co2"]) * (spoilage_prob ** 1.8)
                co2 = item["base_co2"] + climacteric_boost + microbial_co2 + random.gauss(0, 25.0)
                co2 = round(max(380.0, min(5000.0, co2)), 1)

                # 2. VOC & Ethylene (C2H4 / Ethanol / Esters)
                if item["climacteric"]:
                    ethylene_peak = math.exp(-((decay_fraction - 0.60) ** 2) / 0.05) * 2.2
                else:
                    ethylene_peak = 0.0
                fermentation_voc = (item["max_voc_spoil"] - item["base_voc"]) * (spoilage_prob ** 1.5)
                voc = item["base_voc"] + ethylene_peak + fermentation_voc + random.gauss(0, 0.05)
                voc = round(max(0.05, min(15.0, voc)), 3)

                # 3. Ammonia (NH3) & Amines (ppm)
                nh3_spike = (item["max_nh3_spoil"] - item["base_nh3"]) * (spoilage_prob ** 2.2)
                nh3 = item["base_nh3"] + nh3_spike + random.gauss(0, 0.003)
                nh3 = round(max(0.005, min(2.5, nh3)), 4)

                # 4. Transpirational Weight Loss (kg)
                transpiration_loss_pct = min(18.0, (decay_fraction * 7.5) + (thermal_stress * 1.5))
                current_weight = round(item["initial_weight"] * (1.0 - (transpiration_loss_pct / 100.0)), 3)

                # Quality Grade Classification
                if spoilage_percentage < 15.0:
                    quality_grade = "Grade A (Prime Fresh)"
                    risk_level = "Low"
                    action = "Optimal Quality: Maintain current storage parameters."
                elif spoilage_percentage < 40.0:
                    quality_grade = "Grade B (Good / Ripe)"
                    risk_level = "Low"
                    action = "Normal Consumption: Ideal for daily restaurant kitchen orders."
                elif spoilage_percentage < 70.0:
                    quality_grade = "Grade C (Consumable / Fast-Track)"
                    risk_level = "Medium"
                    action = f"Expedite Usage: Priority for salad bar, juices, or buffet prep within {int(remaining_rsl)}h."
                elif spoilage_percentage < 88.0:
                    quality_grade = "Grade D (Degraded / Overripe)"
                    risk_level = "High"
                    action = "Critical Alert: High ethylene & respiration. Cook immediately or isolate from other produce."
                else:
                    quality_grade = "Grade F (Spoiled / Decomposed)"
                    risk_level = "Critical"
                    action = "Discard & Isolate: Spoilage detected. Discard immediately to prevent cross-contamination."

                # CSV Record
                row = {
                    "timestamp": curr_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "device_id": item["device_node"],
                    "batch_id": batch_id,
                    "produce_name": item["produce_name"],
                    "category": item["category"],
                    "botanical_variety": item["variety"],
                    "origin_region": item["origin"],
                    "storage_type": storage_type,
                    "storage_location": storage_loc,
                    "storage_duration_hours": step,
                    "temperature_celsius": round(temp, 2),
                    "humidity_percentage": round(hum, 2),
                    "ammonia_nh3_ppm": nh3,
                    "co2_ppm": co2,
                    "voc_ethylene_ppm": voc,
                    "current_weight_kg": current_weight,
                    "weight_loss_percentage": round(transpiration_loss_pct, 2),
                    "spoilage_probability_pct": spoilage_percentage,
                    "remaining_shelf_life_hours": remaining_rsl,
                    "quality_grade": quality_grade,
                    "risk_level": risk_level,
                    "recommended_action": action
                }
                rows.append(row)

    # Write CSV
    fieldnames = list(rows[0].keys())
    with open(output_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Write JSON if requested
    if output_json_path:
        with open(output_json_path, mode="w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2)

    print(f"Successfully generated {len(rows)} IoT sensor telemetry records for Sri Lankan Fruits & Vegetables.")
    print(f"Saved to: {output_csv_path}")
    if output_json_path:
        print(f"JSON Saved to: {output_json_path}")
    return len(rows)

if __name__ == "__main__":
    csv_file = os.path.join(os.path.dirname(__file__), "sri_lanka_fruits_veg_iot_dataset.csv")
    json_file = os.path.join(os.path.dirname(__file__), "sri_lanka_fruits_veg_iot_dataset.json")
    create_fruits_vegetables_dataset(csv_file, json_file)
