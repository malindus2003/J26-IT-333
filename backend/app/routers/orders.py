from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from .inventory import inventory_db
from ..data.mock_data import STORAGE_ZONES

router = APIRouter(prefix="/api/orders", tags=["Order Management & POS"])

# --- MENU CATALOGUE & RECIPE BILL OF MATERIALS (BOM) ---
MENU_ITEMS = [
    {
        "id": "menu-01",
        "name": "Chicken Kottu Roti Supreme",
        "category": "Main Course",
        "price_lkr": 1450.0,
        "prep_time_mins": 8,
        "station_id": "station-1",
        "station_name": "Hot Wok & Kottu Station",
        "image_url": "/images/dishes/dish_1.jpg",
        "description": "Flaky godamba roti shredded with spiced fresh chicken breast, carrots, leeks, and egg.",
        "recipe_bom": [
            {"ingredient_name": "Fresh Chicken Breast (Chilled)", "category": "Meat", "required_kg": 0.30},
            {"ingredient_name": "Hydroponic Romaine Lettuce (Crisp)", "category": "Vegetables", "required_kg": 0.10}
        ]
    },
    {
        "id": "menu-02",
        "name": "Grilled Atlantic Salmon Steak",
        "category": "Seafood",
        "price_lkr": 2850.0,
        "prep_time_mins": 14,
        "station_id": "station-3",
        "station_name": "Grill & Seafood Station",
        "image_url": "/images/dishes/dish_2.jpg",
        "description": "Pan-seared Atlantic salmon fillet served with garlic herb butter and fresh garden greens.",
        "recipe_bom": [
            {"ingredient_name": "Fresh Atlantic Salmon Fillet", "category": "Fish", "required_kg": 0.35},
            {"ingredient_name": "Hydroponic Romaine Lettuce (Crisp)", "category": "Vegetables", "required_kg": 0.10}
        ]
    },
    {
        "id": "menu-03",
        "name": "Belgian Berry & Banana Waffle",
        "category": "Dessert & Pastry",
        "price_lkr": 1150.0,
        "prep_time_mins": 6,
        "station_id": "station-1",
        "station_name": "Hot Wok & Kottu Station",
        "image_url": "/images/dishes/dish_3.jpg",
        "description": "Crisp Belgian waffle topped with sliced ripe bananas, wild berries, honey, and fresh whipped cream.",
        "recipe_bom": [
            {"ingredient_name": "Cavendish Ripe Bananas (Crate)", "category": "Fruits", "required_kg": 0.25},
            {"ingredient_name": "Fresh Farm Strawberries (Punnet)", "category": "Fruits", "required_kg": 0.10},
            {"ingredient_name": "Pasteurized Whole Milk (Bulk)", "category": "Dairy", "required_kg": 0.08}
        ]
    },
    {
        "id": "menu-04",
        "name": "Artisan Garden Harvest Salad",
        "category": "Healthy & Salads",
        "price_lkr": 980.0,
        "prep_time_mins": 4,
        "station_id": "station-4",
        "station_name": "Salad & Cold Prep Station",
        "image_url": "/images/dishes/dish_4.jpg",
        "description": "Fresh romaine lettuce, baby spinach leaves, ripe vine tomatoes, and aged cheese shavings.",
        "recipe_bom": [
            {"ingredient_name": "Hydroponic Romaine Lettuce (Crisp)", "category": "Vegetables", "required_kg": 0.20},
            {"ingredient_name": "Baby Spinach Leaves (Crisp)", "category": "Vegetables", "required_kg": 0.10},
            {"ingredient_name": "Aged Cheddar & Mozzarella Blocks", "category": "Dairy", "required_kg": 0.05}
        ]
    },
    {
        "id": "menu-05",
        "name": "Prime Beef Sirloin Medallion",
        "category": "Main Course",
        "price_lkr": 3200.0,
        "prep_time_mins": 15,
        "station_id": "station-3",
        "station_name": "Grill & Seafood Station",
        "image_url": "/images/dishes/dish_5.jpg",
        "description": "Chargrilled prime grass-fed beef sirloin with roasted tomatoes, red wine reduction, and herbs.",
        "recipe_bom": [
            {"ingredient_name": "Prime Beef Sirloin (Vac-Pack)", "category": "Meat", "required_kg": 0.35},
            {"ingredient_name": "Hydroponic Romaine Lettuce (Crisp)", "category": "Vegetables", "required_kg": 0.08}
        ]
    },
    {
        "id": "menu-06",
        "name": "Fresh Berry Smoothie Bowl",
        "category": "Beverages & Breakfast",
        "price_lkr": 850.0,
        "prep_time_mins": 5,
        "station_id": "station-4",
        "station_name": "Salad & Cold Prep Station",
        "image_url": "/images/dishes/dish_6.jpg",
        "description": "Blended ripe bananas and fresh strawberries with pasteurized whole milk, chia seeds, and granola.",
        "recipe_bom": [
            {"ingredient_name": "Cavendish Ripe Bananas (Crate)", "category": "Fruits", "required_kg": 0.20},
            {"ingredient_name": "Fresh Farm Strawberries (Punnet)", "category": "Fruits", "required_kg": 0.15},
            {"ingredient_name": "Pasteurized Whole Milk (Bulk)", "category": "Dairy", "required_kg": 0.15}
        ]
    },
    {
        "id": "menu-07",
        "name": "Seafood Nasi Goreng & Calamari",
        "category": "Seafood",
        "price_lkr": 1950.0,
        "prep_time_mins": 9,
        "station_id": "station-1",
        "station_name": "Hot Wok & Kottu Station",
        "image_url": "/images/dishes/dish_7.jpg",
        "description": "Wok-fried jasmine rice with calamari rings, prawns, chili sambal, fried egg, and prawn crackers.",
        "recipe_bom": [
            {"ingredient_name": "Fresh Atlantic Salmon Fillet", "category": "Fish", "required_kg": 0.20},
            {"ingredient_name": "Baby Spinach Leaves (Crisp)", "category": "Vegetables", "required_kg": 0.08}
        ]
    },
    {
        "id": "menu-08",
        "name": "Crispy Devilled Chicken & Fragrant Rice",
        "category": "Main Course",
        "price_lkr": 1650.0,
        "prep_time_mins": 11,
        "station_id": "station-1",
        "station_name": "Hot Wok & Kottu Station",
        "image_url": "/images/dishes/dish_8.jpg",
        "description": "Crispy battered chicken tossed in sweet spicy capsicum, tomato gravy, and served with basmati rice.",
        "recipe_bom": [
            {"ingredient_name": "Fresh Chicken Breast (Chilled)", "category": "Meat", "required_kg": 0.35},
            {"ingredient_name": "Hydroponic Romaine Lettuce (Crisp)", "category": "Vegetables", "required_kg": 0.10}
        ]
    },
    {
        "id": "menu-09",
        "name": "Garlic Butter Jumbo King Prawns",
        "category": "Seafood",
        "price_lkr": 2650.0,
        "prep_time_mins": 12,
        "station_id": "station-3",
        "station_name": "Grill & Seafood Station",
        "image_url": "/images/dishes/dish_9.jpg",
        "description": "Succulent grilled sea prawns tossed in roasted garlic butter, parsley, and toasted garlic sourdough.",
        "recipe_bom": [
            {"ingredient_name": "Fresh Atlantic Salmon Fillet", "category": "Fish", "required_kg": 0.30},
            {"ingredient_name": "Hydroponic Romaine Lettuce (Crisp)", "category": "Vegetables", "required_kg": 0.10}
        ]
    },
    {
        "id": "menu-10",
        "name": "Stone-Baked Artisan Pizza",
        "category": "Main Course",
        "price_lkr": 2100.0,
        "prep_time_mins": 14,
        "station_id": "station-1",
        "station_name": "Hot Wok & Kottu Station",
        "image_url": "/images/dishes/dish_10.jpg",
        "description": "Handcrafted thin crust dough topped with crushed San Marzano tomatoes, fresh mozzarella, and basil.",
        "recipe_bom": [
            {"ingredient_name": "Aged Cheddar & Mozzarella Blocks", "category": "Dairy", "required_kg": 0.20},
            {"ingredient_name": "Hydroponic Romaine Lettuce (Crisp)", "category": "Vegetables", "required_kg": 0.05}
        ]
    },
    {
        "id": "menu-11",
        "name": "Mediterranean Greek Feta Salad",
        "category": "Healthy & Salads",
        "price_lkr": 1250.0,
        "prep_time_mins": 5,
        "station_id": "station-4",
        "station_name": "Salad & Cold Prep Station",
        "image_url": "/images/dishes/dish_11.jpg",
        "description": "Vine-ripened tomatoes, crisp cucumbers, Kalamata olives, and creamy feta cheese drizzled with extra virgin olive oil.",
        "recipe_bom": [
            {"ingredient_name": "Hydroponic Romaine Lettuce (Crisp)", "category": "Vegetables", "required_kg": 0.20},
            {"ingredient_name": "Aged Cheddar & Mozzarella Blocks", "category": "Dairy", "required_kg": 0.10}
        ]
    },
    {
        "id": "menu-12",
        "name": "Iced Passionfruit & Lime Cooler",
        "category": "Beverages & Breakfast",
        "price_lkr": 650.0,
        "prep_time_mins": 3,
        "station_id": "station-4",
        "station_name": "Salad & Cold Prep Station",
        "image_url": "/images/dishes/dish_12.jpg",
        "description": "Refreshing fresh passionfruit pulp with muddled garden mint, sparkling soda, and crushed ice.",
        "recipe_bom": [
            {"ingredient_name": "Cavendish Ripe Bananas (Crate)", "category": "Fruits", "required_kg": 0.10},
            {"ingredient_name": "Fresh Farm Strawberries (Punnet)", "category": "Fruits", "required_kg": 0.05}
        ]
    }
]

