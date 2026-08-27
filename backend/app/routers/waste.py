from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import os

router = APIRouter(prefix="/api/waste", tags=["Component 4: Smart Waste Bin Monitoring"])

SMART_BINS = [
    {
        "id": "bin-1",
        "name": "Kitchen Main Food Waste Bin #1",
        "category": "Organic Food Solids",
        "fill_level_pct": 82.5,
        "current_weight_kg": 24.8,
        "max_capacity_kg": 30.0,
        "status": "warning",
        "temperature_c": 22.4,
        "last_emptied": "Today, 06:30 AM"
    }
]

@router.get("/bins")
def get_waste_bins():
    """Retrieve live telemetry for all smart waste bins."""
    return {"bins": SMART_BINS, "timestamp": datetime.now().isoformat()}

@router.post("/telemetry")
def update_bin_telemetry(bin_id: str, distance_cm: float, weight_raw: float):
    """Process ultrasonic distance (cm) and load-cell weight (kg) from ESP32."""
    bin_obj = next((b for b in SMART_BINS if b["id"] == bin_id), None)
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Waste bin not found")
    fill_pct = max(0.0, min(100.0, round((100.0 - distance_cm) / 100.0 * 100.0, 1)))
    bin_obj["fill_level_pct"] = fill_pct
    bin_obj["current_weight_kg"] = round(weight_raw, 2)
    return {"status": "success", "bin": bin_obj}

WASTE_CATEGORY_RATES = {
    "Organic Food Solids": 450.0, # LKR per kg loss
    "Liquid & Slurry Waste": 200.0,
    "Recyclable Plastic": 80.0,
    "Paper & Cardboard": 40.0
}

@router.get("/analytics")
def get_waste_cost_analytics():
    """Compute financial losses and waste reduction recommendations."""
    total_weight = sum(b["current_weight_kg"] for b in SMART_BINS)
    total_loss_lkr = sum(b["current_weight_kg"] * WASTE_CATEGORY_RATES.get(b["category"], 300.0) for b in SMART_BINS)
    return {
        "total_waste_kg_today": round(total_weight, 2),
        "total_financial_loss_lkr": round(total_loss_lkr, 2)
    }
