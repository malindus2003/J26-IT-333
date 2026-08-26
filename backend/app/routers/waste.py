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