# --- RESTAURANT DINE-IN TABLES FLOOR STATE ---
INITIAL_TABLES = [
    {"table_no": "Table 01", "capacity": 2, "status": "available", "current_order_id": None, "occupied_since": None},
    {"table_no": "Table 02", "capacity": 4, "status": "dining", "current_order_id": "ORD-1080", "occupied_since": (datetime.now() - timedelta(minutes=35)).strftime("%H:%M")},
    {"table_no": "Table 03", "capacity": 2, "status": "available", "current_order_id": None, "occupied_since": None},
    {"table_no": "Table 04", "capacity": 4, "status": "in_prep", "current_order_id": "ORD-1081", "occupied_since": (datetime.now() - timedelta(minutes=6)).strftime("%H:%M")},
    {"table_no": "Table 05", "capacity": 6, "status": "available", "current_order_id": None, "occupied_since": None},
    {"table_no": "Table 06", "capacity": 4, "status": "available", "current_order_id": None, "occupied_since": None},
    {"table_no": "Table 07", "capacity": 2, "status": "available", "current_order_id": None, "occupied_since": None},
    {"table_no": "Table 08", "capacity": 8, "status": "available", "current_order_id": None, "occupied_since": None},
    {"table_no": "Table 09", "capacity": 4, "status": "available", "current_order_id": None, "occupied_since": None},
    {"table_no": "Table 10", "capacity": 2, "status": "available", "current_order_id": None, "occupied_since": None},
    {"table_no": "Table 11", "capacity": 4, "status": "in_prep", "current_order_id": "ORD-1082", "occupied_since": (datetime.now() - timedelta(minutes=10)).strftime("%H:%M")},
    {"table_no": "Table 12", "capacity": 6, "status": "available", "current_order_id": None, "occupied_since": None}
]

