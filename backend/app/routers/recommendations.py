from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from ..data.mock_data import INITIAL_RECOMMENDATIONS, STORAGE_ZONES
from .inventory import inventory_db

router = APIRouter(prefix="/api/recommendations", tags=["Actionable Recommendations & Alert System"])

class AlertActionPayload(BaseModel):
    action_note: Optional[str] = None

class CustomAlertPayload(BaseModel):
    type: str
    severity: str  # 'critical', 'high', 'medium', 'info'
    category: str  # 'Spoilage', 'Kitchen', 'Demand', 'Waste'
    title: str
    item_name: Optional[str] = "System Sensor"
    zone: Optional[str] = "Main Operations"
    message: str
    suggested_action: str

# In-memory alerts database with state tracking
alerts_db: List[Dict[str, Any]] = [
    {
        "id": "alert-spoil-01",
        "type": "DISPOSAL_WARNING",
        "category": "Spoilage",
        "severity": "critical",
        "title": "Fungal Mould & Spore Spread Risk",
        "item_name": "Fresh Strawberries (Punnets)",
        "zone": "Zone 1: Fruit Chamber",
        "message": "Elevated CO2 (1080 ppm) and relative humidity (92%) detected with active Botrytis mould growth.",
        "suggested_action": "Quarantine affected punnets immediately. Convert sound fruit to puree or dispose safely.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(minutes=8)).strftime("%H:%M:%S")
    },
    {
        "id": "alert-spoil-02",
        "type": "PRIORITY_USE",
        "category": "Spoilage",
        "severity": "high",
        "title": "Ethylene Degassing & Overripening Notice",
        "item_name": "Cavendish Ripe Bananas (Crate)",
        "zone": "Zone 1: Fruit Chamber",
        "message": "High ethylene VOC emission (0.51 ppm). Remaining shelf-life is below 14 hours.",
        "suggested_action": "Divert 25kg batch to pastry chef for banana bread, cakes, and breakfast smoothies today.",
        "status": "active",
        "timestamp": (datetime.now() - timedelta(minutes=20)).strftime("%H:%M:%S")
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
        "timestamp": (datetime.now() - timedelta(minutes=32)).strftime("%H:%M:%S")
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
        "timestamp": (datetime.now() - timedelta(minutes=45)).strftime("%H:%M:%S")
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
        "timestamp": (datetime.now() - timedelta(hours=1)).strftime("%H:%M:%S")
    }
]

@router.get("/")
def get_recommendations():
    """Retrieve prioritized kitchen recommendations and active warning alerts."""
    # Augment with critical inventory batches dynamically
    dynamic_items = []
    for item in inventory_db:
        if item["risk_level"] == "Critical":
            alert_id = f"dyn-crit-{item['id']}"
            if not any(a["id"] == alert_id for a in alerts_db):
                alerts_db.insert(0, {
                    "id": alert_id,
                    "type": "DISPOSAL_WARNING",
                    "category": "Spoilage",
                    "severity": "critical",
                    "title": f"Spoilage Alert: {item['name']}",
                    "item_name": item["name"],
                    "zone": item["storage_zone"].split(':')[0],
                    "message": f"Spoilage probability reached {item['spoilage_prob']}%. Zero remaining shelf life.",
                    "suggested_action": "Isolate from storage immediately to prevent microbial cross-contamination.",
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
