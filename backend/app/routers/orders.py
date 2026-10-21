from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from .inventory import inventory_db
from ..data.mock_data import STORAGE_ZONES
from ..services.firebase_service import firebase_service

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
    portion_size: Optional[str] = None

class CreateOrderPayload(BaseModel):
    table_no: str
    order_type: str = "Dine-In"
    items: List[OrderItemPayload]
    customer_note: Optional[str] = ""

class UpdateOrderStatusPayload(BaseModel):
    status: str

class CreateMenuItemPayload(BaseModel):
    name: str
    category: str = "Main Course"
    price_lkr: float
    cost_lkr: Optional[float] = None
    prep_time_mins: int = 15
    station_id: Optional[str] = "station-1"
    station_name: Optional[str] = "Hot Wok & Kottu Station"
    image_url: Optional[str] = ""
    description: Optional[str] = ""
    recipe_bom: Optional[List[Dict[str, Any]]] = []
    has_portions: Optional[bool] = False
    portions: Optional[List[Dict[str, Any]]] = []
    current_stock: Optional[int] = 25
    branch_id: Optional[str] = "branch-hikkaduwa"

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
    # Synchronize any extra dishes persisted in Firebase Realtime Database
    if firebase_service.is_connected:
        try:
            fb_items = firebase_service.get_menu_items()
            if fb_items and isinstance(fb_items, dict):
                existing_ids = {m["id"] for m in MENU_ITEMS}
                for item_id, item_val in fb_items.items():
                    if item_id not in existing_ids and isinstance(item_val, dict):
                        bom = item_val.get("recipe_bom")
                        if not bom and "ingredients" in item_val:
                            bom = [
                                {
                                    "ingredient_name": ing.get("name", "Ingredient"),
                                    "category": "Vegetables",
                                    "required_kg": float(ing.get("ratio", 0.1))
                                }
                                for ing in item_val["ingredients"]
                            ]
                        elif not bom:
                            bom = []

                        MENU_ITEMS.append({
                            "id": item_id,
                            "name": item_val.get("name", "Dish"),
                            "category": item_val.get("category", "Main Course"),
                            "price_lkr": float(item_val.get("price_lkr") or item_val.get("price") or 1500.0),
                            "cost": float(item_val.get("cost") or 600.0),
                            "prep_time_mins": int(item_val.get("prep_time_mins") or item_val.get("prep_lead_time_mins") or 15),
                            "station_id": item_val.get("station_id") or "station-1",
                            "station_name": item_val.get("station_name") or "Hot Wok & Kottu Station",
                            "image_url": item_val.get("image_url") or "/images/dishes/dish_1.jpg",
                            "description": item_val.get("description") or "",
                            "recipe_bom": bom,
                            "branch_id": item_val.get("branch_id") or "branch-hikkaduwa"
                        })
                        existing_ids.add(item_id)
        except Exception:
            pass

    enriched_menu = []
    for item in MENU_ITEMS:
        can_prepare = True
        stock_details = []
        for bom in item.get("recipe_bom", []):
            match = next((inv for inv in inventory_db if bom.get("ingredient_name", "").lower() in inv["name"].lower() or bom.get("category", "").lower() == inv["category"].lower()), None)
            if match:
                qty_str = match.get("quantity", "0 kg").replace(" kg", "").replace(" L", "")
                try:
                    current_qty = float(qty_str)
                except ValueError:
                    current_qty = 10.0
                
                is_available = current_qty >= bom.get("required_kg", 0.1) and match.get("risk_level") != "Critical"
                if not is_available:
                    can_prepare = False
                stock_details.append({
                    "ingredient": bom.get("ingredient_name", ""),
                    "required_kg": bom.get("required_kg", 0.1),
                    "available_kg": current_qty,
                    "batch": match.get("batch_number"),
                    "rsl_hours": match.get("remaining_shelf_life_hours", 48.0),
                    "is_spoilage_risk": match.get("risk_level") in ["High", "Critical"]
                })
            else:
                stock_details.append({
                    "ingredient": bom.get("ingredient_name", ""),
                    "required_kg": bom.get("required_kg", 0.1),
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


@router.post("/menu")
def add_menu_item(payload: CreateMenuItemPayload):
    """
    Creates a new dish in the POS Food Menu and persists it to Firebase Realtime Database (/menu_items).
    Supports photo upload, category, price, prep time, station assignment, and BOM recipe ingredients.
    """
    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=400, detail="Dish name is required")
    if payload.price_lkr <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than zero")

    existing_ids = {m["id"] for m in MENU_ITEMS}
    new_index = len(MENU_ITEMS) + 1
    new_id = f"menu-{new_index:02d}"
    while new_id in existing_ids:
        new_index += 1
        new_id = f"menu-{new_index:02d}"

    station_names = {
        "station-1": "Hot Wok & Kottu Station",
        "station-2": "Curry & Rice Assembly Bay",
        "station-3": "Grill & Seafood Station",
        "station-4": "Salad & Cold Prep Station",
        "station-5": "Dessert & Beverage Bar"
    }
    station_id = payload.station_id or "station-1"
    station_name = payload.station_name or station_names.get(station_id, "Hot Wok & Kottu Station")

    bom_list = []
    for bom in (payload.recipe_bom or []):
        if bom.get("ingredient_name"):
            bom_list.append({
                "ingredient_name": bom.get("ingredient_name", "").strip(),
                "category": bom.get("category", "Vegetables"),
                "required_kg": float(bom.get("required_kg", 0.1))
            })

    ingredients_compat = [
        {
            "name": b["ingredient_name"],
            "qty_per_portion": f"{b['required_kg']}kg",
            "unit": "kg",
            "ratio": b["required_kg"]
        }
        for b in bom_list
    ]

    cleaned_portions = []
    for p in (payload.portions or []):
        if p.get("size"):
            p_boms = []
            for b in p.get("recipe_bom", []):
                if b.get("ingredient_name"):
                    p_boms.append({
                        "ingredient_name": b.get("ingredient_name", "").strip(),
                        "category": b.get("category", "Vegetables"),
                        "required_kg": float(b.get("required_kg", 0.1))
                    })
            cleaned_portions.append({
                "size": p.get("size"),
                "price_lkr": float(p.get("price_lkr", payload.price_lkr)),
                "prep_time_mins": int(p.get("prep_time_mins", payload.prep_time_mins)),
                "recipe_bom": p_boms
            })

    cost = float(payload.cost_lkr) if payload.cost_lkr else round(float(payload.price_lkr) * 0.45, 2)

    new_dish = {
        "id": new_id,
        "name": payload.name.strip(),
        "category": payload.category.strip(),
        "price_lkr": float(payload.price_lkr),
        "price": float(payload.price_lkr),
        "cost": cost,
        "prep_time_mins": int(payload.prep_time_mins),
        "prep_lead_time_mins": int(payload.prep_time_mins),
        "station_id": station_id,
        "station_name": station_name,
        "image_url": payload.image_url.strip() if payload.image_url else "/images/dishes/dish_1.jpg",
        "description": payload.description.strip() if payload.description else "",
        "has_portions": bool(payload.has_portions and cleaned_portions),
        "portions": cleaned_portions,
        "recipe_bom": bom_list,
        "ingredients": ingredients_compat,
        "current_stock": payload.current_stock or 25,
        "historical_avg": 50,
        "status": "Available",
        "branch_id": payload.branch_id or "branch-hikkaduwa",
        "created_at": datetime.now().isoformat()
    }

    # Prepend to MENU_ITEMS so it immediately shows at the top of the POS menu
    MENU_ITEMS.insert(0, new_dish)

    # Persist directly to Firebase Realtime Database at /menu_items/{new_id}
    firebase_saved = False
    if firebase_service.is_connected:
        firebase_saved = firebase_service.save_menu_item(new_id, new_dish)

    return {
        "status": "success",
        "message": f"Menu item '{new_dish['name']}' successfully added and saved to Firebase!",
        "firebase_synced": firebase_saved,
        "item": new_dish
    }


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

        # Portion variant resolution
        portion_variant = None
        if it.portion_size and menu_item.get("has_portions") and menu_item.get("portions"):
            portion_variant = next((p for p in menu_item["portions"] if str(p.get("size", "")).lower() == str(it.portion_size).lower()), None)

        unit_price = float(portion_variant["price_lkr"]) if (portion_variant and portion_variant.get("price_lkr")) else float(menu_item["price_lkr"])
        recipe_bom_to_use = portion_variant["recipe_bom"] if (portion_variant and portion_variant.get("recipe_bom")) else menu_item.get("recipe_bom", [])
        
        subtotal = unit_price * qty
        total_amount += subtotal
        primary_station_id = menu_item["station_id"]
        primary_station_name = menu_item["station_name"]
        max_prep_time = max(max_prep_time, menu_item["prep_time_mins"])

        item_display_name = f"{menu_item['name']} ({it.portion_size})" if it.portion_size else menu_item["name"]

        order_items.append({
            "menu_id": menu_item["id"],
            "name": item_display_name,
            "portion_size": it.portion_size or "",
            "quantity": qty,
            "unit_price": unit_price
        })

        # Smart FIFO Ingredient Deduction from Inventory
        for bom in recipe_bom_to_use:
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


# --- TABLE RESERVATIONS INTEGRATION ---

class OrderReservationPayload(BaseModel):
    customer_name: str
    pax: int
    date: Optional[str] = None
    shift: Optional[str] = "Dinner"
    table_number: Optional[str] = "Table 01"
    phone: Optional[str] = ""
    notes: Optional[str] = ""
    status: Optional[str] = "Confirmed"

class UpdateReservationStatusPayload(BaseModel):
    status: str

@router.get("/reservations")
def get_order_reservations(date: Optional[str] = None):
    """
    Retrieve live customer table reservations directly from Firebase Realtime Database (/reservations).
    Returns both filtered reservations for target date and the full list across dates.
    """
    target_date = date or datetime.now().strftime("%Y-%m-%d")
    all_res_list = []
    
    if firebase_service and firebase_service.is_connected:
        try:
            raw_all = firebase_service.get_reservations() or {}
            if isinstance(raw_all, dict):
                all_res_list = list(raw_all.values())
            elif isinstance(raw_all, list):
                all_res_list = raw_all
        except Exception as e:
            print(f"[!] Warning fetching reservations in orders: {e}")
            all_res_list = []

    # Sort reservations by date descending
    all_res_list.sort(key=lambda x: (x.get("date", ""), x.get("id", "")), reverse=True)

    # Filter for target date
    today_matching = [
        r for r in all_res_list 
        if r.get("date") == target_date and str(r.get("status", "")).lower() != "cancelled"
    ]
    total_pax = sum(int(r.get("pax", 2)) for r in today_matching)

    return {
        "status": "success",
        "date": target_date,
        "reservations_booked": len(today_matching),
        "total_pax": total_pax,
        "status_text": f"{len(today_matching)} Bookings ({total_pax} Guests)" if today_matching else "0 Table Reservations (0 Guests)",
        "today_reservations": today_matching,
        "reservations": all_res_list if all_res_list else today_matching,
        "all_reservations": all_res_list,
        "all_reservations_count": len(all_res_list)
    }

@router.post("/reservations")
def create_order_reservation(payload: OrderReservationPayload):
    """
    Create a new customer table reservation in Firebase Realtime Database (/reservations).
    Persists to cloud and automatically impacts AI food demand prediction.
    """
    res_date = payload.date or datetime.now().strftime("%Y-%m-%d")
    res_id = f"res-{int(datetime.now().timestamp())}"
    res_data = {
        "id": res_id,
        "customer_name": payload.customer_name.strip(),
        "pax": max(1, payload.pax),
        "date": res_date,
        "shift": payload.shift or "Dinner",
        "table_number": payload.table_number or "Table 01",
        "phone": payload.phone or "",
        "notes": payload.notes or "",
        "status": payload.status or "Confirmed",
        "created_at": datetime.now().isoformat()
    }

    saved = False
    if firebase_service and firebase_service.is_connected:
        try:
            saved = firebase_service.save_reservation(res_id, res_data)
        except Exception as e:
            print(f"[!] Error saving reservation in orders router: {e}")
            saved = False

    return {
        "status": "success",
        "message": f"Reservation for {payload.customer_name} ({payload.pax} pax) on {res_date} registered successfully.",
        "reservation_id": res_id,
        "firebase_synced": saved,
        "data": res_data,
        "reservation": res_data
    }

@router.patch("/reservations/{res_id}/status")
def update_order_reservation_status(res_id: str, payload: Optional[UpdateReservationStatusPayload] = None, status: Optional[str] = None):
    """Update status of a reservation (Confirmed, Seated, Completed, Cancelled)."""
    new_status = (payload.status if payload else None) or status or "Confirmed"
    if firebase_service and firebase_service.is_connected:
        try:
            all_res = firebase_service.get_reservations() or {}
            target = all_res.get(res_id)
            if target and isinstance(target, dict):
                target["status"] = new_status
                firebase_service.save_reservation(res_id, target)
                return {"status": "success", "message": f"Reservation {res_id} marked as {new_status}", "data": target}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {"status": "success", "message": f"Reservation {res_id} status updated to {new_status}"}

@router.delete("/reservations/{res_id}")
def delete_order_reservation(res_id: str):
    """Delete a customer reservation from Firebase Realtime Database."""
    deleted = False
    if firebase_service and firebase_service.is_connected:
        try:
            deleted = firebase_service.delete_reservation(res_id)
        except Exception as e:
            print(f"[!] Error deleting reservation in orders: {e}")
    return {"status": "success", "deleted": deleted, "message": f"Reservation {res_id} removed"}

