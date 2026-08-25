import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

STORAGE_ZONES = [
    {
        "id": "zone-fruit",
        "name": "Zone 1: Fruit & Berry Preservation Chamber",
        "category": "Fruits",
        "target_temp": 8.0,
        "current_temp": 9.2,
        "target_humidity": 88.0,
        "current_humidity": 91.0,
        "nh3": 0.03,
        "co2": 980.0,
        "voc": 0.46,
        "status": "warning",
        "description": "Ethylene-managed cool chamber for fresh fruits, bananas, berries, and melons"
    },
    {
        "id": "zone-veg",
        "name": "Zone 2: Leafy Greens & Vegetable Crisper Vault",
        "category": "Vegetables",
        "target_temp": 5.0,
        "current_temp": 5.4,
        "target_humidity": 90.0,
        "current_humidity": 89.5,
        "nh3": 0.04,
        "co2": 620.0,
        "voc": 0.22,
        "status": "optimal",
        "description": "High-humidity crisper unit for salad greens, herbs, broccoli, carrots, and tomatoes"
    },
    {
        "id": "zone-dairy",
        "name": "Zone 3: Dairy & Pastry Refrigerator",
        "category": "Dairy",
        "target_temp": 3.0,
        "current_temp": 3.2,
        "target_humidity": 65.0,
        "current_humidity": 67.0,
        "nh3": 0.04,
        "co2": 420.0,
        "voc": 0.12,
        "status": "optimal",
        "description": "Cold storage for pasteurized whole milk, cheeses, butter, and cream"
    },
    {
        "id": "zone-meat",
        "name": "Zone 4: Walk-In Poultry & Meat Chiller",
        "category": "Meat",
        "target_temp": 1.5,
        "current_temp": 3.8,
        "target_humidity": 75.0,
        "current_humidity": 78.0,
        "nh3": 0.28,
        "co2": 530.0,
        "voc": 0.34,
        "status": "warning",
        "description": "Primary poultry, beef cuts, and red meat cold storage unit"
    },
    {
        "id": "zone-fish",
        "name": "Zone 5: Seafood Ice Preservation Bed",
        "category": "Fish",
        "target_temp": 0.5,
        "current_temp": 1.1,
        "target_humidity": 85.0,
        "current_humidity": 86.0,
        "nh3": 0.09,
        "co2": 450.0,
        "voc": 0.16,
        "status": "optimal",
        "description": "Seafood bay with crushed ice bed for tuna, salmon, prawns, and whitefish"
    }
]

