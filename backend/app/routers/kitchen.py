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

HOURLY_THROUGHPUT_PREDICTION = [
    {"hour": "12:00 PM", "predicted_tickets": 52, "capacity_pct": 88},
    {"hour": "01:00 PM", "predicted_tickets": 64, "capacity_pct": 96}
]

@router.get("/throughput-forecast")
def get_kitchen_throughput_forecast():
    """Returns hourly predicted ticket volumes and kitchen line capacity utilization."""
    return {"hourly_forecast": HOURLY_THROUGHPUT_PREDICTION}
