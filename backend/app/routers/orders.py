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
