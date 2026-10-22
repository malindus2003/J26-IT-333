import time
import json
import requests

time.sleep(3)

# 1. AI Status
print("=== 1. AI STATUS ===")
r_status = requests.get("http://localhost:8000/api/waste/ai/status")
print(f"Status Code: {r_status.status_code}")
status_data = r_status.json()
print(json.dumps(status_data, indent=2))

# 2. Metrics (waste.py edits)
print("\n=== 2. WASTE METRICS LABELS ===")
r_metrics = requests.get("http://localhost:8000/api/waste/metrics?days=7")
print(f"Metrics Status Code: {r_metrics.status_code}")
metrics_data = r_metrics.json()
print(f"Module: {metrics_data.get('module')}")
print(f"Hardware status: {json.dumps(metrics_data.get('hardware_status'), indent=2)}")
for c in metrics_data.get("compartments", []):
    print(f" - {c['name']} ({c['id']}): connection='{c.get('connection_status')}', weight={c.get('current_weight_kg')}, fill={c.get('fill_level_percent')}, status='{c.get('status')}'")

# 3. Inference Smoke Test
print("\n=== 3. INFERENCE SMOKE TEST ===")
test_img = "d:/SLIIT/Research/Research-/backend/ai/datasets/food_waste_pilot_v2/images/test/noodles_rep_002.jpg"
with open(test_img, "rb") as f:
    r_infer = requests.post("http://localhost:8000/api/waste/classify?confidence=0.50", files={"file": ("smoke_test_noodles.jpg", f, "image/jpeg")})
print(f"Inference Status Code: {r_infer.status_code}")
infer_data = r_infer.json()
print(json.dumps(infer_data, indent=2))

# 4. Frontend Status
print("\n=== 4. FRONTEND STATUS ===")
try:
    r_fe = requests.get("http://localhost:5173/")
    print(f"Frontend Status Code: {r_fe.status_code}")
except Exception as e:
    print(f"Frontend connection error: {e}")
