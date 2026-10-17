"""
Sri Lankan IoT Fruit & Vegetable Spoilage Telemetry Dataset Generator
Comprehensive 47-Produce Multi-Modal Dataset for AI-Based Food Spoilage Prediction
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)
"""

import csv
import json
import math
import random
import os
from datetime import datetime, timedelta

PRODUCE_PROFILES = [
    # ==========================================
    # --- FRUITS (20 COMMODITIES) ---
    # ==========================================
    {
        "produce_name": "Embul Banana (Ambul Kesel)",
        "category": "Fruit",
        "variety": "Musa acuminata (Embul)",
        "climacteric": True,
        "origin": "Embilipitiya / Gampaha, Sri Lanka",
        "base_cold_temp": 12.5,
        "base_cold_hum": 90.0,
        "cold_shelf_hours": 168.0,
        "ambient_shelf_hours": 72.0,
        "initial_weight": 4.5,
        "base_nh3": 0.015,
        "base_co2": 520.0,
        "base_voc": 0.30,
        "max_voc_spoil": 5.80,
        "max_co2_spoil": 2400.0,
        "max_nh3_spoil": 0.18,
        "chamber_cold": "Chamber 1: Tropical Fruit Chiller (12°C)",
        "chamber_ambient": "Ambient Fruit Storage Rack"
    },
    {
        "produce_name": "Karthakolomban Mango",
        "category": "Fruit",
        "variety": "Mangifera indica (Karthakolomban)",
        "climacteric": True,
        "origin": "Jaffna / Vavuniya, Sri Lanka",
        "base_cold_temp": 11.0,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 192.0,
        "ambient_shelf_hours": 84.0,
        "initial_weight": 5.0,
        "base_nh3": 0.012,
        "base_co2": 490.0,
        "base_voc": 0.25,
        "max_voc_spoil": 5.20,
        "max_co2_spoil": 2200.0,
        "max_nh3_spoil": 0.15,
        "chamber_cold": "Chamber 1: Tropical Fruit Chiller (11°C)",
        "chamber_ambient": "Ambient Fruit Storage Rack"
    },
    {
        "produce_name": "Red Lady Papaya (Rathu Papol)",
        "category": "Fruit",
        "variety": "Carica papaya (Red Lady F1)",
        "climacteric": True,
        "origin": "Anuradhapura / Kurunegala, Sri Lanka",
        "base_cold_temp": 9.5,
        "base_cold_hum": 89.0,
        "cold_shelf_hours": 144.0,
        "ambient_shelf_hours": 60.0,
        "initial_weight": 6.2,
        "base_nh3": 0.018,
        "base_co2": 510.0,
        "base_voc": 0.28,
        "max_voc_spoil": 4.90,
        "max_co2_spoil": 2350.0,
        "max_nh3_spoil": 0.22,
        "chamber_cold": "Chamber 1: Tropical Fruit Chiller (10°C)",
        "chamber_ambient": "Ambient Prep Counter"
    },
    {
        "produce_name": "Mauritius Pineapple (Gampaha Annasi)",
        "category": "Fruit",
        "variety": "Ananas comosus (Mauritius)",
        "climacteric": False,
        "origin": "Giriulla / Gampaha, Sri Lanka",
        "base_cold_temp": 8.5,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 216.0,
        "ambient_shelf_hours": 96.0,
        "initial_weight": 5.8,
        "base_nh3": 0.010,
        "base_co2": 460.0,
        "base_voc": 0.22,
        "max_voc_spoil": 4.50,
        "max_co2_spoil": 1950.0,
        "max_nh3_spoil": 0.12,
        "chamber_cold": "Chamber 2: Low-Temp Produce Chiller (8°C)",
        "chamber_ambient": "Ambient Fruit Storage Rack"
    },
    {
        "produce_name": "Sri Lankan Avocado (Butter Fruit)",
        "category": "Fruit",
        "variety": "Persea americana (Local Butter)",
        "climacteric": True,
        "origin": "Kandy / Bandarawela, Sri Lanka",
        "base_cold_temp": 7.5,
        "base_cold_hum": 90.0,
        "cold_shelf_hours": 180.0,
        "ambient_shelf_hours": 72.0,
        "initial_weight": 3.5,
        "base_nh3": 0.014,
        "base_co2": 530.0,
        "base_voc": 0.32,
        "max_voc_spoil": 5.60,
        "max_co2_spoil": 2500.0,
        "max_nh3_spoil": 0.20,
        "chamber_cold": "Chamber 2: Low-Temp Produce Chiller (8°C)",
        "chamber_ambient": "Ambient Kitchen Display Rack"
    },
    {
        "produce_name": "Peach",
        "category": "Fruit",
        "variety": "Prunus persica (Golden Queen / Nectarine)",
        "climacteric": True,
        "origin": "Nuwara Eliya / Imported, Sri Lanka",
        "base_cold_temp": 2.0,
        "base_cold_hum": 92.0,
        "cold_shelf_hours": 240.0,
        "ambient_shelf_hours": 72.0,
        "initial_weight": 3.0,
        "base_nh3": 0.012,
        "base_co2": 480.0,
        "base_voc": 0.26,
        "max_voc_spoil": 5.40,
        "max_co2_spoil": 2300.0,
        "max_nh3_spoil": 0.16,
        "chamber_cold": "Chamber 2: Low-Temp Produce Chiller (2°C)",
        "chamber_ambient": "Ambient Display Basket"
    },
    {
        "produce_name": "Fresh Apple",
        "category": "Fruit",
        "variety": "Malus domestica (Fuji / Gala / Granny Smith)",
        "climacteric": True,
        "origin": "Imported Cold Vault, Sri Lanka",
        "base_cold_temp": 1.5,
        "base_cold_hum": 93.0,
        "cold_shelf_hours": 720.0,
        "ambient_shelf_hours": 168.0,
        "initial_weight": 6.0,
        "base_nh3": 0.008,
        "base_co2": 440.0,
        "base_voc": 0.20,
        "max_voc_spoil": 4.80,
        "max_co2_spoil": 1800.0,
        "max_nh3_spoil": 0.11,
        "chamber_cold": "Chamber 2: Controlled Atmosphere Fruit Chiller (1.5°C)",
        "chamber_ambient": "Ambient Dining Display"
    },
    {
        "produce_name": "Fresh Strawberry",
        "category": "Fruit",
        "variety": "Fragaria × ananassa (Ambepussa / Nuwara Eliya)",
        "climacteric": False,
        "origin": "Nuwara Eliya / Ambepussa, Sri Lanka",
        "base_cold_temp": 1.0,
        "base_cold_hum": 95.0,
        "cold_shelf_hours": 120.0,
        "ambient_shelf_hours": 36.0,
        "initial_weight": 1.5,
        "base_nh3": 0.016,
        "base_co2": 520.0,
        "base_voc": 0.35,
        "max_voc_spoil": 6.20,
        "max_co2_spoil": 2600.0,
        "max_nh3_spoil": 0.24,
        "chamber_cold": "Chamber 3: Berry Crisper Vault (1°C)",
        "chamber_ambient": "Ambient Dessert Prep Counter"
    },
    {
        "produce_name": "Orange / Citrus",
        "category": "Fruit",
        "variety": "Citrus sinensis (Bibile Sweet Orange)",
        "climacteric": False,
        "origin": "Bibile / Monaragala, Sri Lanka",
        "base_cold_temp": 5.0,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 360.0,
        "ambient_shelf_hours": 120.0,
        "initial_weight": 5.0,
        "base_nh3": 0.010,
        "base_co2": 450.0,
        "base_voc": 0.22,
        "max_voc_spoil": 4.60,
        "max_co2_spoil": 1900.0,
        "max_nh3_spoil": 0.13,
        "chamber_cold": "Chamber 2: Citrus Chiller (5°C)",
        "chamber_ambient": "Bar Juicing Station"
    },
    {
        "produce_name": "Lime / Lemon",
        "category": "Fruit",
        "variety": "Citrus aurantifolia (Local Dehi)",
        "climacteric": False,
        "origin": "Monaragala / Wellawaya, Sri Lanka",
        "base_cold_temp": 9.0,
        "base_cold_hum": 87.0,
        "cold_shelf_hours": 420.0,
        "ambient_shelf_hours": 144.0,
        "initial_weight": 2.5,
        "base_nh3": 0.009,
        "base_co2": 430.0,
        "base_voc": 0.18,
        "max_voc_spoil": 3.80,
        "max_co2_spoil": 1700.0,
        "max_nh3_spoil": 0.12,
        "chamber_cold": "Chamber 2: Citrus Chiller (9°C)",
        "chamber_ambient": "Bar Prep Station"
    },
    {
        "produce_name": "Grapes",
        "category": "Fruit",
        "variety": "Vitis vinifera (Jaffna Red / Imported Green)",
        "climacteric": False,
        "origin": "Jaffna Peninsula, Sri Lanka",
        "base_cold_temp": 1.0,
        "base_cold_hum": 94.0,
        "cold_shelf_hours": 240.0,
        "ambient_shelf_hours": 60.0,
        "initial_weight": 3.0,
        "base_nh3": 0.014,
        "base_co2": 490.0,
        "base_voc": 0.28,
        "max_voc_spoil": 5.10,
        "max_co2_spoil": 2100.0,
        "max_nh3_spoil": 0.17,
        "chamber_cold": "Chamber 3: Cold Fruit Crisper (1°C)",
        "chamber_ambient": "Salad Bar Display"
    },
    {
        "produce_name": "Watermelon",
        "category": "Fruit",
        "variety": "Citrullus lanatus (Thanamalwila Komadu)",
        "climacteric": False,
        "origin": "Thanamalwila / Hambantota, Sri Lanka",
        "base_cold_temp": 12.0,
        "base_cold_hum": 85.0,
        "cold_shelf_hours": 336.0,
        "ambient_shelf_hours": 120.0,
        "initial_weight": 10.0,
        "base_nh3": 0.011,
        "base_co2": 470.0,
        "base_voc": 0.20,
        "max_voc_spoil": 4.20,
        "max_co2_spoil": 1950.0,
        "max_nh3_spoil": 0.15,
        "chamber_cold": "Chamber 1: Melon Storage Chiller (12°C)",
        "chamber_ambient": "Ambient Kitchen Platform"
    },
    {
        "produce_name": "Guava (Pera)",
        "category": "Fruit",
        "variety": "Psidium guajava (Bangkok Apple Guava)",
        "climacteric": True,
        "origin": "Mirigama / Horana, Sri Lanka",
        "base_cold_temp": 8.0,
        "base_cold_hum": 90.0,
        "cold_shelf_hours": 192.0,
        "ambient_shelf_hours": 60.0,
        "initial_weight": 4.0,
        "base_nh3": 0.013,
        "base_co2": 510.0,
        "base_voc": 0.27,
        "max_voc_spoil": 5.30,
        "max_co2_spoil": 2250.0,
        "max_nh3_spoil": 0.16,
        "chamber_cold": "Chamber 2: Low-Temp Produce Chiller (8°C)",
        "chamber_ambient": "Ambient Fruit Rack"
    },
    {
        "produce_name": "Pomegranate (Delum)",
        "category": "Fruit",
        "variety": "Punica granatum (Local Red)",
        "climacteric": False,
        "origin": "Kalpitiya / Mannar, Sri Lanka",
        "base_cold_temp": 6.0,
        "base_cold_hum": 90.0,
        "cold_shelf_hours": 480.0,
        "ambient_shelf_hours": 168.0,
        "initial_weight": 3.5,
        "base_nh3": 0.009,
        "base_co2": 440.0,
        "base_voc": 0.19,
        "max_voc_spoil": 3.90,
        "max_co2_spoil": 1800.0,
        "max_nh3_spoil": 0.12,
        "chamber_cold": "Chamber 2: Fruit Chiller (6°C)",
        "chamber_ambient": "Ambient Fruit Basket"
    },
    {
        "produce_name": "Passion Fruit",
        "category": "Fruit",
        "variety": "Passiflora edulis (Local Purple/Yellow)",
        "climacteric": True,
        "origin": "Bandarawela / Ratnapura, Sri Lanka",
        "base_cold_temp": 8.5,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 240.0,
        "ambient_shelf_hours": 84.0,
        "initial_weight": 3.0,
        "base_nh3": 0.012,
        "base_co2": 500.0,
        "base_voc": 0.29,
        "max_voc_spoil": 5.50,
        "max_co2_spoil": 2300.0,
        "max_nh3_spoil": 0.15,
        "chamber_cold": "Chamber 2: Fruit Chiller (8.5°C)",
        "chamber_ambient": "Beverage Prep Station"
    },
    {
        "produce_name": "Dragon Fruit",
        "category": "Fruit",
        "variety": "Selenicereus undatus (Red Flesh / White Flesh)",
        "climacteric": False,
        "origin": "Gampaha / Kurunegala, Sri Lanka",
        "base_cold_temp": 7.0,
        "base_cold_hum": 90.0,
        "cold_shelf_hours": 288.0,
        "ambient_shelf_hours": 96.0,
        "initial_weight": 4.5,
        "base_nh3": 0.010,
        "base_co2": 460.0,
        "base_voc": 0.22,
        "max_voc_spoil": 4.40,
        "max_co2_spoil": 1950.0,
        "max_nh3_spoil": 0.14,
        "chamber_cold": "Chamber 2: Fruit Chiller (7°C)",
        "chamber_ambient": "Dessert Display"
    },
    {
        "produce_name": "Jackfruit / Kos / Varaka",
        "category": "Fruit",
        "variety": "Artocarpus heterophyllus (Honey Varaka)",
        "climacteric": True,
        "origin": "Kegalle / Matale, Sri Lanka",
        "base_cold_temp": 11.0,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 168.0,
        "ambient_shelf_hours": 48.0,
        "initial_weight": 12.0,
        "base_nh3": 0.015,
        "base_co2": 540.0,
        "base_voc": 0.38,
        "max_voc_spoil": 6.80,
        "max_co2_spoil": 2800.0,
        "max_nh3_spoil": 0.22,
        "chamber_cold": "Chamber 1: Tropical Chiller (11°C)",
        "chamber_ambient": "Kitchen Butchery / Prep"
    },
    {
        "produce_name": "Fresh Pear",
        "category": "Fruit",
        "variety": "Pyrus communis (Packham / D'Anjou)",
        "climacteric": True,
        "origin": "Imported Cold Chain, Sri Lanka",
        "base_cold_temp": 1.5,
        "base_cold_hum": 93.0,
        "cold_shelf_hours": 360.0,
        "ambient_shelf_hours": 96.0,
        "initial_weight": 4.0,
        "base_nh3": 0.010,
        "base_co2": 460.0,
        "base_voc": 0.24,
        "max_voc_spoil": 5.00,
        "max_co2_spoil": 2100.0,
        "max_nh3_spoil": 0.14,
        "chamber_cold": "Chamber 2: Low-Temp Chiller (1.5°C)",
        "chamber_ambient": "Fruit Display"
    },
    {
        "produce_name": "Plum",
        "category": "Fruit",
        "variety": "Prunus domestica (Black Amber)",
        "climacteric": True,
        "origin": "Imported / Nuwara Eliya, Sri Lanka",
        "base_cold_temp": 1.5,
        "base_cold_hum": 92.0,
        "cold_shelf_hours": 240.0,
        "ambient_shelf_hours": 72.0,
        "initial_weight": 3.0,
        "base_nh3": 0.012,
        "base_co2": 480.0,
        "base_voc": 0.28,
        "max_voc_spoil": 5.30,
        "max_co2_spoil": 2200.0,
        "max_nh3_spoil": 0.15,
        "chamber_cold": "Chamber 2: Low-Temp Chiller (1.5°C)",
        "chamber_ambient": "Fruit Display"
    },
    {
        "produce_name": "Kiwi Fruit",
        "category": "Fruit",
        "variety": "Actinidia deliciosa (Hayward)",
        "climacteric": True,
        "origin": "Imported Cold Chain, Sri Lanka",
        "base_cold_temp": 1.0,
        "base_cold_hum": 94.0,
        "cold_shelf_hours": 480.0,
        "ambient_shelf_hours": 120.0,
        "initial_weight": 2.5,
        "base_nh3": 0.010,
        "base_co2": 450.0,
        "base_voc": 0.22,
        "max_voc_spoil": 4.90,
        "max_co2_spoil": 2000.0,
        "max_nh3_spoil": 0.13,
        "chamber_cold": "Chamber 2: Low-Temp Chiller (1°C)",
        "chamber_ambient": "Breakfast Buffet Station"
    },

    # ==========================================
    # --- VEGETABLES (27 COMMODITIES) ---
    # ==========================================
    {
        "produce_name": "Local Tomatoes (Thakkali)",
        "category": "Vegetable",
        "variety": "Solanum lycopersicum (Maheshi / Padma)",
        "climacteric": True,
        "origin": "Dambulla / Matale, Sri Lanka",
        "base_cold_temp": 10.5,
        "base_cold_hum": 89.0,
        "cold_shelf_hours": 168.0,
        "ambient_shelf_hours": 60.0,
        "initial_weight": 5.0,
        "base_nh3": 0.015,
        "base_co2": 510.0,
        "base_voc": 0.26,
        "max_voc_spoil": 4.80,
        "max_co2_spoil": 2150.0,
        "max_nh3_spoil": 0.20,
        "chamber_cold": "Chamber 1: Produce Chiller (10°C)",
        "chamber_ambient": "Prep Table Storage Crate"
    },
    {
        "produce_name": "Nuwara Eliya Carrots",
        "category": "Vegetable",
        "variety": "Daucus carota (Upcountry Kuroda)",
        "climacteric": False,
        "origin": "Nuwara Eliya / Kandapola, Sri Lanka",
        "base_cold_temp": 3.5,
        "base_cold_hum": 92.0,
        "cold_shelf_hours": 360.0,
        "ambient_shelf_hours": 120.0,
        "initial_weight": 8.0,
        "base_nh3": 0.010,
        "base_co2": 440.0,
        "base_voc": 0.12,
        "max_voc_spoil": 2.60,
        "max_co2_spoil": 1600.0,
        "max_nh3_spoil": 0.14,
        "chamber_cold": "Chamber 4: Root & Solid Vegetable Vault (3°C)",
        "chamber_ambient": "Ambient Root Veg Rack"
    },
    {
        "produce_name": "Spinach / Leafy Greens",
        "category": "Vegetable",
        "variety": "Spinacia oleracea (English Spinach)",
        "climacteric": False,
        "origin": "Nuwara Eliya, Sri Lanka",
        "base_cold_temp": 3.0,
        "base_cold_hum": 95.0,
        "cold_shelf_hours": 120.0,
        "ambient_shelf_hours": 36.0,
        "initial_weight": 2.5,
        "base_nh3": 0.022,
        "base_co2": 580.0,
        "base_voc": 0.17,
        "max_voc_spoil": 3.40,
        "max_co2_spoil": 2700.0,
        "max_nh3_spoil": 0.38,
        "chamber_cold": "Chamber 3: Leafy Greens Crisper (3°C)",
        "chamber_ambient": "Open Kitchen Basket"
    },
    {
        "produce_name": "Gotukola (Centella Asiatica)",
        "category": "Vegetable",
        "variety": "Centella asiatica (Local Leafy)",
        "climacteric": False,
        "origin": "Kalutara / Western Province, Sri Lanka",
        "base_cold_temp": 4.5,
        "base_cold_hum": 94.0,
        "cold_shelf_hours": 96.0,
        "ambient_shelf_hours": 24.0,
        "initial_weight": 2.0,
        "base_nh3": 0.020,
        "base_co2": 580.0,
        "base_voc": 0.15,
        "max_voc_spoil": 3.10,
        "max_co2_spoil": 2700.0,
        "max_nh3_spoil": 0.38,
        "chamber_cold": "Chamber 3: Leafy Greens Crisper (4°C)",
        "chamber_ambient": "Open Vegetable Basket"
    },
    {
        "produce_name": "Kankun (Water Spinach)",
        "category": "Vegetable",
        "variety": "Ipomoea aquatica (Sri Lankan Green)",
        "climacteric": False,
        "origin": "Bolgoda / Gampaha, Sri Lanka",
        "base_cold_temp": 5.0,
        "base_cold_hum": 93.0,
        "cold_shelf_hours": 90.0,
        "ambient_shelf_hours": 28.0,
        "initial_weight": 2.5,
        "base_nh3": 0.022,
        "base_co2": 560.0,
        "base_voc": 0.18,
        "max_voc_spoil": 3.40,
        "max_co2_spoil": 2650.0,
        "max_nh3_spoil": 0.35,
        "chamber_cold": "Chamber 3: Leafy Greens Crisper (5°C)",
        "chamber_ambient": "Open Vegetable Basket"
    },
    {
        "produce_name": "Mukunuwenna (Alternanthera)",
        "category": "Vegetable",
        "variety": "Alternanthera sessilis",
        "climacteric": False,
        "origin": "Bandaragama, Sri Lanka",
        "base_cold_temp": 4.5,
        "base_cold_hum": 94.0,
        "cold_shelf_hours": 84.0,
        "ambient_shelf_hours": 22.0,
        "initial_weight": 2.0,
        "base_nh3": 0.025,
        "base_co2": 590.0,
        "base_voc": 0.16,
        "max_voc_spoil": 3.20,
        "max_co2_spoil": 2800.0,
        "max_nh3_spoil": 0.40,
        "chamber_cold": "Chamber 3: Leafy Greens Crisper (4°C)",
        "chamber_ambient": "Open Vegetable Basket"
    },
    {
        "produce_name": "Romaine Lettuce",
        "category": "Vegetable",
        "variety": "Lactuca sativa (Romaine / Butterhead)",
        "climacteric": False,
        "origin": "Nuwara Eliya / Welimada, Sri Lanka",
        "base_cold_temp": 3.0,
        "base_cold_hum": 95.0,
        "cold_shelf_hours": 144.0,
        "ambient_shelf_hours": 36.0,
        "initial_weight": 3.0,
        "base_nh3": 0.018,
        "base_co2": 520.0,
        "base_voc": 0.15,
        "max_voc_spoil": 3.00,
        "max_co2_spoil": 2400.0,
        "max_nh3_spoil": 0.32,
        "chamber_cold": "Chamber 3: Leafy Greens Crisper (3°C)",
        "chamber_ambient": "Salad Prep Line"
    },
    {
        "produce_name": "Green Chillies (Amu Miris)",
        "category": "Vegetable",
        "variety": "Capsicum annuum (MI-2 Local)",
        "climacteric": False,
        "origin": "Anuradhapura / Mahailluppallama, Sri Lanka",
        "base_cold_temp": 7.5,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 192.0,
        "ambient_shelf_hours": 72.0,
        "initial_weight": 3.0,
        "base_nh3": 0.012,
        "base_co2": 470.0,
        "base_voc": 0.20,
        "max_voc_spoil": 3.50,
        "max_co2_spoil": 1850.0,
        "max_nh3_spoil": 0.16,
        "chamber_cold": "Chamber 2: Vegetable Chiller (7.5°C)",
        "chamber_ambient": "Kitchen Spice / Veg Bin"
    },
    {
        "produce_name": "Capsicum / Bell Pepper",
        "category": "Vegetable",
        "variety": "Capsicum annuum grossum (Sweet Pepper)",
        "climacteric": False,
        "origin": "Badulla / Nuwara Eliya, Sri Lanka",
        "base_cold_temp": 7.0,
        "base_cold_hum": 90.0,
        "cold_shelf_hours": 240.0,
        "ambient_shelf_hours": 84.0,
        "initial_weight": 4.5,
        "base_nh3": 0.011,
        "base_co2": 480.0,
        "base_voc": 0.19,
        "max_voc_spoil": 3.60,
        "max_co2_spoil": 1900.0,
        "max_nh3_spoil": 0.17,
        "chamber_cold": "Chamber 2: Vegetable Chiller (7°C)",
        "chamber_ambient": "Prep Table Storage"
    },
    {
        "produce_name": "Cucumber (Pipinna)",
        "category": "Vegetable",
        "variety": "Cucumis sativus (Local Pipinna)",
        "climacteric": False,
        "origin": "Kurunegala / Matale, Sri Lanka",
        "base_cold_temp": 10.0,
        "base_cold_hum": 92.0,
        "cold_shelf_hours": 216.0,
        "ambient_shelf_hours": 72.0,
        "initial_weight": 6.0,
        "base_nh3": 0.013,
        "base_co2": 490.0,
        "base_voc": 0.18,
        "max_voc_spoil": 3.80,
        "max_co2_spoil": 2050.0,
        "max_nh3_spoil": 0.19,
        "chamber_cold": "Chamber 1: Low Chilling Sensitive Vault (10°C)",
        "chamber_ambient": "Kitchen Salad Rack"
    },
    {
        "produce_name": "Green Beans (Bonchi)",
        "category": "Vegetable",
        "variety": "Phaseolus vulgaris (Welimada Bush Bean)",
        "climacteric": False,
        "origin": "Welimada / Nuwara Eliya, Sri Lanka",
        "base_cold_temp": 6.0,
        "base_cold_hum": 91.0,
        "cold_shelf_hours": 144.0,
        "ambient_shelf_hours": 48.0,
        "initial_weight": 4.0,
        "base_nh3": 0.016,
        "base_co2": 520.0,
        "base_voc": 0.17,
        "max_voc_spoil": 3.00,
        "max_co2_spoil": 2100.0,
        "max_nh3_spoil": 0.22,
        "chamber_cold": "Chamber 3: Vegetable Crisper (6°C)",
        "chamber_ambient": "Kitchen Shelf"
    },
    {
        "produce_name": "Potato (Ala)",
        "category": "Vegetable",
        "variety": "Solanum tuberosum (Granola / Welimada)",
        "climacteric": False,
        "origin": "Badulla / Jaffna / Welimada, Sri Lanka",
        "base_cold_temp": 8.0,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 720.0,
        "ambient_shelf_hours": 240.0,
        "initial_weight": 15.0,
        "base_nh3": 0.008,
        "base_co2": 420.0,
        "base_voc": 0.10,
        "max_voc_spoil": 2.40,
        "max_co2_spoil": 1550.0,
        "max_nh3_spoil": 0.12,
        "chamber_cold": "Chamber 4: Root Cellar (8°C, Dark)",
        "chamber_ambient": "Dry Store Bin"
    },
    {
        "produce_name": "Eggplant (Brinjal / Wambatu)",
        "category": "Vegetable",
        "variety": "Solanum melongena (Thinnavely Purple / Lena)",
        "climacteric": False,
        "origin": "Kandy / Matale / Jaffna, Sri Lanka",
        "base_cold_temp": 10.0,
        "base_cold_hum": 90.0,
        "cold_shelf_hours": 192.0,
        "ambient_shelf_hours": 72.0,
        "initial_weight": 5.0,
        "base_nh3": 0.012,
        "base_co2": 480.0,
        "base_voc": 0.18,
        "max_voc_spoil": 3.50,
        "max_co2_spoil": 1950.0,
        "max_nh3_spoil": 0.18,
        "chamber_cold": "Chamber 1: Low Chilling Sensitive Vault (10°C)",
        "chamber_ambient": "Kitchen Veg Rack"
    },
    {
        "produce_name": "Red Onion (Rathu Lunu)",
        "category": "Vegetable",
        "variety": "Allium cepa (Vethalan Shallot / B-Onion)",
        "climacteric": False,
        "origin": "Jaffna / Dambulla, Sri Lanka",
        "base_cold_temp": 4.0,
        "base_cold_hum": 70.0, # Low humidity to prevent bulb rot
        "cold_shelf_hours": 960.0,
        "ambient_shelf_hours": 360.0,
        "initial_weight": 10.0,
        "base_nh3": 0.015,
        "base_co2": 430.0,
        "base_voc": 0.35, # Sulfur allicin compounds
        "max_voc_spoil": 4.20,
        "max_co2_spoil": 1600.0,
        "max_nh3_spoil": 0.25,
        "chamber_cold": "Dry Cold Vault (4°C, 70% RH)",
        "chamber_ambient": "Dry Store Mesh Racks"
    },
    {
        "produce_name": "Garlic (Sudu Lunu)",
        "category": "Vegetable",
        "variety": "Allium sativum",
        "climacteric": False,
        "origin": "Imported / Welimada, Sri Lanka",
        "base_cold_temp": 2.0,
        "base_cold_hum": 68.0,
        "cold_shelf_hours": 1440.0,
        "ambient_shelf_hours": 480.0,
        "initial_weight": 5.0,
        "base_nh3": 0.012,
        "base_co2": 410.0,
        "base_voc": 0.40,
        "max_voc_spoil": 4.50,
        "max_co2_spoil": 1500.0,
        "max_nh3_spoil": 0.22,
        "chamber_cold": "Dry Cold Vault (2°C, 68% RH)",
        "chamber_ambient": "Dry Store Shelves"
    },
    {
        "produce_name": "Cabbage (Gova)",
        "category": "Vegetable",
        "variety": "Brassica oleracea var. capitata (Green Ball)",
        "climacteric": False,
        "origin": "Nuwara Eliya / Welimada, Sri Lanka",
        "base_cold_temp": 1.5,
        "base_cold_hum": 95.0,
        "cold_shelf_hours": 480.0,
        "ambient_shelf_hours": 120.0,
        "initial_weight": 7.0,
        "base_nh3": 0.014,
        "base_co2": 460.0,
        "base_voc": 0.22,
        "max_voc_spoil": 4.10,
        "max_co2_spoil": 2100.0,
        "max_nh3_spoil": 0.28,
        "chamber_cold": "Chamber 4: Solid Veg Vault (1.5°C)",
        "chamber_ambient": "Kitchen Storage Box"
    },
    {
        "produce_name": "Cauliflower",
        "category": "Vegetable",
        "variety": "Brassica oleracea var. botrytis (Snowball)",
        "climacteric": False,
        "origin": "Nuwara Eliya, Sri Lanka",
        "base_cold_temp": 2.0,
        "base_cold_hum": 94.0,
        "cold_shelf_hours": 240.0,
        "ambient_shelf_hours": 72.0,
        "initial_weight": 5.0,
        "base_nh3": 0.016,
        "base_co2": 490.0,
        "base_voc": 0.24,
        "max_voc_spoil": 4.30,
        "max_co2_spoil": 2200.0,
        "max_nh3_spoil": 0.30,
        "chamber_cold": "Chamber 4: Solid Veg Vault (2°C)",
        "chamber_ambient": "Kitchen Veg Rack"
    },
    {
        "produce_name": "Broccoli",
        "category": "Vegetable",
        "variety": "Brassica oleracea var. italica (Calabrese)",
        "climacteric": False,
        "origin": "Nuwara Eliya / Welimada, Sri Lanka",
        "base_cold_temp": 1.0,
        "base_cold_hum": 95.0,
        "cold_shelf_hours": 216.0,
        "ambient_shelf_hours": 48.0,
        "initial_weight": 4.0,
        "base_nh3": 0.018,
        "base_co2": 530.0,
        "base_voc": 0.25,
        "max_voc_spoil": 4.60,
        "max_co2_spoil": 2500.0,
        "max_nh3_spoil": 0.34,
        "chamber_cold": "Chamber 3: Leafy / Brassica Vault (1°C)",
        "chamber_ambient": "Kitchen Prep Table"
    },
    {
        "produce_name": "Beetroot",
        "category": "Vegetable",
        "variety": "Beta vulgaris (Crimson Globe)",
        "climacteric": False,
        "origin": "Kandapola / Welimada, Sri Lanka",
        "base_cold_temp": 2.5,
        "base_cold_hum": 92.0,
        "cold_shelf_hours": 480.0,
        "ambient_shelf_hours": 144.0,
        "initial_weight": 6.0,
        "base_nh3": 0.010,
        "base_co2": 440.0,
        "base_voc": 0.12,
        "max_voc_spoil": 2.80,
        "max_co2_spoil": 1700.0,
        "max_nh3_spoil": 0.15,
        "chamber_cold": "Chamber 4: Root Vault (2.5°C)",
        "chamber_ambient": "Root Store Bin"
    },
    {
        "produce_name": "Pumpkin (Wattakka)",
        "category": "Vegetable",
        "variety": "Cucurbita moschata (Ruhunu Wattakka)",
        "climacteric": False,
        "origin": "Monaragala / Polonnaruwa, Sri Lanka",
        "base_cold_temp": 12.0,
        "base_cold_hum": 75.0,
        "cold_shelf_hours": 960.0,
        "ambient_shelf_hours": 360.0,
        "initial_weight": 14.0,
        "base_nh3": 0.008,
        "base_co2": 430.0,
        "base_voc": 0.14,
        "max_voc_spoil": 3.00,
        "max_co2_spoil": 1800.0,
        "max_nh3_spoil": 0.14,
        "chamber_cold": "Chamber 1: Squash Store (12°C)",
        "chamber_ambient": "Ambient Kitchen Platform"
    },
    {
        "produce_name": "Bitter Gourd (Karawila)",
        "category": "Vegetable",
        "variety": "Momordica charantia (Thinnawely White)",
        "climacteric": False,
        "origin": "Dambulla / Anuradhapura, Sri Lanka",
        "base_cold_temp": 11.0,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 168.0,
        "ambient_shelf_hours": 60.0,
        "initial_weight": 3.5,
        "base_nh3": 0.014,
        "base_co2": 490.0,
        "base_voc": 0.18,
        "max_voc_spoil": 3.60,
        "max_co2_spoil": 2000.0,
        "max_nh3_spoil": 0.20,
        "chamber_cold": "Chamber 1: Low-Chilling Sensitive (11°C)",
        "chamber_ambient": "Kitchen Veg Rack"
    },
    {
        "produce_name": "Snake Gourd (Pathola)",
        "category": "Vegetable",
        "variety": "Trichosanthes cucumerina (TA-2)",
        "climacteric": False,
        "origin": "Kurunegala / Matale, Sri Lanka",
        "base_cold_temp": 11.0,
        "base_cold_hum": 88.0,
        "cold_shelf_hours": 144.0,
        "ambient_shelf_hours": 48.0,
        "initial_weight": 4.0,
        "base_nh3": 0.015,
        "base_co2": 500.0,
        "base_voc": 0.17,
        "max_voc_spoil": 3.40,
        "max_co2_spoil": 2100.0,
        "max_nh3_spoil": 0.21,
        "chamber_cold": "Chamber 1: Low-Chilling Sensitive (11°C)",
        "chamber_ambient": "Kitchen Veg Basket"
    },
    {
        "produce_name": "Ridge Gourd (Wetawalu)",
        "category": "Vegetable",
        "variety": "Luffa acutangula (Local Wetawalu)",
        "climacteric": False,
        "origin": "Gampaha / Kalutara, Sri Lanka",
        "base_cold_temp": 10.5,
        "base_cold_hum": 89.0,
        "cold_shelf_hours": 144.0,
        "ambient_shelf_hours": 48.0,
        "initial_weight": 3.5,
        "base_nh3": 0.016,
        "base_co2": 510.0,
        "base_voc": 0.18,
        "max_voc_spoil": 3.50,
        "max_co2_spoil": 2150.0,
        "max_nh3_spoil": 0.22,
        "chamber_cold": "Chamber 1: Low-Chilling Sensitive (10.5°C)",
        "chamber_ambient": "Kitchen Veg Basket"
    },
    {
        "produce_name": "Radish (Rabu)",
        "category": "Vegetable",
        "variety": "Raphanus sativus (Beeralu Rabu)",
        "climacteric": False,
        "origin": "Welimada / Nuwara Eliya, Sri Lanka",
        "base_cold_temp": 2.5,
        "base_cold_hum": 93.0,
        "cold_shelf_hours": 288.0,
        "ambient_shelf_hours": 96.0,
        "initial_weight": 5.0,
        "base_nh3": 0.014,
        "base_co2": 460.0,
        "base_voc": 0.20,
        "max_voc_spoil": 3.60,
        "max_co2_spoil": 1850.0,
        "max_nh3_spoil": 0.22,
        "chamber_cold": "Chamber 4: Root Vault (2.5°C)",
        "chamber_ambient": "Root Store Bin"
    },
    {
        "produce_name": "Okra (Bandakka / Ladies Finger)",
        "category": "Vegetable",
        "variety": "Abelmoschus esculentus (Haritha Local)",
        "climacteric": False,
        "origin": "Dambulla / Anuradhapura, Sri Lanka",
        "base_cold_temp": 9.0,
        "base_cold_hum": 90.0,
        "cold_shelf_hours": 144.0,
        "ambient_shelf_hours": 48.0,
        "initial_weight": 3.0,
        "base_nh3": 0.016,
        "base_co2": 520.0,
        "base_voc": 0.19,
        "max_voc_spoil": 3.50,
        "max_co2_spoil": 2200.0,
        "max_nh3_spoil": 0.24,
        "chamber_cold": "Chamber 1: Low-Chilling Sensitive (9°C)",
        "chamber_ambient": "Kitchen Veg Rack"
    },
    {
        "produce_name": "Mushroom (Bimmal)",
        "category": "Vegetable",
        "variety": "Pleurotus ostreatus (American Oyster)",
        "climacteric": False,
        "origin": "Kurunegala / Kegalle, Sri Lanka",
        "base_cold_temp": 2.0,
        "base_cold_hum": 92.0,
        "cold_shelf_hours": 120.0,
        "ambient_shelf_hours": 24.0,
        "initial_weight": 2.0,
        "base_nh3": 0.024,
        "base_co2": 590.0,
        "base_voc": 0.32,
        "max_voc_spoil": 5.80,
        "max_co2_spoil": 2900.0,
        "max_nh3_spoil": 0.42,
        "chamber_cold": "Chamber 3: Mushroom Crisper (2°C)",
        "chamber_ambient": "Kitchen Line Prep Tray"
    },
    {
        "produce_name": "Ginger (Inguru)",
        "category": "Vegetable",
        "variety": "Zingiber officinale (Rangoon / Local)",
        "climacteric": False,
        "origin": "Kurunegala / Giriulla, Sri Lanka",
        "base_cold_temp": 12.0,
        "base_cold_hum": 75.0,
        "cold_shelf_hours": 1200.0,
        "ambient_shelf_hours": 480.0,
        "initial_weight": 6.0,
        "base_nh3": 0.008,
        "base_co2": 410.0,
        "base_voc": 0.28,
        "max_voc_spoil": 3.20,
        "max_co2_spoil": 1500.0,
        "max_nh3_spoil": 0.12,
        "chamber_cold": "Chamber 4: Rhizome Store (12°C)",
        "chamber_ambient": "Dry Spice / Root Racks"
    }
]

