from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
from ..schemas import SensorReading
from ..data.mock_data import STORAGE_ZONES, generate_sensor_history
from ..services.firebase_service import firebase_service

router = APIRouter(prefix="/api/sensors", tags=["Sensors & IoT"])

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
    zone_match = None
    for zone in STORAGE_ZONES:
        if zone["name"].lower() == payload.storage_zone.lower() or zone["id"] == payload.storage_zone:
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

    # Re-evaluate status
    if payload.nh3 > 0.25 or payload.temperature > 5.0:
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

    return {
        "status": "success",
        "message": f"Telemetry ingested for {zone_match['name']}",
        "firebase_synced": firebase_pushed,
        "data": zone_match,
        "received_at": datetime.now().isoformat()
    }