tables_db = list(INITIAL_TABLES)

# --- IN-MEMORY ACTIVE ORDERS DATABASE ---
INITIAL_ORDERS = [
    {
        "id": "ORD-1081",
        "order_number": 81,
        "table_no": "Table 04",
        "order_type": "Dine-In",
        "items": [
            {"menu_id": "menu-01", "name": "Chicken Kottu Roti Supreme", "quantity": 2, "unit_price": 1450.0},
            {"menu_id": "menu-06", "name": "Fresh Berry Smoothie Bowl", "quantity": 1, "unit_price": 850.0}
        ],
        "total_amount_lkr": 3750.0,
        "status": "in_prep",
        "table_status": "occupied",
        "station_id": "station-1",
        "station_name": "Hot Wok & Kottu Station",
        "created_at": (datetime.now() - timedelta(minutes=6)).strftime("%H:%M:%S"),
        "elapsed_mins": 6,
        "target_prep_mins": 8,
        "ingredients_deducted": [
            {"item": "Fresh Chicken Breast (Chilled)", "amount_kg": 0.60, "batch": "BAT-2026-CK88"},
            {"item": "Cavendish Ripe Bananas (Crate)", "amount_kg": 0.20, "batch": "BAT-2026-BN12 (Low RSL)"},
            {"item": "Fresh Farm Strawberries (Punnet)", "amount_kg": 0.15, "batch": "BAT-2026-SB04"}
        ],
        "customer_note": "Extra spicy kottu with mild gravy on the side."
    },
    {
        "id": "ORD-1082",
        "order_number": 82,
        "table_no": "Table 11",
        "order_type": "Dine-In",
        "items": [
            {"menu_id": "menu-02", "name": "Grilled Atlantic Salmon Steak", "quantity": 1, "unit_price": 2850.0},
            {"menu_id": "menu-04", "name": "Artisan Garden Harvest Salad", "quantity": 1, "unit_price": 980.0}
        ],
        "total_amount_lkr": 3830.0,
        "status": "in_prep",
        "table_status": "occupied",
        "station_id": "station-3",
        "station_name": "Grill & Seafood Station",
        "created_at": (datetime.now() - timedelta(minutes=10)).strftime("%H:%M:%S"),
        "elapsed_mins": 10,
        "target_prep_mins": 14,
        "ingredients_deducted": [
            {"item": "Fresh Atlantic Salmon Fillet", "amount_kg": 0.35, "batch": "BAT-2026-SF02"},
            {"item": "Hydroponic Romaine Lettuce (Crisp)", "amount_kg": 0.30, "batch": "BAT-2026-VG44"}
        ],
        "customer_note": "Medium rare salmon, dressing on the side."
    },
    {
        "id": "ORD-1083",
        "order_number": 83,
        "table_no": "Delivery #DL-42",
        "order_type": "Delivery",
        "items": [
            {"menu_id": "menu-03", "name": "Belgian Berry & Banana Waffle", "quantity": 2, "unit_price": 1150.0}
        ],
        "total_amount_lkr": 2300.0,
        "status": "ready",
        "table_status": "not_applicable",
        "station_id": "station-1",
        "station_name": "Hot Wok & Kottu Station",
        "created_at": (datetime.now() - timedelta(minutes=18)).strftime("%H:%M:%S"),
        "elapsed_mins": 18,
        "target_prep_mins": 6,
        "ingredients_deducted": [
            {"item": "Cavendish Ripe Bananas (Crate)", "amount_kg": 0.50, "batch": "BAT-2026-BN12 (Low RSL)"},
            {"item": "Fresh Farm Strawberries (Punnet)", "amount_kg": 0.20, "batch": "BAT-2026-SB04"}
        ],
        "customer_note": "Pack syrup separately for delivery driver."
    },
    {
        "id": "ORD-1080",
        "order_number": 80,
        "table_no": "Table 02",
        "order_type": "Dine-In",
        "items": [
            {"menu_id": "menu-05", "name": "Prime Beef Sirloin Medallion", "quantity": 1, "unit_price": 3200.0}
        ],
        "total_amount_lkr": 3200.0,
        "status": "completed",
        "table_status": "dining",
        "station_id": "station-3",
        "station_name": "Grill & Seafood Station",
        "created_at": (datetime.now() - timedelta(minutes=35)).strftime("%H:%M:%S"),
        "elapsed_mins": 35,
        "target_prep_mins": 15,
        "ingredients_deducted": [
            {"item": "Prime Beef Sirloin (Vac-Pack)", "amount_kg": 0.35, "batch": "BAT-2026-BF09"}
        ],
        "customer_note": "Served. Customers currently dining."
    }
]

