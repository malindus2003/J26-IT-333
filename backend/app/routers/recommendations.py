from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from ..data.mock_data import STORAGE_ZONES
from .inventory import inventory_db

router = APIRouter(prefix="/api/recommendations", tags=["Actionable Recommendations & Alert System"])

class AlertActionPayload(BaseModel):
    action_note: Optional[str] = None

class CustomAlertPayload(BaseModel):
    type: str
    severity: str  # 'critical', 'high', 'medium', 'info'
    category: str  # 'Spoilage', 'Kitchen', 'Demand', 'Waste'
    title: str
    item_name: Optional[str] = "Perishable Specimen"
    zone: Optional[str] = "Storage 1: Tropical Chiller (11°C)"
    message: str
    suggested_action: str
    spoilage_prob: Optional[float] = None
    rsl_hours: Optional[float] = None
    cv_stage: Optional[str] = None
    chamber_telemetry: Optional[str] = None

# In-memory alerts database with multi-modal food spoilage integration
alerts_db: List[Dict[str, Any]] = [
    {
        "id": "alert-spoil-01",
        "type": "FOOD_SAFETY_QUARANTINE",
        "category": "Spoilage",
        "severity": "critical",
        "title": "Critical Fungal Hazard: Rotten Strawberries",
        "item_name": "Rotten Strawberries (Botrytis Colony)",
        "zone": "Storage 1: Tropical Chiller (11°C)",
        "chamber_node_id": "ESP32-NODE-01",
        "spoilage_prob": 97.5,
        "rsl_hours": 0.0,
        "cv_stage": "Rotten Fruit (Botrytis Mould Colony - Grade F)",
        "chamber_telemetry": "T: 11.4°C | H: 90.2% | VOC: 1.25ppm | CO2: 890ppm",
        "message": "Optical CV detection identified active Botrytis cinerea mould colonies with elevated VOC emissions. Fungal spore cross-contamination hazard detected.",
        "suggested_action": "Immediate Food Safety Quarantine: Isolate batch SL-FR-STR-099 and dispatch to Smart Waste Bin.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(minutes=6)).strftime("%H:%M:%S")
    },
    {
        "id": "alert-spoil-02",
        "type": "SMART_FIFO_DIVERT",
        "category": "Spoilage",
        "severity": "high",
        "title": "Near Spoilage (~75%) FIFO Alert: Red Lady Papaya",
        "item_name": "Red Lady Papaya (Rathu Papol)",
        "zone": "Storage 4: Ambient Kitchen Rack (29°C)",
        "chamber_node_id": "RACK-AMB-04",
        "spoilage_prob": 78.5,
        "rsl_hours": 8.5,
        "cv_stage": "Senescent Softening (Grade D)",
        "chamber_telemetry": "T: 30.5°C | H: 81.0% | VOC: 1.45ppm | CO2: 1250ppm",
        "message": "Ambient thermal respiration accelerated pulp softening (~78.5% spoilage probability). 8.5 hours remaining shelf-life before unpalatable fermentation.",
        "suggested_action": "AI Culinary Directives: Divert 18.5kg batch immediately to juice bar specials, morning smoothies, and dessert coulis.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(minutes=18)).strftime("%H:%M:%S")
    },
    {
        "id": "alert-spoil-03",
        "type": "ETHYLENE_MONITOR",
        "category": "Spoilage",
        "severity": "medium",
        "title": "Ethylene Volatile Degassing: Karthakolomban Mango",
        "item_name": "Karthakolomban Mango (Ripe)",
        "zone": "Storage 1: Tropical Chiller (11°C)",
        "chamber_node_id": "ESP32-NODE-01",
        "spoilage_prob": 48.0,
        "rsl_hours": 38.0,
        "cv_stage": "Ripe Peak Aromatic (Grade B)",
        "chamber_telemetry": "T: 11.4°C | H: 90.2% | VOC: 0.85ppm | CO2: 850ppm",
        "message": "High aromatic ester VOC degassing (0.85 ppm). 38 hours remaining before overripening occurs.",
        "suggested_action": "FIFO Rotation: Prioritize batch SL-FR-KCL-102 for lunch buffet fruit platters and mango mousse today.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(minutes=35)).strftime("%H:%M:%S")
    },
    {
        "id": "alert-spoil-04",
        "type": "TRANSPIRATION_ALERT",
        "category": "Spoilage",
        "severity": "high",
        "title": "Leaf Transpiration & Wilting: Water Spinach (Kankun)",
        "item_name": "Kankun (Water Spinach)",
        "zone": "Storage 2: Crisper Vault (5°C)",
        "chamber_node_id": "ESP32-NODE-02",
        "spoilage_prob": 54.0,
        "rsl_hours": 16.0,
        "cv_stage": "Cellular Wilt & Dehydration (Grade C)",
        "chamber_telemetry": "T: 5.2°C | H: 94.0% | VOC: 0.18ppm | CO2: 580ppm",
        "message": "Stem wilting and leaf moisture loss detected in Crisper Vault (16 hours shelf-life remaining).",
        "suggested_action": "Fast-Track Kitchen Usage: Prepare garlic wok stir-fry kankun for tonight's dinner service.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(minutes=50)).strftime("%H:%M:%S")
    },
    {
        "id": "alert-kitchen-01",
        "type": "BOTTLENECK_ALERT",
        "category": "Kitchen",
        "severity": "high",
        "title": "Hot Wok / Kottu Line Overload",
        "item_name": "Wok Station 1",
        "zone": "Main Hot Kitchen",
        "message": "Queue length exceeded 9 orders with average prep latency of 18.5 mins (Target: 12 mins).",
        "suggested_action": "Dynamically reallocate 1 assistant cook from Cold Salad station to Hot Wok line.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(minutes=55)).strftime("%H:%M:%S")
    },
    {
        "id": "alert-waste-01",
        "type": "BIN_OVERFLOW",
        "category": "Waste",
        "severity": "medium",
        "title": "Organic Compost Compartment Near Capacity",
        "item_name": "Smart Bin #01",
        "zone": "Plate Clearing Area",
        "message": "Ultrasonic sensor reads 84% fill level with 12.8 kg organic food waste recorded today.",
        "suggested_action": "Schedule bin clearance before 19:00 dinner rush to prevent waste sorting overflow.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(hours=1, minutes=10)).strftime("%H:%M:%S")
    },
    {
        "id": "alert-demand-01",
        "type": "PREP_SURGE",
        "category": "Demand",
        "severity": "medium",
        "title": "Rain Forecast: +18% Soup & Curry Demand Surge",
        "item_name": "Chicken Curry & Dhal Soup",
        "zone": "Kitchen Prep Bay",
        "message": "Heavy evening rain forecast with 64 table reservations booked. Projected soup demand up by +22 portions.",
        "suggested_action": "Increase pre-shift soup broth preparation buffer by +15 portions.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(hours=1, minutes=30)).strftime("%H:%M:%S")
    }
]

