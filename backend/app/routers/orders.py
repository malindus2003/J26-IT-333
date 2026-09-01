from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter(prefix="/api/orders", tags=["Operations: Order Management & POS"])

POS_MENU = [
    {"id": "dish-1", "name": "Sri Lankan Chicken Rice & Curry", "price": 1200.0, "category": "Mains", "image": "/images/dishes/dish_1.jpg"}
]

@router.get("/menu")
def get_pos_menu():
    return {"menu": POS_MENU}

TABLES_FLOOR = [
    {"table_number": 1, "capacity": 4, "status": "occupied", "active_order_id": "ORD-101", "guest_count": 3}
]

@router.get("/tables")
def get_floor_tables():
    return {"tables": TABLES_FLOOR}

@router.patch("/{order_id}/kds-status")
def update_kds_status(order_id: str, new_status: str):
    """Progress order ticket through 3-stage KDS pass (Prep -> Cooking -> Ready)."""
    return {"status": "success", "order_id": order_id, "kds_stage": new_status}