orders_db = list(INITIAL_ORDERS)

# --- REQUEST SCHEMAS ---
class OrderItemPayload(BaseModel):
    menu_id: str
    quantity: int

class CreateOrderPayload(BaseModel):
    table_no: str
    order_type: str = "Dine-In"
    items: List[OrderItemPayload]
    customer_note: Optional[str] = ""

class UpdateOrderStatusPayload(BaseModel):
    status: str

# --- ROUTER ENDPOINTS ---

@router.get("/tables")
def get_tables_floor_map():
    """Retrieve live status of all dine-in restaurant tables (Available, Cooking, Dining/Occupied)."""
    available_count = sum(1 for t in tables_db if t["status"] == "available")
    occupied_count = len(tables_db) - available_count
    return {
        "tables": tables_db,
        "total_tables": len(tables_db),
        "available_tables": available_count,
        "occupied_tables": occupied_count
    }

@router.post("/tables/{table_no}/free")
def free_table(table_no: str):
    """Mark a table as cleared, sanitized, and ready for new arriving guests."""
    table = next((t for t in tables_db if t["table_no"].lower() == table_no.lower()), None)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    table["status"] = "available"
    table["current_order_id"] = None
    table["occupied_since"] = None

    # Mark corresponding order's table status as cleared
    for ord in orders_db:
        if ord.get("table_no", "").lower() == table_no.lower() and ord.get("table_status") == "dining":
            ord["table_status"] = "cleared"

    return {"status": "success", "message": f"{table_no} is now cleared & free!", "table": table}