def generate_comprehensive_iot_dataset(output_csv_path, output_json_path=None):
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    random.seed(42)

    start_time = datetime(2026, 8, 20, 6, 0, 0)
    rows = []
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
            # Subsample steps for fast, clean, high-density telemetry (sample every 2-3 hours)
            step_stride = 2 if total_steps > 150 else 1
            batch_id = f"BATCH-SL-{item['category'][:2].upper()}-{batch_counter}"
            batch_counter += 1
            
            nominal_shelf = item["cold_shelf_hours"] if mode == "Cold Storage" else item["ambient_shelf_hours"]
            
            for step in range(0, total_steps, step_stride):
                curr_time = start_time + timedelta(hours=step)
                hour_of_day = curr_time.hour
                
                # Diurnal ambient temperature in Sri Lanka (27.5°C to 33.8°C)
                sri_lanka_ambient_temp = 28.0 + 4.5 * math.sin(math.pi * (hour_of_day - 8) / 14) + random.gauss(0, 0.4)
                sri_lanka_ambient_hum = 88.0 - 14.0 * math.sin(math.pi * (hour_of_day - 8) / 14) + random.gauss(0, 1.2)
                sri_lanka_ambient_hum = max(68.0, min(96.0, sri_lanka_ambient_hum))

                if mode == "Cold Storage":
                    storage_loc = item["chamber_cold"]
                    storage_type = "Cold Storage Vault"
                    door_rush = 1.8 if (11 <= hour_of_day <= 14 or 18 <= hour_of_day <= 21) else 0.0
                    temp = item["base_cold_temp"] + door_rush * random.uniform(0.4, 1.2) + random.gauss(0, 0.35)
                    hum = item["base_cold_hum"] - door_rush * 3.0 + random.gauss(0, 0.8)
                    hum = max(70.0, min(98.0, hum))
                    thermal_stress = max(0.0, (temp - item["base_cold_temp"]) / 5.0)
                
                elif mode == "Ambient Tropical":
                    storage_loc = item["chamber_ambient"]
                    storage_type = "Ambient Kitchen / Storage Rack"
                    temp = sri_lanka_ambient_temp
                    hum = sri_lanka_ambient_hum
                    thermal_stress = max(1.0, (temp - 25.0) / 4.0)
                
                else: # Cold Chain Abuse
                    storage_loc = item["chamber_cold"] + " (Abuse Incident)"
                    storage_type = "Faulty / Abused Cold Storage"
                    if step < 20:
                        temp = item["base_cold_temp"] + random.gauss(0, 0.4)
                        hum = item["base_cold_hum"] + random.gauss(0, 1.0)
                        thermal_stress = 0.1
                    else:
                        warmup = min(1.0, (step - 20) / 12.0)
                        temp = item["base_cold_temp"] + (sri_lanka_ambient_temp - item["base_cold_temp"]) * warmup + random.gauss(0, 0.5)
                        hum = item["base_cold_hum"] + (sri_lanka_ambient_hum - item["base_cold_hum"]) * warmup + random.gauss(0, 1.5)
                        thermal_stress = max(0.5, (temp - 10.0) / 3.5)

                # Biochemical Spoilage & Decay Kinetic Modeling
                aging_rate = 1.0 * (1.8 ** ((temp - (item['base_cold_temp'] if mode == "Cold Storage" else 28.0)) / 10.0))
                effective_shelf_hours = nominal_shelf / max(0.5, aging_rate if mode != "Cold Storage" else (1.0 + thermal_stress * 0.8))
                decay_fraction = min(2.0, step / max(1.0, effective_shelf_hours))
                
                spoilage_prob = 1.0 / (1.0 + math.exp(-6.5 * (decay_fraction - 0.78)))
                spoilage_percentage = round(spoilage_prob * 100.0, 2)
                
                remaining_rsl = max(0.0, round(effective_shelf_hours * (1.0 - (decay_fraction / 1.1)), 1))
                if spoilage_percentage >= 90.0:
                    remaining_rsl = 0.0

                # Sensor Emission Dynamics
                if item.get("climacteric", False):
                    climacteric_boost = math.exp(-((decay_fraction - 0.65) ** 2) / 0.04) * 1100.0
                    ethylene_peak = math.exp(-((decay_fraction - 0.60) ** 2) / 0.05) * 2.2
                else:
                    climacteric_boost = 0.0
                    ethylene_peak = 0.0
                
                microbial_co2 = (item["max_co2_spoil"] - item["base_co2"]) * (spoilage_prob ** 1.8)
                co2 = round(max(380.0, min(5000.0, item["base_co2"] + climacteric_boost + microbial_co2 + random.gauss(0, 25.0))), 1)

                fermentation_voc = (item["max_voc_spoil"] - item["base_voc"]) * (spoilage_prob ** 1.5)
                voc = round(max(0.05, min(15.0, item["base_voc"] + ethylene_peak + fermentation_voc + random.gauss(0, 0.05))), 3)

                nh3_spike = (item["max_nh3_spoil"] - item["base_nh3"]) * (spoilage_prob ** 2.2)
                nh3 = round(max(0.005, min(2.5, item["base_nh3"] + nh3_spike + random.gauss(0, 0.003))), 4)

                transpiration_loss_pct = min(18.0, (decay_fraction * 7.5) + (thermal_stress * 1.5))
                current_weight = round(item["initial_weight"] * (1.0 - (transpiration_loss_pct / 100.0)), 3)

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
                    action = f"Expedite Usage: Priority for cooking, juices, or buffet prep within {int(remaining_rsl)}h."
                elif spoilage_percentage < 88.0:
                    quality_grade = "Grade D (Degraded / Overripe)"
                    risk_level = "High"
                    action = "Critical Alert: High ethylene & respiration. Cook immediately or isolate from other produce."
                else:
                    quality_grade = "Grade F (Spoiled / Decomposed)"
                    risk_level = "Critical"
                    action = "Immediate Disposal: Quarantine batch to prevent cross-contamination and fruit fly infestation."

                row = {
                    "timestamp": curr_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "device_id": f"ESP32-NODE-{item['category'][:2].upper()}-{batch_counter % 20 + 1:02d}",
                    "batch_id": batch_id,
                    "produce_name": item["produce_name"],
                    "category": item["category"],
                    "botanical_variety": item["variety"],
                    "origin_region": item["origin"],
                    "storage_type": storage_type,
                    "storage_location": storage_loc,
                    "storage_duration_hours": float(step),
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
    fieldnames = [
        "timestamp", "device_id", "batch_id", "produce_name", "category",
        "botanical_variety", "origin_region", "storage_type", "storage_location",
        "storage_duration_hours", "temperature_celsius", "humidity_percentage",
        "ammonia_nh3_ppm", "co2_ppm", "voc_ethylene_ppm", "current_weight_kg",
        "weight_loss_percentage", "spoilage_probability_pct",
        "remaining_shelf_life_hours", "quality_grade", "risk_level", "recommended_action"
    ]
    with open(output_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} physical IoT telemetry records across {len(PRODUCE_PROFILES)} produce commodities.")
    print(f"Saved CSV: {output_csv_path}")

    # Write JSON
    if output_json_path:
        with open(output_json_path, mode="w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2)
        print(f"Saved JSON: {output_json_path}")

    return rows

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_out = os.path.join(base_dir, "sri_lanka_fruits_veg_iot_dataset.csv")
    json_out = os.path.join(base_dir, "sri_lanka_fruits_veg_iot_dataset.json")
    generate_comprehensive_iot_dataset(csv_out, json_out)