INITIAL_INVENTORY: List[Dict[str, Any]] = [
    # 1. Fruits
    {
        "id": "inv-001",
        "name": "Cavendish Ripe Bananas (Crate)",
        "category": "Fruits",
        "storage_zone": "Zone 1: Fruit & Berry Preservation Chamber",
        "batch_number": "BAT-2026-BN12",
        "quantity": "25.0 kg",
        "stored_at": (datetime.now() - timedelta(hours=92)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 92.0,
        "current_temp": 9.4,
        "current_humidity": 90.5,
        "current_nh3": 0.03,
        "current_co2": 1020.0,
        "current_voc": 0.51,
        "spoilage_prob": 72.0,
        "remaining_shelf_life_hours": 14.0,
        "risk_level": "High",
        "status": "Action Required",
        "recommendation": "Priority Fruit Prep: Divert to banana bread baking, milkshakes, or dessert pancakes immediately today."
    },
    {
        "id": "inv-002",
        "name": "Fresh Strawberries (Punnets)",
        "category": "Fruits",
        "storage_zone": "Zone 1: Fruit & Berry Preservation Chamber",
        "batch_number": "BAT-2026-SB81",
        "quantity": "8.5 kg",
        "stored_at": (datetime.now() - timedelta(hours=88)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 88.0,
        "current_temp": 9.8,
        "current_humidity": 92.0,
        "current_nh3": 0.04,
        "current_co2": 1080.0,
        "current_voc": 0.55,
        "spoilage_prob": 89.0,
        "remaining_shelf_life_hours": 3.5,
        "risk_level": "Critical",
        "status": "Spoilage Risk",
        "recommendation": "Mould Spore Warning: Isolate punnets immediately. Convert sound berries into coulis or safely discard."
    },
    {
        "id": "inv-003",
        "name": "Granny Smith Green Apples",
        "category": "Fruits",
        "storage_zone": "Zone 1: Fruit & Berry Preservation Chamber",
        "batch_number": "BAT-2026-AP05",
        "quantity": "30.0 kg",
        "stored_at": (datetime.now() - timedelta(hours=24)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 24.0,
        "current_temp": 8.1,
        "current_humidity": 87.0,
        "current_nh3": 0.02,
        "current_co2": 820.0,
        "current_voc": 0.18,
        "spoilage_prob": 8.0,
        "remaining_shelf_life_hours": 104.0,
        "risk_level": "Low",
        "status": "Fresh",
        "recommendation": "Firm texture & crisp acidity. Ideal for fresh salads and apple pies."
    },

    # 2. Vegetables
    {
        "id": "inv-004",
        "name": "Hydroponic Romaine Lettuce",
        "category": "Vegetables",
        "storage_zone": "Zone 2: Leafy Greens & Vegetable Crisper Vault",
        "batch_number": "BAT-2026-LT04",
        "quantity": "14.0 kg",
        "stored_at": (datetime.now() - timedelta(hours=36)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 36.0,
        "current_temp": 5.2,
        "current_humidity": 89.0,
        "current_nh3": 0.04,
        "current_co2": 580.0,
        "current_voc": 0.18,
        "spoilage_prob": 18.5,
        "remaining_shelf_life_hours": 58.0,
        "risk_level": "Low",
        "status": "Fresh",
        "recommendation": "Crisp green turgor pressure optimal. Prime for Caesar salads and burger garnishes."
    },
    {
        "id": "inv-005",
        "name": "Vine-Ripened Cherry Tomatoes",
        "category": "Vegetables",
        "storage_zone": "Zone 2: Leafy Greens & Vegetable Crisper Vault",
        "batch_number": "BAT-2026-TM22",
        "quantity": "12.0 kg",
        "stored_at": (datetime.now() - timedelta(hours=68)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 68.0,
        "current_temp": 5.6,
        "current_humidity": 88.0,
        "current_nh3": 0.04,
        "current_co2": 690.0,
        "current_voc": 0.28,
        "spoilage_prob": 42.0,
        "remaining_shelf_life_hours": 32.0,
        "risk_level": "Medium",
        "status": "Moderate",
        "recommendation": "Good firm texture. Schedule into pasta sauces and salads over the next 24-36h."
    },
    {
        "id": "inv-006",
        "name": "Fresh Baby Spinach Leaves",
        "category": "Vegetables",
        "storage_zone": "Zone 2: Leafy Greens & Vegetable Crisper Vault",
        "batch_number": "BAT-2026-SP19",
        "quantity": "6.0 kg",
        "stored_at": (datetime.now() - timedelta(hours=76)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 76.0,
        "current_temp": 5.8,
        "current_humidity": 91.0,
        "current_nh3": 0.06,
        "current_co2": 740.0,
        "current_voc": 0.32,
        "spoilage_prob": 76.0,
        "remaining_shelf_life_hours": 9.0,
        "risk_level": "High",
        "status": "Action Required",
        "recommendation": "Leaf Wilting & Chlorosis: Blanch and freeze or cook immediately in spinach pasta / soup today."
    },

    # 3. Dairy
    {
        "id": "inv-007",
        "name": "Pasteurized Fresh Whole Milk (1L x 24)",
        "category": "Dairy",
        "storage_zone": "Zone 3: Dairy & Pastry Refrigerator",
        "batch_number": "BAT-2026-MK33",
        "quantity": "24.0 L",
        "stored_at": (datetime.now() - timedelta(hours=48)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 48.0,
        "current_temp": 3.2,
        "current_humidity": 66.0,
        "current_nh3": 0.04,
        "current_co2": 410.0,
        "current_voc": 0.09,
        "spoilage_prob": 15.0,
        "remaining_shelf_life_hours": 110.0,
        "risk_level": "Low",
        "status": "Fresh",
        "recommendation": "Optimal lactic stability. Standard espresso bar & bakery rotation."
    },
    {
        "id": "inv-008",
        "name": "Fresh Mozzarella Cheese Blocks",
        "category": "Dairy",
        "storage_zone": "Zone 3: Dairy & Pastry Refrigerator",
        "batch_number": "BAT-2026-MZ08",
        "quantity": "10.0 kg",
        "stored_at": (datetime.now() - timedelta(hours=96)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 96.0,
        "current_temp": 3.4,
        "current_humidity": 68.0,
        "current_nh3": 0.05,
        "current_co2": 440.0,
        "current_voc": 0.16,
        "spoilage_prob": 34.0,
        "remaining_shelf_life_hours": 64.0,
        "risk_level": "Medium",
        "status": "Moderate",
        "recommendation": "Keep in chilled brine solution. Rotate into pizza and lasagne prep."
    },

    # 4. Fish & Seafood
    {
        "id": "inv-009",
        "name": "Yellowfin Tuna Steaks",
        "category": "Fish",
        "storage_zone": "Zone 5: Seafood Ice Preservation Bed",
        "batch_number": "BAT-2026-TU02",
        "quantity": "8.0 kg",
        "stored_at": (datetime.now() - timedelta(hours=18)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 18.0,
        "current_temp": 1.1,
        "current_humidity": 86.0,
        "current_nh3": 0.08,
        "current_co2": 440.0,
        "current_voc": 0.14,
        "spoilage_prob": 14.0,
        "remaining_shelf_life_hours": 32.0,
        "risk_level": "Low",
        "status": "Fresh",
        "recommendation": "Maintain crushed ice bed. Optimal for sashimi / pan-sear specials."
    },
    {
        "id": "inv-010",
        "name": "Norwegian Salmon Fillet Portions",
        "category": "Fish",
        "storage_zone": "Zone 5: Seafood Ice Preservation Bed",
        "batch_number": "BAT-2026-SL14",
        "quantity": "12.5 kg",
        "stored_at": (datetime.now() - timedelta(hours=28)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 28.0,
        "current_temp": 1.3,
        "current_humidity": 85.5,
        "current_nh3": 0.11,
        "current_co2": 460.0,
        "current_voc": 0.18,
        "spoilage_prob": 28.0,
        "remaining_shelf_life_hours": 22.0,
        "risk_level": "Medium",
        "status": "Fresh",
        "recommendation": "Bright orange flesh & firm texture. Schedule for dinner grill service."
    },

    # 5. Meat & Poultry
    {
        "id": "inv-011",
        "name": "Fresh Chicken Breast Fillet",
        "category": "Meat",
        "storage_zone": "Zone 4: Walk-In Poultry & Meat Chiller",
        "batch_number": "BAT-2026-CH09",
        "quantity": "18.5 kg",
        "stored_at": (datetime.now() - timedelta(hours=64)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 64.0,
        "current_temp": 4.1,
        "current_humidity": 79.0,
        "current_nh3": 0.32,
        "current_co2": 580.0,
        "current_voc": 0.38,
        "spoilage_prob": 74.5,
        "remaining_shelf_life_hours": 11.5,
        "risk_level": "High",
        "status": "Action Required",
        "recommendation": "Priority Use: Dispatch for chicken curry / grill prep immediately today."
    },
    {
        "id": "inv-012",
        "name": "Grass-Fed Beef Sirloin",
        "category": "Meat",
        "storage_zone": "Zone 4: Walk-In Poultry & Meat Chiller",
        "batch_number": "BAT-2026-BF04",
        "quantity": "14.0 kg",
        "stored_at": (datetime.now() - timedelta(hours=30)).strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 30.0,
        "current_temp": 3.6,
        "current_humidity": 76.0,
        "current_nh3": 0.16,
        "current_co2": 510.0,
        "current_voc": 0.22,
        "spoilage_prob": 26.5,
        "remaining_shelf_life_hours": 62.0,
        "risk_level": "Low",
        "status": "Fresh",
        "recommendation": "Healthy oxymyoglobin color. Normal aging progression."
    }
]

INITIAL_RECOMMENDATIONS: List[Dict[str, Any]] = [
    {
        "id": "rec-101",
        "type": "DISPOSAL_WARNING",
        "severity": "critical",
        "title": "Fruit Fungal Mould & Spore Alert",
        "item_name": "Fresh Strawberries (Punnets)",
        "zone": "Zone 1: Fruit & Berry Preservation Chamber",
        "message": "Elevated CO2 (1080 ppm) and relative humidity (92%) detected with fungal spore spread risk.",
        "suggested_action": "Quarantine affected punnets immediately. Convert sound fruit to puree or dispose safely.",
        "created_at": datetime.now() - timedelta(minutes=10)
    },
    {
        "id": "rec-102",
        "type": "PRIORITY_USE",
        "severity": "high",
        "title": "Produce Degassing & Ripening Notice",
        "item_name": "Cavendish Ripe Bananas (Crate)",
        "zone": "Zone 1: Fruit & Berry Preservation Chamber",
        "message": "High ethylene VOC degassing (0.51 ppm). Remaining shelf-life under 14 hours.",
        "suggested_action": "Divert 25kg batch to pastry chef for banana bread, cakes, and breakfast smoothies today.",
        "created_at": datetime.now() - timedelta(minutes=25)
    },
    {
        "id": "rec-103",
        "type": "PRIORITY_USE",
        "severity": "high",
        "title": "Vegetable Wilting & Chlorosis Notice",
        "item_name": "Fresh Baby Spinach Leaves",
        "zone": "Zone 2: Leafy Greens & Vegetable Crisper Vault",
        "message": "Chlorophyll breakdown detected. Remaining shelf-life under 9 hours.",
        "suggested_action": "Blanch immediately for spinach pasta, curry, or soup batch cooking today.",
        "created_at": datetime.now() - timedelta(minutes=45)
    },
    {
        "id": "rec-104",
        "type": "STORAGE_ALERT",
        "severity": "medium",
        "title": "Fruit Chamber Thermal Calibration",
        "item_name": "Zone 1: Fruit & Berry Preservation Chamber",
        "zone": "Zone 1: Fruit & Berry Preservation Chamber",
        "message": "Current temperature reading is 9.2°C (Optimal target: 8.0°C).",
        "suggested_action": "Calibrate thermostat cooling by -1.2°C to slow ethylene respiration rates.",
        "created_at": datetime.now() - timedelta(hours=1)
    }
]

def generate_sensor_history(zone_id: str, hours: int = 24) -> List[Dict[str, Any]]:
    """Generate realistic time-series environmental data for charts."""
    history = []
    zone = next((z for z in STORAGE_ZONES if z["id"] == zone_id), STORAGE_ZONES[0])
    base_temp = zone["current_temp"]
    base_hum = zone["current_humidity"]
    base_nh3 = zone["nh3"]
    base_co2 = zone["co2"]
    base_voc = zone["voc"]

    now = datetime.now()
    for i in range(hours, -1, -1):
        point_time = now - timedelta(hours=i)
        t_drift = random.uniform(-0.35, 0.35)
        h_drift = random.uniform(-1.2, 1.2)
        nh3_drift = random.uniform(-0.01, 0.02)
        co2_drift = random.uniform(-20.0, 30.0)
        voc_drift = random.uniform(-0.02, 0.03)

        history.append({
            "timestamp": point_time.strftime("%H:%M"),
            "full_time": point_time.isoformat(),
            "temperature": round(base_temp + t_drift, 2),
            "humidity": round(base_hum + h_drift, 1),
            "nh3": round(max(0.01, base_nh3 + nh3_drift), 3),
            "co2": round(max(350.0, base_co2 + co2_drift), 1),
            "voc": round(max(0.02, base_voc + voc_drift), 3),
        })
    return history
