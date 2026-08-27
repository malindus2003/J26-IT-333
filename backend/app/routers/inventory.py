from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from ..data.mock_data import INITIAL_INVENTORY, STORAGE_ZONES
from ..models.ml_engine import ml_spoilage_engine
from ..schemas import SensorReading

router = APIRouter(prefix="/api/inventory", tags=["Inventory Management"])

# In-memory inventory state
inventory_db = list(INITIAL_INVENTORY)

# Minimum safe stock threshold in kg per category
MIN_STOCK_THRESHOLDS_KG = {
    "Fruits": 15.0,
    "Vegetables": 12.0,
    "Meat": 10.0,
    "Fish": 8.0,
    "Dairy": 15.0
}

# Unit cost estimate in LKR per kg for valuation
UNIT_COST_LKR_PER_KG = {
    "Fruits": 450.0,
    "Vegetables": 320.0,
    "Meat": 1850.0,
    "Fish": 2200.0,
    "Dairy": 650.0
}

class RestockPayload(BaseModel):
    name: str
    category: str
    storage_zone: str
    batch_number: Optional[str] = None
    quantity_kg: float
    unit_cost_lkr: Optional[float] = None
    supplier: Optional[str] = "Ceylon Organic Agricoop"

@router.get("/items")
def get_inventory_items(category: Optional[str] = None, risk_level: Optional[str] = None):
    """List all tracked perishable food batches with FIFO priority tags and reorder metrics."""
    items = inventory_db
    if category and category.lower() != "all":
        items = [i for i in items if i["category"].lower() == category.lower()]
    if risk_level and risk_level.lower() != "all":
        items = [i for i in items if i["risk_level"].lower() == risk_level.lower()]
    
    # Calculate stock valuation and FIFO priority
    total_val_lkr = 0.0
    for it in items:
        qty_num = 10.0
        try:
            qty_num = float(str(it.get("quantity", "10")).replace(" kg", "").replace(" L", ""))
        except ValueError:
            pass
        cat = it.get("category", "Fruits")
        unit_cost = UNIT_COST_LKR_PER_KG.get(cat, 500.0)
        it["stock_valuation_lkr"] = round(qty_num * unit_cost, 2)
        total_val_lkr += it["stock_valuation_lkr"]

        # Tag lowest RSL batch for Smart FIFO
        it["is_smart_fifo_target"] = (it.get("remaining_shelf_life_hours", 48.0) < 24.0 or it.get("risk_level") == "High")
        it["reorder_needed"] = qty_num <= MIN_STOCK_THRESHOLDS_KG.get(cat, 10.0)

    return {
        "items": items,
        "total_count": len(items),
        "total_stock_valuation_lkr": round(total_val_lkr, 2)
    }

@router.post("/items")
def add_inventory_item(item: Dict[str, Any]):
    """Register a new perishable inventory batch into cold storage."""
    new_id = f"inv-{len(inventory_db) + 1:03d}"
    
    zone = next((z for z in STORAGE_ZONES if z["name"] == item.get("storage_zone")), STORAGE_ZONES[0])
    sensor = SensorReading(
        storage_zone=zone["name"],
        temperature=zone["current_temp"],
        humidity=zone["current_humidity"],
        nh3=zone["nh3"],
        co2=zone["co2"],
        voc=zone["voc"]
    )
    
    pred = ml_spoilage_engine.predict(
        item_name=item.get("name", "New Item"),
        category=item.get("category", "Fruits"),
        storage_duration_hours=float(item.get("storage_duration_hours", 0.0)),
        sensor=sensor
    )

    new_item = {
        "id": new_id,
        "name": item.get("name"),
        "category": item.get("category"),
        "storage_zone": zone["name"],
        "batch_number": item.get("batch_number", f"BAT-{datetime.now().strftime('%Y%m%d-%H%M')}"),
        "quantity": item.get("quantity", "10.0 kg"),
        "stored_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": float(item.get("storage_duration_hours", 0.0)),
        "current_temp": zone["current_temp"],
        "current_humidity": zone["current_humidity"],
        "current_nh3": zone["nh3"],
        "current_co2": zone["co2"],
        "current_voc": zone["voc"],
        "spoilage_prob": pred.spoilage_probability,
        "remaining_shelf_life_hours": pred.remaining_shelf_life_hours,
        "risk_level": pred.risk_level,
        "status": "Fresh" if pred.risk_level == "Low" else ("Action Required" if pred.risk_level == "High" else ("Spoiled" if pred.risk_level == "Critical" else "Moderate")),
        "recommendation": pred.recommendations[0] if pred.recommendations else "Standard rotation"
    }

    inventory_db.insert(0, new_item)
    return {"status": "success", "item": new_item}