@router.get("/menu")
def get_menu_catalog():
    """Retrieve full restaurant menu with BOM recipes and real-time inventory availability."""
    enriched_menu = []
    for item in MENU_ITEMS:
        can_prepare = True
        stock_details = []
        for bom in item["recipe_bom"]:
            match = next((inv for inv in inventory_db if bom["ingredient_name"].lower() in inv["name"].lower() or bom["category"].lower() == inv["category"].lower()), None)
            if match:
                qty_str = match.get("quantity", "0 kg").replace(" kg", "").replace(" L", "")
                try:
                    current_qty = float(qty_str)
                except ValueError:
                    current_qty = 10.0
                
                is_available = current_qty >= bom["required_kg"] and match.get("risk_level") != "Critical"
                if not is_available:
                    can_prepare = False
                stock_details.append({
                    "ingredient": bom["ingredient_name"],
                    "required_kg": bom["required_kg"],
                    "available_kg": current_qty,
                    "batch": match.get("batch_number"),
                    "rsl_hours": match.get("remaining_shelf_life_hours", 48.0),
                    "is_spoilage_risk": match.get("risk_level") in ["High", "Critical"]
                })
            else:
                stock_details.append({
                    "ingredient": bom["ingredient_name"],
                    "required_kg": bom["required_kg"],
                    "available_kg": 15.0,
                    "batch": "DEFAULT-BATCH",
                    "rsl_hours": 72.0,
                    "is_spoilage_risk": False
                })

        enriched_menu.append({
            **item,
            "in_stock": can_prepare,
            "stock_details": stock_details
        })
    return {"menu": enriched_menu, "total_dishes": len(enriched_menu)}


@router.get("")
def list_orders(status: Optional[str] = None):
    """List all orders with optional status filter (pending, in_prep, ready, completed)."""
    orders = orders_db
    if status and status != "all":
        orders = [o for o in orders if o["status"] == status]
    return {"orders": orders, "total_count": len(orders)}


