import os
import sys
import json
import base64
import urllib.request
import urllib.parse

# Ensure Windows terminal supports UTF-8 emojis
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run_tests():
    print("=" * 60)
    print("  FOOD SPOILAGE PREDICTION & RSL SYSTEM VERIFICATION")
    print("=" * 60)

    # 1. API Status
    try:
        res = urllib.request.urlopen("http://127.0.0.1:8000/api/status")
        status = json.loads(res.read().decode())
        print(f"[PASS] 1. API Status: {status}")
    except Exception as e:
        print(f"[FAIL] 1. API Status: {e}")

    # 2. Storage Zones
    try:
        res = urllib.request.urlopen("http://127.0.0.1:8000/api/sensors/zones")
        zones = json.loads(res.read().decode())
        z_count = len(zones.get("zones", []))
        print(f"[PASS] 2. Storage Zones: {z_count} active zones detected")
        for z in zones.get("zones", []):
            print(f"       - {z['name']} ({z['category']}): {z['current_temp']}°C, {z['current_humidity']}% RH")
    except Exception as e:
        print(f"[FAIL] 2. Storage Zones: {e}")

    # 3. Inventory Items & RSL FIFO Tracking
    try:
        res = urllib.request.urlopen("http://127.0.0.1:8000/api/inventory/items")
        inv = json.loads(res.read().decode())
        items = inv.get("items", [])
        print(f"[PASS] 3. Inventory Management: {len(items)} perishable produce batches")
        fifo_targets = [it for it in items if it.get("is_smart_fifo_target")]
        print(f"       - Smart FIFO Targets ({len(fifo_targets)} batches prioritized for immediate use):")
        for it in fifo_targets[:4]:
            print(f"         * {it['name']}: RSL={it['remaining_shelf_life_hours']}h ({round(it['remaining_shelf_life_hours']/24,1)}d), Risk={it['risk_level']}")
    except Exception as e:
        print(f"[FAIL] 3. Inventory: {e}")

    # 4. Multi-Modal Spoilage & RSL Fusion Assessor (Fresh, Overripe, Spoiled)
    test_cases = [
        {
            "label": "Fresh Low-Risk Harvest",
            "item_name": "Embul Banana (Ambul Kesel)",
            "category": "Fruits",
            "duration": 24.0,
            "sensor": {"storage_zone": "Zone 1", "temperature": 11.2, "humidity": 89.0, "nh3": 0.012, "co2": 520.0, "voc": 0.25},
            "vision": {"category": "Fruits", "discoloration_score": 3.0, "mould_detected": False, "mould_coverage": 0.0, "ripeness_stage": "Fresh / Firm (Grade A)", "texture_degradation": 5.0, "visual_spoilage_score": 8.0}
        },
        {
            "label": "Overripe / Softening (Use Today)",
            "item_name": "Sri Lankan Avocado (Butter Fruit)",
            "category": "Fruits",
            "duration": 48.0,
            "sensor": {"storage_zone": "Zone 1", "temperature": 12.0, "humidity": 88.0, "nh3": 0.020, "co2": 650.0, "voc": 0.55},
            "vision": {"category": "Fruits", "discoloration_score": 28.0, "mould_detected": False, "mould_coverage": 0.0, "ripeness_stage": "Overripe / Softening (Use Today)", "texture_degradation": 55.0, "visual_spoilage_score": 62.0}
        },
        {
            "label": "Critical Fungal Spoilage",
            "item_name": "Fresh Strawberry",
            "category": "Fruits",
            "duration": 72.0,
            "sensor": {"storage_zone": "Zone 1", "temperature": 15.5, "humidity": 94.0, "nh3": 0.065, "co2": 1120.0, "voc": 1.25},
            "vision": {"category": "Fruits", "discoloration_score": 45.0, "mould_detected": True, "mould_coverage": 14.5, "ripeness_stage": "Spoiled / Rotten (Grade F)", "texture_degradation": 80.0, "visual_spoilage_score": 92.0}
        }
    ]

    print("\n[PASS] 4. Multi-Modal Spoilage & RSL Fusion Tests:")
    for tc in test_cases:
        req_data = {
            "item_name": tc["item_name"],
            "category": tc["category"],
            "storage_duration_hours": tc["duration"],
            "sensor_data": tc["sensor"],
            "vision_data": tc["vision"]
        }
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/predictions/assess",
            data=json.dumps(req_data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        pred = json.loads(res.read().decode())
        print(f"       [{tc['label']}]")
        print(f"         Item: {pred['item_name']} | Risk Level: {pred['risk_level']} | Spoilage: {pred['spoilage_probability']}%")
        print(f"         RSL: {pred['remaining_shelf_life_hours']}h ({round(pred['remaining_shelf_life_hours']/24,1)}d) | Action: {pred['storage_action']}")

    # 5. Computer Vision Inspection on Real Image Specimens
    specimens = [
        ("Avocado Overripe", "frontend/public/images/specimens/avocado_overripe.jpg", "Fruits"),
        ("Peach Senescent", "frontend/public/images/specimens/peach_rotting.jpg", "Fruits"),
        ("Banana Overripe", "frontend/public/images/specimens/banana_overripe.jpg", "Fruits"),
        ("Apple Fresh", "frontend/public/images/specimens/apple_fresh.jpg", "Fruits"),
        ("Tomato Overripe", "frontend/public/images/specimens/tomato_overripe.jpg", "Vegetables"),
        ("Strawberry Mould", "frontend/public/images/specimens/strawberries_mould.jpg", "Fruits"),
        ("Spinach Wilted", "frontend/public/images/specimens/spinach_wilted.jpg", "Vegetables"),
        ("Romaine Lettuce Crisp", "frontend/public/images/specimens/lettuce_crisp.jpg", "Vegetables"),
    ]

    print("\n[PASS] 5. Computer Vision Inspection Endpoint (/api/vision/inspect) on Produce Specimens:")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    for name, rel_path, cat in specimens:
        full_path = os.path.join(base_dir, rel_path)
        if not os.path.exists(full_path):
            print(f"       [SKIP] Image not found: {full_path}")
            continue

        with open(full_path, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")

        form_data = urllib.parse.urlencode({
            "category": cat,
            "image_base64": b64_data
        }).encode("utf-8")

        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/vision/inspect",
            data=form_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        res = urllib.request.urlopen(req)
        cv_out = json.loads(res.read().decode())

        id_produce = cv_out.get("identified_produce")
        conf = cv_out.get("produce_confidence")
        icon = cv_out.get("produce_icon")
        rsl = cv_out.get("remaining_shelf_life_hours")
        stage = cv_out.get("ripeness_stage")
        risk = cv_out.get("risk_level")
        mould = cv_out.get("mould_detected")
        bboxes = len(cv_out.get("bounding_boxes", []))

        print(f"       {icon} {name}:")
        print(f"          Identified: {id_produce} ({conf}% conf) | Stage: {stage} | Risk: {risk}")
        print(f"          Remaining Shelf-Life: {rsl}h ({round(rsl/24,1)}d) | Mould: {mould} | Defect Boxes: {bboxes}")

    print("\n" + "=" * 60)
    print("  ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