@router.post("/restock")
def restock_shipment(payload: RestockPayload):
    """Receive a fresh supplier shipment to replenish depleted inventory."""
    batch_code = payload.batch_number or f"BAT-SHIP-{datetime.now().strftime('%m%d-%H%M')}"
    
    zone = next((z for z in STORAGE_ZONES if z["name"] == payload.storage_zone), STORAGE_ZONES[0])
    sensor = SensorReading(
        storage_zone=zone["name"],
        temperature=zone["current_temp"],
        humidity=zone["current_humidity"],
        nh3=zone["nh3"],
        co2=zone["co2"],
        voc=zone["voc"]
    )

    pred = ml_spoilage_engine.predict(
        item_name=payload.name,
        category=payload.category,
        storage_duration_hours=0.0,
        sensor=sensor
    )

    new_batch = {
        "id": f"inv-{len(inventory_db) + 101:03d}",
        "name": payload.name,
        "category": payload.category,
        "storage_zone": zone["name"],
        "batch_number": batch_code,
        "quantity": f"{payload.quantity_kg:.1f} kg",
        "stored_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "storage_duration_hours": 0.0,
        "current_temp": zone["current_temp"],
        "current_humidity": zone["current_humidity"],
        "current_nh3": zone["nh3"],
        "current_co2": zone["co2"],
        "current_voc": zone["voc"],
        "spoilage_prob": pred.spoilage_probability,
        "remaining_shelf_life_hours": pred.remaining_shelf_life_hours,
        "risk_level": "Low",
        "status": "Fresh Harvest (New Stock)",
        "supplier": payload.supplier,
        "recommendation": f"Optimal cold storage in {zone['name'].split(':')[0]}."
    }

    inventory_db.insert(0, new_batch)
    return {"status": "success", "batch": new_batch, "message": f"Successfully received {payload.quantity_kg}kg of {payload.name}"}

@router.get("/reorder-alerts")
def get_reorder_alerts():
    """Identify ingredients that have fallen below safe thresholds due to order consumption."""
    alerts = []
    category_totals = {}

    for it in inventory_db:
        cat = it.get("category", "Fruits")
        try:
            qty = float(str(it.get("quantity", "0")).replace(" kg", "").replace(" L", ""))
        except ValueError:
            qty = 0.0
        category_totals[cat] = category_totals.get(cat, 0.0) + qty

    for cat, total_qty in category_totals.items():
        min_thresh = MIN_STOCK_THRESHOLDS_KG.get(cat, 10.0)
        if total_qty <= min_thresh:
            alerts.append({
                "category": cat,
                "current_stock_kg": round(total_qty, 1),
                "threshold_kg": min_thresh,
                "deficit_kg": round(min_thresh - total_qty, 1),
                "severity": "high" if total_qty < (min_thresh * 0.5) else "medium",
                "message": f"Low Stock Warning: {cat} inventory is down to {total_qty:.1f}kg (Threshold: {min_thresh}kg).",
                "suggested_po": f"Place PO for +{min_thresh * 2:.0f}kg {cat} from approved agricultural supplier."
            })

    return {"alerts": alerts, "total_low_stock_categories": len(alerts)}

@router.delete("/items/{item_id}")
def delete_inventory_item(item_id: str):
    """Remove a dispatched or disposed food batch."""
    global inventory_db
    inventory_db = [i for i in inventory_db if i["id"] != item_id]
    return {"status": "success", "message": f"Item {item_id} removed"}