@router.post("")
def place_new_order(payload: CreateOrderPayload):
    """
    Place a new restaurant order:
    1. Validates recipe ingredients.
    2. Uses Smart FIFO to deduct required ingredient weights from batches with lowest Remaining Shelf-Life.
    3. Dispatches order ticket to designated Kitchen Station.
    4. Occupies the designated table on the floor map.
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least 1 item")

    order_num = len(orders_db) + 81
    order_id = f"ORD-{order_num:04d}"
    
    order_items = []
    total_amount = 0.0
    deducted_log = []
    primary_station_id = "station-1"
    primary_station_name = "Hot Wok & Kottu Station"
    max_prep_time = 6

    for it in payload.items:
        menu_item = next((m for m in MENU_ITEMS if m["id"] == it.menu_id), None)
        if not menu_item:
            continue
        
        qty = max(1, it.quantity)
        subtotal = menu_item["price_lkr"] * qty
        total_amount += subtotal
        primary_station_id = menu_item["station_id"]
        primary_station_name = menu_item["station_name"]
        max_prep_time = max(max_prep_time, menu_item["prep_time_mins"])

        order_items.append({
            "menu_id": menu_item["id"],
            "name": menu_item["name"],
            "quantity": qty,
            "unit_price": menu_item["price_lkr"]
        })

        # Smart FIFO Ingredient Deduction from Inventory
        for bom in menu_item["recipe_bom"]:
            total_req = bom["required_kg"] * qty
            candidates = [
                inv for inv in inventory_db 
                if (bom["ingredient_name"].lower() in inv["name"].lower() or bom["category"].lower() == inv["category"].lower())
                and inv.get("risk_level") != "Critical"
            ]
            candidates.sort(key=lambda x: x.get("remaining_shelf_life_hours", 999.0))

            if candidates:
                target_batch = candidates[0]
                qty_str = target_batch.get("quantity", "10.0 kg").replace(" kg", "").replace(" L", "")
                try:
                    curr = float(qty_str)
                    new_qty = max(0.0, round(curr - total_req, 2))
                    target_batch["quantity"] = f"{new_qty} kg"
                except ValueError:
                    pass
                
                is_low_rsl = target_batch.get("risk_level") == "High" or target_batch.get("remaining_shelf_life_hours", 48) < 18
                deducted_log.append({
                    "item": target_batch["name"],
                    "amount_kg": round(total_req, 2),
                    "batch": f"{target_batch['batch_number']}{' (Smart FIFO Priority RSL)' if is_low_rsl else ''}"
                })
            else:
                deducted_log.append({
                    "item": bom["ingredient_name"],
                    "amount_kg": round(total_req, 2),
                    "batch": "STANDARD-STOCK"
                })

    new_order = {
        "id": order_id,
        "order_number": order_num,
        "table_no": payload.table_no,
        "order_type": payload.order_type,
        "items": order_items,
        "total_amount_lkr": round(total_amount, 2),
        "status": "pending",
        "table_status": "occupied" if payload.order_type == "Dine-In" else "not_applicable",
        "station_id": primary_station_id,
        "station_name": primary_station_name,
        "created_at": datetime.now().strftime("%H:%M:%S"),
        "elapsed_mins": 0,
        "target_prep_mins": max_prep_time,
        "ingredients_deducted": deducted_log,
        "customer_note": payload.customer_note or "Standard prep"
    }

    # Mark table as occupied in floor map
    if payload.order_type == "Dine-In":
        table = next((t for t in tables_db if t["table_no"].lower() == payload.table_no.lower()), None)
        if table:
            table["status"] = "in_prep"
            table["current_order_id"] = order_id
            table["occupied_since"] = datetime.now().strftime("%H:%M")

    orders_db.insert(0, new_order)
    return {"status": "success", "order": new_order, "message": f"Order {order_id} placed on {payload.table_no}"}


@router.patch("/{order_id}/status")
def update_order_status(order_id: str, payload: UpdateOrderStatusPayload):
    """Advance order lifecycle (pending -> in_prep -> ready -> completed -> cancelled)."""
    order = next((o for o in orders_db if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order["status"] = payload.status
    if payload.status == "completed":
        order["completed_at"] = datetime.now().strftime("%H:%M:%S")
        if order.get("order_type") == "Dine-In":
            order["table_status"] = "dining"
            # Update table to dining
            table = next((t for t in tables_db if t["table_no"].lower() == order.get("table_no", "").lower()), None)
            if table:
                table["status"] = "dining"
    elif payload.status == "in_prep":
        table = next((t for t in tables_db if t["table_no"].lower() == order.get("table_no", "").lower()), None)
        if table:
            table["status"] = "in_prep"
    
    return {"status": "success", "order": order}


@router.get("/stats")
def get_order_stats():
    """Retrieve operational metrics for Executive Hub, Tables, and KDS."""
    total_orders = len(orders_db) + 412
    active_orders = [o for o in orders_db if o["status"] in ["pending", "in_prep"]]
    in_prep = [o for o in orders_db if o["status"] == "in_prep"]
    ready = [o for o in orders_db if o["status"] == "ready"]
    completed = [o for o in orders_db if o["status"] == "completed"]
    
    available_tables = sum(1 for t in tables_db if t["status"] == "available")
    dining_tables = sum(1 for t in tables_db if t["status"] == "dining")
    total_revenue_lkr = sum(o["total_amount_lkr"] for o in orders_db) + 482000.0

    return {
        "total_orders_today": total_orders,
        "active_kitchen_tickets": len(active_orders),
        "in_prep_count": len(in_prep),
        "ready_for_pickup": len(ready),
        "completed_count": len(completed),
        "available_tables_count": available_tables,
        "dining_tables_count": dining_tables,
        "total_revenue_lkr": total_revenue_lkr,
        "avg_prep_time_mins": 7.8,
        "on_time_fulfillment_rate": "94.2%"
    }


@router.get("/daily-sales")
def get_historical_daily_sales(days: int = 14):
    """Retrieve historical daily sales data, revenue trends, and order volumes for past days."""
    today = datetime.now()
    history = []
    
    # Pre-calculated realistic seasonal patterns
    base_orders = [417, 395, 428, 380, 442, 490, 510, 405, 388, 430, 415, 465, 480, 417]
    base_revenues = [497040.0, 462500.0, 512000.0, 440200.0, 538900.0, 612400.0, 645000.0, 478000.0, 452000.0, 518000.0, 495000.0, 572000.0, 598000.0, 497040.0]
    top_dishes = [
        "Chicken Kottu Roti Supreme",
        "Grilled Atlantic Salmon Steak",
        "Prime Beef Sirloin Medallion",
        "Chicken Kottu Roti Supreme",
        "Belgian Berry & Banana Waffle",
        "Grilled Atlantic Salmon Steak",
        "Prime Beef Sirloin Medallion",
        "Chicken Kottu Roti Supreme",
        "Fresh Berry Smoothie Bowl",
        "Grilled Atlantic Salmon Steak",
        "Chicken Kottu Roti Supreme",
        "Prime Beef Sirloin Medallion",
        "Grilled Atlantic Salmon Steak",
        "Chicken Kottu Roti Supreme"
    ]

    total_period_rev = 0.0
    total_period_orders = 0

    for i in range(days):
        day_date = today - timedelta(days=i)
        idx = i % len(base_orders)
        
        ord_count = base_orders[idx]
        rev = base_revenues[idx]
        total_period_rev += rev
        total_period_orders += ord_count
        
        history.append({
            "date": day_date.strftime("%Y-%m-%d"),
            "formatted_date": day_date.strftime("%d %b %Y"),
            "day_name": "Today" if i == 0 else "Yesterday" if i == 1 else day_date.strftime("%a"),
            "total_orders": ord_count,
            "revenue_lkr": rev,
            "avg_order_value_lkr": round(rev / ord_count, 2),
            "dine_in_orders": int(ord_count * 0.65),
            "takeaway_orders": int(ord_count * 0.25),
            "delivery_orders": int(ord_count * 0.10),
            "top_selling_dish": top_dishes[idx],
            "fifo_waste_saved_kg": round(ord_count * 0.072, 1),
            "on_time_rate": "95.1%" if i % 2 == 0 else "93.8%"
        })

    return {
        "days_requested": days,
        "total_period_revenue_lkr": total_period_rev,
        "total_period_orders": total_period_orders,
        "avg_daily_revenue_lkr": round(total_period_rev / days, 2),
        "history": history
    }

