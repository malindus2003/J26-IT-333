from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
from ..schemas import SensorReading
from ..data.mock_data import STORAGE_ZONES, generate_sensor_history
from ..services.firebase_service import firebase_service

router = APIRouter(prefix="/api/sensors", tags=["Sensors & IoT"])

@router.get("/oled-command")
def get_physical_oled_command():
    """
    Returns the real-time OLED screen payload derived from Computer Vision image analysis.
    Physical ESP32 microcontrollers and the hardware bridge poll or receive this to update
    their connected 0.96" SSD1306 OLED screens immediately upon image upload.
    """
    from ..services.oled_service import oled_service
    return {
        "status": "success",
        "oled_command": oled_service.get_state()
    }

@router.post("/oled-update")
def update_oled_display_state(payload: Dict[str, Any]):
    """
    Allows the Web UI to explicitly push active produce/inspection state to the physical OLED.
    """
    from ..services.oled_service import oled_service
    result = oled_service.update_from_vision_result(
        produce_name=payload.get("produce", "Produce"),
        visual_score=payload.get("visual_score", 20.0),
        risk_level=payload.get("risk_level", "Low"),
        mould_detected=payload.get("mould_detected", False),
        rsl_hours=payload.get("rsl_hours", 72.0),
        source=payload.get("source", "Web UI Direct Sync")
    )
    return {
        "status": "success",
        "oled_command": result
    }

@router.get("/firebase/status")
def get_firebase_status():
    """Retrieve the live Firebase Realtime Database connection state."""
    return firebase_service.get_status()

@router.post("/firebase/sync")
def sync_zones_to_firebase():
    """Sync all current cold storage zones and baseline thresholds to Firebase."""
    success = firebase_service.sync_storage_zones(STORAGE_ZONES)
    return {
        "status": "success" if success else "offline_or_failed",
        "firebase_connected": firebase_service.is_connected,
        "zones_count": len(STORAGE_ZONES)
    }

@router.get("/zones")
def get_storage_zones():
    """Retrieve all restaurant storage zones with real-time IoT metrics."""
    return {"zones": STORAGE_ZONES}

@router.get("/zones/{zone_id}/history")
def get_zone_history(zone_id: str, hours: int = 24):
    """Retrieve historical time-series sensor telemetry for graphs."""
    zone = next((z for z in STORAGE_ZONES if z["id"] == zone_id), None)
    if not zone:
        raise HTTPException(status_code=404, detail="Storage zone not found")
    history = generate_sensor_history(zone_id, hours)
    return {
        "zone_id": zone_id,
        "zone_name": zone["name"],
        "history": history
    }

@router.post("/telemetry")
def ingest_esp32_telemetry(payload: SensorReading):
    """
    Ingest real-time telemetry from ESP32 IoT microcontroller or hardware simulator.
    Updates the target zone's live sensor state.
    """
    target_clean = payload.storage_zone.lower().strip()
    zone_match = None
    for zone in STORAGE_ZONES:
        zid = zone.get("id", "").lower()
        zname = zone.get("name", "").lower()
        if (target_clean == zid or 
            target_clean == zname or 
            target_clean in zname or 
            zname in target_clean or
            ("1" in target_clean and ("zone 1" in zname or "storage 1" in zname or "fruit" in zname)) or
            ("2" in target_clean and ("zone 2" in zname or "storage 2" in zname or "veg" in zname)) or
            ("3" in target_clean and ("zone 3" in zname or "storage 3" in zname or "root" in zname)) or
            ("4" in target_clean and ("zone 4" in zname or "storage 4" in zname or "ambient" in zname))):
            zone_match = zone
            break
            
    if not zone_match:
        # Update first zone as fallback
        zone_match = STORAGE_ZONES[0]

    zone_match["current_temp"] = round(payload.temperature, 2)
    zone_match["current_humidity"] = round(payload.humidity, 1)
    zone_match["nh3"] = round(payload.nh3, 3)
    zone_match["co2"] = round(payload.co2, 1)
    zone_match["voc"] = round(payload.voc, 3)

    # Dynamic threshold evaluation calibrated for Fruit & Vegetable storage chambers
    target_temp = zone_match.get("target_temp", 11.0)
    temp_deviation = abs(payload.temperature - target_temp)
    is_temp_warning = temp_deviation > 3.5  # Significant temperature deviation from setpoint
    is_co2_warning = payload.co2 > 1100.0   # Produce respiration spike / ventilation required
    is_humidity_warning = (payload.humidity > 96.0) or (payload.humidity < 70.0) # Condensation vs desiccation
    is_nh3_warning = payload.nh3 > 0.05     # Soft rot / cellular tissue decay

    if is_temp_warning or is_co2_warning or is_humidity_warning or is_nh3_warning:
        zone_match["status"] = "warning"
    else:
        zone_match["status"] = "optimal"

    # Forward live telemetry to Firebase Realtime Database
    zone_id = zone_match.get("id", "zone-fruit")
    firebase_pushed = firebase_service.publish_telemetry(zone_id, {
        "zone_name": zone_match["name"],
        "category": zone_match.get("category", "Produce"),
        "temperature": zone_match["current_temp"],
        "humidity": zone_match["current_humidity"],
        "nh3": zone_match["nh3"],
        "co2": zone_match["co2"],
        "voc": zone_match["voc"],
        "status": zone_match["status"]
    })

    from ..services.oled_service import oled_service
    oled_cmd = oled_service.get_state()

    # Ultra-compact payload tailored for ESP32 DynamicJsonDocument memory limits
    compact_oled = {
        "produce": oled_cmd.get("produce", "Storage 1"),
        "status": oled_cmd.get("status", "FRESH"),
        "score": round(float(oled_cmd.get("visual_score", 0.0)), 1),
        "rsl": round(float(oled_cmd.get("rsl_hours", 72.0)), 1),
        "is_spoiled": bool(oled_cmd.get("is_spoiled", False)),
        "is_warning": bool(oled_cmd.get("is_warning", False)),
        "reason": str(oled_cmd.get("reason", "Produce Quality: Safe"))[:24],
        "ui_temp": round(float(zone_match.get("target_temp", 11.0)), 1),
        "ui_hum": round(float(zone_match.get("target_humidity", 89.0)), 1)
    }

    return {
        "status": "success",
        "data": {"status": zone_match.get("status", "optimal"), "name": zone_match.get("name")},
        "firebase_synced": firebase_pushed,
        "oled_command": compact_oled,
        "received_at": datetime.now().isoformat()
    }