@router.get("/")
def get_recommendations():
    """Retrieve prioritized kitchen recommendations and active warning alerts integrated with real-time Food Spoilage telemetry."""
    # 1. Dynamically sync with critical quarantine inventory batches
    for item in inventory_db:
        if item.get("is_quarantine") or item.get("risk_level") == "Critical":
            alert_id = f"dyn-crit-{item['id']}"
            if not any(a["id"] == alert_id for a in alerts_db):
                alerts_db.insert(0, {
                    "id": alert_id,
                    "type": "FOOD_SAFETY_QUARANTINE",
                    "category": "Spoilage",
                    "severity": "critical",
                    "title": f"Quarantine Hazard: {item['name']}",
                    "item_name": item["name"],
                    "zone": item["storage_zone"],
                    "spoilage_prob": item.get("spoilage_prob", 95.0),
                    "rsl_hours": item.get("remaining_shelf_life_hours", 0.0),
                    "cv_stage": "Critical Spoilage / Rotten",
                    "chamber_telemetry": f"T: {item.get('chamber_temp', 11.4)}°C | H: {item.get('chamber_humidity', 90.2)}% | VOC: {item.get('chamber_voc', 0.8)}ppm",
                    "message": f"Spoilage probability reached {item.get('spoilage_prob', 95.0)}%. Zero remaining shelf-life.",
                    "suggested_action": f"Isolate batch {item.get('batch_number')} immediately to protect kitchen food safety.",
                    "status": "active",
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })
        
        # 2. Dynamically sync with Near-Spoilage (~75%) FIFO batches
        elif item.get("is_smart_fifo_target") or item.get("spoilage_prob", 0) >= 70.0:
            alert_id = f"dyn-fifo-{item['id']}"
            if not any(a["id"] == alert_id for a in alerts_db):
                alerts_db.insert(1, {
                    "id": alert_id,
                    "type": "SMART_FIFO_DIVERT",
                    "category": "Spoilage",
                    "severity": "high",
                    "title": f"Near Spoilage (~75%): {item['name']}",
                    "item_name": item["name"],
                    "zone": item["storage_zone"],
                    "spoilage_prob": item.get("spoilage_prob", 75.0),
                    "rsl_hours": item.get("remaining_shelf_life_hours", 12.0),
                    "cv_stage": "Advanced Ripeness / Softening",
                    "chamber_telemetry": f"T: {item.get('chamber_temp', 11.4)}°C | H: {item.get('chamber_humidity', 90.2)}% | VOC: {item.get('chamber_voc', 0.5)}ppm",
                    "message": f"Batch reaching {item.get('spoilage_prob', 75.0)}% spoilage with {item.get('remaining_shelf_life_hours', 12.0)}h shelf-life remaining.",
                    "suggested_action": item.get("recommendation", "Prioritize for immediate culinary diversion in today's menu."),
                    "status": "active",
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })

    # 3. Dynamically sync with cold storage temperature drift
    for zone in STORAGE_ZONES:
        target = zone.get("target_temp", 11.0)
        curr = zone.get("current_temp", 11.4)
        if abs(curr - target) > 3.0:
            alert_id = f"dyn-temp-{zone['id']}"
            if not any(a["id"] == alert_id for a in alerts_db):
                alerts_db.insert(0, {
                    "id": alert_id,
                    "type": "THERMAL_ABUSE",
                    "category": "Spoilage",
                    "severity": "high",
                    "title": f"Thermal Drift: {zone['name'].split('(')[0].strip()}",
                    "item_name": f"{zone.get('category', 'Produce')} in {zone['name'].split('(')[0].strip()}",
                    "zone": zone["name"],
                    "spoilage_prob": 65.0,
                    "rsl_hours": 18.0,
                    "cv_stage": "Accelerated Thermal Respiration",
                    "chamber_telemetry": f"T: {curr}°C (Target: {target}°C) | H: {zone.get('current_humidity', 90)}% | VOC: {zone.get('voc', 0.3)}ppm",
                    "message": f"Temperature is {curr}°C (Setpoint: {target}°C). Elevated heat accelerates ripening & enzymatic spoilage.",
                    "suggested_action": "Check chiller evaporator coils and adjust thermostat back to setpoint.",
                    "status": "active",
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })

    active_alerts = [a for a in alerts_db if a["status"] != "resolved"]
    resolved_alerts = [a for a in alerts_db if a["status"] == "resolved"]

    return {
        "recommendations": alerts_db,
        "active_alerts": active_alerts,
        "resolved_alerts": resolved_alerts,
        "total_count": len(alerts_db),
        "active_count": len(active_alerts),
        "critical_count": sum(1 for r in active_alerts if r["severity"] == "critical"),
        "high_priority_count": sum(1 for r in active_alerts if r["severity"] == "high"),
        "medium_count": sum(1 for r in active_alerts if r["severity"] == "medium")
    }

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    """Mark an alert as acknowledged by staff."""
    for a in alerts_db:
        if a["id"] == alert_id:
            a["status"] = "acknowledged"
            a["acknowledged_at"] = datetime.now().strftime("%H:%M:%S")
            return {"status": "success", "message": f"Alert {alert_id} acknowledged", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str, payload: Optional[AlertActionPayload] = None):
    """Mark an alert as resolved and remove from active list."""
    for a in alerts_db:
        if a["id"] == alert_id:
            a["status"] = "resolved"
            a["resolved_at"] = datetime.now().strftime("%H:%M:%S")
            if payload and payload.action_note:
                a["resolution_note"] = payload.action_note
            return {"status": "success", "message": f"Alert {alert_id} resolved successfully", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/resolve-all")
def resolve_all_alerts():
    """Resolve all active and acknowledged alerts."""
    for a in alerts_db:
        if a["status"] != "resolved":
            a["status"] = "resolved"
            a["resolved_at"] = datetime.now().strftime("%H:%M:%S")
    return {"status": "success", "message": "All alerts marked as resolved"}

@router.post("/trigger")
def trigger_custom_alert(payload: CustomAlertPayload):
    """Create a new manual or hardware-triggered anomaly alert."""
    new_alert = {
        "id": f"custom-{int(datetime.now().timestamp())}",
        "type": payload.type,
        "category": payload.category,
        "severity": payload.severity,
        "title": payload.title,
        "item_name": payload.item_name,
        "zone": payload.zone,
        "message": payload.message,
        "suggested_action": payload.suggested_action,
        "spoilage_prob": payload.spoilage_prob or 75.0,
        "rsl_hours": payload.rsl_hours or 12.0,
        "cv_stage": payload.cv_stage or "Advanced Softening",
        "chamber_telemetry": payload.chamber_telemetry or "T: 11.4°C | H: 90.2% | VOC: 0.45ppm",
        "status": "active",
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }
    alerts_db.insert(0, new_alert)
    return {"status": "success", "alert": new_alert}

@router.delete("/{alert_id}")
def delete_alert(alert_id: str):
    """Delete an alert record."""
    global alerts_db
    alerts_db = [a for a in alerts_db if a["id"] != alert_id]
    return {"status": "success", "message": f"Alert {alert_id} deleted"}
