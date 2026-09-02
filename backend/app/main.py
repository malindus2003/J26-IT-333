from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import sensors, vision, predictions, inventory, recommendations, demand, kitchen, waste, orders
from .data.mock_data import STORAGE_ZONES
from .routers.inventory import inventory_db
from .routers.orders import orders_db

app = FastAPI(
    title="AI & IoT Smart Restaurant Management & Waste Reduction System",
    description="Integrated 4-Component System for Food Demand Prediction, Smart Waste Sorting, Multi-Modal Spoilage Detection, Kitchen Efficiency, and Order & Inventory Management.",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Research Project Modules & Operational Routing
app.include_router(orders.router)           # Order Management & Live POS
app.include_router(inventory.router)        # Connected Inventory & Smart FIFO
app.include_router(demand.router)           # Component 1 (Nanayakkara K.A.J.Y)
app.include_router(kitchen.router)          # Component 2 (Pahesara H.H.D.S)
app.include_router(sensors.router)          # Component 3 (Maddumage M. S - IoT)
app.include_router(vision.router)           # Component 3 (Maddumage M. S - CV)
app.include_router(predictions.router)      # Component 3 (Maddumage M. S - AI Fusion)
app.include_router(recommendations.router)  # Component 3 (Maddumage M. S - Decisions)
app.include_router(waste.router)            # Component 4 (Pathirana P.R.T)

@app.get("/")
def root():
    return {
        "project": "AI & IoT-Based Smart Restaurant Management System for Food Waste Prediction and Operational Optimization",
        "research_cluster": "SST - Software Systems & Technologies (SLIIT 2026)",
        "project_id": "J26-IT-333",
        "components": [
            {"id": "Component 1", "title": "AI Food Demand Prediction", "researcher": "Nanayakkara K.A.J.Y (IT23314542)"},
            {"id": "Component 2", "title": "Kitchen Efficiency & Staff Optimization", "researcher": "Pahesara H.H.D.S (IT23349292)"},
            {"id": "Component 3", "title": "Multi-Modal Food Spoilage Prediction", "researcher": "Maddumage M. S (IT23348820)"},
            {"id": "Component 4", "title": "Smart Waste Bin Identification & Monitoring", "researcher": "Pathirana P.R.T (IT23324060)"},
            {"id": "Operations", "title": "Integrated Order & Inventory Management", "type": "Cross-Component Core"}
        ],
        "status": "All Systems Online",
        "docs_url": "/docs"
    }

@app.get("/api/dashboard/stats")
def get_dashboard_summary():
    """Aggregated cross-component KPIs for Executive Overview."""
    total_batches = len(inventory_db)
    critical_items = sum(1 for i in inventory_db if i["risk_level"] == "Critical")
    high_risk_items = sum(1 for i in inventory_db if i["risk_level"] == "High")
    safe_items = sum(1 for i in inventory_db if i["risk_level"] in ["Low", "Medium"])
    avg_spoilage_prob = round(sum(i["spoilage_prob"] for i in inventory_db) / max(1, total_batches), 1)

    # Active Orders metrics
    active_orders_count = sum(1 for o in orders_db if o["status"] in ["pending", "in_prep"])
    total_orders_today = len(orders_db) + 412
    total_revenue_lkr = sum(o["total_amount_lkr"] for o in orders_db) + 482000.0

    return {
        "total_monitored_batches": total_batches,
        "critical_batches": critical_items,
        "high_priority_batches": high_risk_items,
        "safe_batches": safe_items,
        "avg_spoilage_probability": avg_spoilage_prob,
        "total_storage_zones": len(STORAGE_ZONES),
        "zones_needing_attention": sum(1 for z in STORAGE_ZONES if z["status"] == "warning"),
        "today_predicted_orders": 480,
        "today_actual_orders": total_orders_today,
        "active_kitchen_tickets": active_orders_count,
        "kitchen_efficiency_pct": 88.5,
        "daily_food_waste_kg": 28.5,
        "cost_loss_today_lkr": "10,900.00",
        "total_revenue_lkr": total_revenue_lkr,
        "system_health": "Optimal Operational Flow"
    }
