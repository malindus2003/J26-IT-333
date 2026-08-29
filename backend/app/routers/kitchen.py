from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter(prefix="/api/kitchen", tags=["Component 2: Kitchen Efficiency & Staff Optimization"])

KITCHEN_STATIONS = [
    {
        "id": "station-grill",
        "name": "Grill & Sauté Line",
        "active_orders": 8,
        "queue_wait_time_mins": 14.5,
        "efficiency_pct": 89.2,
        "assigned_staff": ["Chef Samantha P."],
        "status": "warning"
    }
]

@router.get("/stations")
def get_kitchen_stations():
    """Retrieve real-time station queues, wait times, and assigned chefs."""
    return {"stations": KITCHEN_STATIONS, "timestamp": datetime.now().isoformat()}
