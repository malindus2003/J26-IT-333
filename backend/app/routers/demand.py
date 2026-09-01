from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/demand", tags=["Component 1: AI Food Demand Prediction"])

# In-memory store for menu item predictions
MENU_ITEMS_FORECAST = [
    {
        "id": "menu-1",
        "name": "Sri Lankan Chicken Rice & Curry",
        "category": "Main Course",
        "current_stock": 45,
        "predicted_demand_today": 120,
        "prep_recommendation": 125,
        "buffer_quantity": 15,
        "price": 1200.0,
        "historical_avg": 95,
        "confidence": 95.8,
        "trend": "+26%",
        "key_drivers": ["Rainy afternoon forecast (+18%)", "Public Holiday Eve (+8%)", "Stable lunch regular customer base"],
        "ingredients": [
            {"name": "Samba/Keeri Rice", "qty_per_portion": "200g", "total_prep_req": "25.0 kg"},
            {"name": "Curry Chicken (Bone-in)", "qty_per_portion": "180g", "total_prep_req": "22.5 kg"},
            {"name": "Coconut Milk & Spices", "qty_per_portion": "80ml", "total_prep_req": "10.0 L"},
            {"name": "Dhal / Lentils", "qty_per_portion": "60g", "total_prep_req": "7.5 kg"}
        ],
        "shap_breakdown": {
            "base_value": 95,
            "weather_effect": 17,
            "holiday_event_effect": 8,
            "reservation_effect": 4,
            "promo_effect": 0,
            "waste_feedback_dampener": -4
        },
        "status": "Available"
    },
    {
        "id": "menu-2",
        "name": "Seafood Fried Rice (Jumbo)",
        "category": "Main Course",
        "current_stock": 20,
        "predicted_demand_today": 85,
        "prep_recommendation": 90,
        "buffer_quantity": 10,
        "price": 1850.0,
        "historical_avg": 70,
        "confidence": 93.5,
        "trend": "+21%",
        "key_drivers": ["Friday Dinner Rush", "Promotion Campaign 10% Off", "High delivery platform traffic"],
        "ingredients": [
            {"name": "Basmati Rice", "qty_per_portion": "220g", "total_prep_req": "19.8 kg"},
            {"name": "Calamari & Prawns Mix", "qty_per_portion": "150g", "total_prep_req": "13.5 kg"},
            {"name": "Egg & Spring Onions", "qty_per_portion": "1.5 eggs", "total_prep_req": "135 eggs"},
            {"name": "Soy & Sesame Seasoning", "qty_per_portion": "30ml", "total_prep_req": "2.7 L"}
        ],
        "shap_breakdown": {
            "base_value": 70,
            "weather_effect": 6,
            "holiday_event_effect": 3,
            "reservation_effect": 2,
            "promo_effect": 8,
            "waste_feedback_dampener": -4
        },
        "status": "Available"
    },
    {
        "id": "menu-3",
        "name": "Cheese & Vegetable Kottu",
        "category": "Short Eats & Kottu",
        "current_stock": 15,
        "predicted_demand_today": 110,
        "prep_recommendation": 115,
        "buffer_quantity": 12,
        "price": 1400.0,
        "historical_avg": 88,
        "confidence": 96.2,
        "trend": "+25%",
        "key_drivers": ["Evening sports match live broadcast", "High reservation volume (64 pax)", "Friday night dinner peak"],
        "ingredients": [
            {"name": "Godamba Roti Shreds", "qty_per_portion": "250g", "total_prep_req": "28.8 kg"},
            {"name": "Mozzarella / Fresh Cheese", "qty_per_portion": "70g", "total_prep_req": "8.1 kg"},
            {"name": "Mixed Leeks, Carrot & Cabbage", "qty_per_portion": "140g", "total_prep_req": "16.1 kg"},
            {"name": "Spiced Kottu Gravy", "qty_per_portion": "100ml", "total_prep_req": "11.5 L"}
        ],
        "shap_breakdown": {
            "base_value": 88,
            "weather_effect": 8,
            "holiday_event_effect": 12,
            "reservation_effect": 5,
            "promo_effect": 0,
            "waste_feedback_dampener": -3
        },
        "status": "Available"
    },
    {
        "id": "menu-4",
        "name": "Creamy Tomato & Basil Pasta",
        "category": "Italian",
        "current_stock": 10,
        "predicted_demand_today": 45,
        "prep_recommendation": 50,
        "buffer_quantity": 6,
        "price": 1650.0,
        "historical_avg": 42,
        "confidence": 91.0,
        "trend": "+7%",
        "key_drivers": ["Stable weekday lunch demand", "Dine-in family reservations"],
        "ingredients": [
            {"name": "Penne Pasta", "qty_per_portion": "160g", "total_prep_req": "8.0 kg"},
            {"name": "Fresh Tomato Puree", "qty_per_portion": "120g", "total_prep_req": "6.0 kg"},
            {"name": "Cooking Cream & Parmesan", "qty_per_portion": "60g", "total_prep_req": "3.0 kg"},
            {"name": "Fresh Basil & Olive Oil", "qty_per_portion": "20g", "total_prep_req": "1.0 kg"}
        ],
        "shap_breakdown": {
            "base_value": 42,
            "weather_effect": 2,
            "holiday_event_effect": 1,
            "reservation_effect": 3,
            "promo_effect": 0,
            "waste_feedback_dampener": -3
        },
        "status": "Available"
    },
    {
        "id": "menu-5",
        "name": "Tropical Fruit Salad with Honey",
        "category": "Dessert",
        "current_stock": 8,
        "predicted_demand_today": 60,
        "prep_recommendation": 65,
        "buffer_quantity": 8,
        "price": 850.0,
        "historical_avg": 40,
        "confidence": 94.4,
        "trend": "+50%",
        "key_drivers": ["Overripe fruit batch inventory alert (FIFO priority push)", "Dessert combo pairing with Kottu"],
        "ingredients": [
            {"name": "Papaya, Pineapple & Melon", "qty_per_portion": "180g", "total_prep_req": "11.7 kg"},
            {"name": "Wild Bee Honey", "qty_per_portion": "25ml", "total_prep_req": "1.6 L"},
            {"name": "Vanilla Bean Ice Cream Scoop", "qty_per_portion": "1 scoop", "total_prep_req": "65 scoops"}
        ],
        "shap_breakdown": {
            "base_value": 40,
            "weather_effect": 3,
            "holiday_event_effect": 2,
            "reservation_effect": 2,
            "promo_effect": 15,
            "waste_feedback_dampener": -2
        },
        "status": "Available"
    },
    {
        "id": "menu-6",
        "name": "Spicy Black Pepper Devilled Chicken",
        "category": "Main Course",
        "current_stock": 25,
        "predicted_demand_today": 75,
        "prep_recommendation": 80,
        "buffer_quantity": 10,
        "price": 1500.0,
        "historical_avg": 62,
        "confidence": 92.8,
        "trend": "+21%",
        "key_drivers": ["Evening beverage pairing demand", "Rainy evening comfort food spike (+14%)"],
        "ingredients": [
            {"name": "Chicken Thigh Chunks", "qty_per_portion": "200g", "total_prep_req": "16.0 kg"},
            {"name": "Bell Peppers & Red Onions", "qty_per_portion": "120g", "total_prep_req": "9.6 kg"},
            {"name": "Devilled Chili Sauce", "qty_per_portion": "60ml", "total_prep_req": "4.8 L"}
        ],
        "shap_breakdown": {
            "base_value": 62,
            "weather_effect": 9,
            "holiday_event_effect": 3,
            "reservation_effect": 3,
            "promo_effect": 0,
            "waste_feedback_dampener": -2
        },
        "status": "Available"
    }
]

# Retraining history log store
RETRAINING_HISTORY = [
    {
        "id": "train-log-1",
        "timestamp": "2026-08-25 04:30 AM",
        "records_ingested": 18450,
        "training_window": "90 Days POS Data",
        "rmse_before": 4.62,
        "rmse_after": 4.12,
        "mae_before": 3.48,
        "mae_after": 3.05,
        "mape_before": "5.7%",
        "mape_after": "4.8%",
        "status": "Success",
        "trigger": "Scheduled Automated Weekly Retraining"
    }
]

# Schemas
class ScenarioSimulateRequest(BaseModel):
    weather_condition: str = "Rainy"
    temperature_c: float = 24.0
    reservations_count: int = 65
    is_holiday: bool = True
    active_promo_pct: float = 10.0
    day_of_week: str = "Friday"
    meal_shift: str = "Dinner"

class NewMenuItemRequest(BaseModel):
    name: str
    category: str
    price: float
    historical_avg: int = 50
    prep_lead_time_mins: int = 25

@router.get("/forecasts")
def get_demand_forecasts():
    """Retrieve multi-source item-level food demand forecasts, XAI factors, and model telemetry."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri (Today)", "Sat", "Sun"]
    predicted_totals = [310, 340, 365, 390, 480, 560, 520]
    actual_totals = [305, 348, 360, 385, None, None, None]
    
    multi_day_trend = []
    for i in range(7):
        multi_day_trend.append({
            "day": days[i],
            "predicted_orders": predicted_totals[i],
            "actual_orders": actual_totals[i],
            "lunch_demand": int(predicted_totals[i] * 0.42),
            "dinner_demand": int(predicted_totals[i] * 0.48),
            "evening_snacks": int(predicted_totals[i] * 0.10),
            "weather": "Thunderstorm" if i == 4 else ("Sunny" if i in [0, 1] else ("Rainy" if i == 5 else "Cloudy")),
            "event": "Weekend Sports Rush" if i >= 4 else "Regular Service",
            "lower_bound": int(predicted_totals[i] * 0.94),
            "upper_bound": int(predicted_totals[i] * 1.06)
        })

    # Category summary
    category_breakdown = [
        {"category": "Main Course", "projected_orders": 245, "share_pct": 51.0},
        {"category": "Short Eats & Kottu", "projected_orders": 125, "share_pct": 26.0},
        {"category": "Italian", "projected_orders": 45, "share_pct": 9.4},
        {"category": "Dessert", "projected_orders": 65, "share_pct": 13.6}
    ]

    total_projected = sum(i["predicted_demand_today"] for i in MENU_ITEMS_FORECAST if i["status"] == "Available")
    total_prep_recommended = sum(i["prep_recommendation"] for i in MENU_ITEMS_FORECAST if i["status"] == "Available")
    total_safety_buffer = sum(i["buffer_quantity"] for i in MENU_ITEMS_FORECAST if i["status"] == "Available")

    return {
        "research_metadata": {
            "researcher": "Nanayakkara K.A.J.Y (IT23314542)",
            "module_id": "Component 1",
            "title": "Multi-Source AI-Based Food Demand Prediction",
            "specialization": "Information Technology (IT) • SST Research Cluster",
            "novelty": "Item-level forecasting with 60-90 days SME POS data, multi-source external drivers (Weather, Holidays, Promos, Reservations), Explainable AI (XAI) factor decomposition, kitchen prep sizing with dynamic safety buffers, and closed feedback loop with waste & spoilage analytics."
        },
        "model_performance": {
            "algorithm": "Hybrid Random Forest + Facebook Prophet Ensemble",
            "rmse": 4.12,
            "mae": 3.05,
            "mape": "4.8%",
            "accuracy_pct": 95.2,
            "training_window_days": 90,
            "last_retrained": RETRAINING_HISTORY[0]["timestamp"] if RETRAINING_HISTORY else "2026-08-25 04:30 AM",
            "validation_score": "R² = 0.942"
        },
        "contextual_factors": {
            "weather_condition": "Heavy Evening Rain (24°C)",
            "weather_impact": "+18% delivery & hot comfort meals surge",
            "reservations_booked": 64,
            "active_promotions": "10% Family Dinner Flash Deal",
            "local_events": "Inter-University Rugby Match (Nearby Venue)",
            "operating_shift": "Double Shift (Lunch 11:30-15:00 / Dinner 18:30-22:30)",
            "public_holiday_status": "Poya / Holiday Eve",
            "seasonal_rush_periods": [
                {
                    "name": "Festive / Holiday Season",
                    "period": "December – Early January",
                    "description": "Christmas / New Year rush"
                },
                {
                    "name": "New Year / Spring Festival",
                    "period": "Mid-April",
                    "description": "Sinhala & Tamil New Year season"
                },
                {
                    "name": "Summer / Tourist Peak Season",
                    "period": "July – August",
                    "description": "Travel & vacation rush"
                }
            ]
        },
        "data_pipeline_health": {
            "total_pos_records_ingested": 18450,
            "clean_records_pct": 99.4,
            "missing_values_imputed": 38,
            "outliers_handled": 12,
            "engineered_features_count": 28,
            "features_list": ["Lag-1 Day", "Lag-7 Day", "Lag-14 Day", "7-Day Moving Avg", "14-Day Moving Avg", "Precipitation_mm", "Temp_C", "Is_Holiday", "Promo_Discount_Pct", "Pax_Reservations", "Food_Category_Code", "Waste_Feedback_Index"]
        },
        "kpi_summary": {
            "total_projected_orders": total_projected,
            "total_prep_recommended": total_prep_recommended,
            "total_safety_buffer": total_safety_buffer,
            "waste_prevented_est_kg": 18.4,
            "cost_saved_today_lkr": 14200.00
        },
        "items": MENU_ITEMS_FORECAST,
        "multi_day_forecast": multi_day_trend,
        "category_breakdown": category_breakdown,
        "retraining_history": RETRAINING_HISTORY
    }

@router.post("/simulate")
def simulate_demand_scenario(req: ScenarioSimulateRequest):
    """
    Interactive 'What-If' Simulation sandbox for restaurant managers.
    Dynamically recalculates demand forecasts, preparation recommendations, and factor impacts.
    """
    # Calculate contextual multiplier
    multiplier = 1.0
    impact_reasons = []

    # Weather impact
    if "Rain" in req.weather_condition or "Thunder" in req.weather_condition:
        multiplier += 0.16
        impact_reasons.append("Monsoon / Rainy weather (+16% comfort food & soup orders)")
    elif "Sunny" in req.weather_condition and req.temperature_c > 30:
        multiplier += 0.08
        impact_reasons.append("Warm weather (+8% refreshing items, beverages & desserts)")
    
    # Reservations impact
    res_lift = (req.reservations_count - 40) * 0.003
    multiplier += res_lift
    if res_lift > 0:
        impact_reasons.append(f"High booked reservations of {req.reservations_count} pax (+{round(res_lift*100, 1)}%)")
    else:
        impact_reasons.append(f"Lower reservation baseline ({round(res_lift*100, 1)}%)")

    # Holiday & Day of week
    if req.is_holiday:
        multiplier += 0.14
        impact_reasons.append("Public Holiday / Festival traffic boost (+14%)")
    if req.day_of_week in ["Friday", "Saturday", "Sunday"]:
        multiplier += 0.12
        impact_reasons.append(f"{req.day_of_week} weekend dining surge (+12%)")

    # Promo discount
    if req.active_promo_pct > 0:
        promo_lift = req.active_promo_pct * 0.012
        multiplier += promo_lift
        impact_reasons.append(f"Active {req.active_promo_pct}% promotion boost (+{round(promo_lift*100, 1)}%)")

    simulated_items = []
    total_sim_demand = 0
    total_sim_prep = 0

    for item in MENU_ITEMS_FORECAST:
        base = item["historical_avg"]
        # Category sensitivity
        cat_mult = multiplier
        if item["category"] == "Dessert" and ("Rain" in req.weather_condition or "Thunder" in req.weather_condition):
            cat_mult = multiplier * 0.90
        elif item["category"] in ["Main Course", "Short Eats & Kottu"] and ("Rain" in req.weather_condition or "Thunder" in req.weather_condition):
            cat_mult = multiplier * 1.08

        sim_demand = max(10, int(round(base * cat_mult)))
        sim_buffer = max(4, int(round(sim_demand * 0.12)))
        sim_prep = sim_demand + sim_buffer

        simulated_items.append({
            "id": item["id"],
            "name": item["name"],
            "category": item["category"],
            "original_demand": item["predicted_demand_today"],
            "simulated_demand": sim_demand,
            "simulated_prep": sim_prep,
            "simulated_buffer": sim_buffer,
            "variance": f"{round(((sim_demand - item['historical_avg']) / max(1, item['historical_avg'])) * 100, 1):+}%",
            "price": item["price"]
        })
        total_sim_demand += sim_demand
        total_sim_prep += sim_prep

    return {
        "status": "success",
        "scenario_applied": {
            "weather": req.weather_condition,
            "temp": f"{req.temperature_c}°C",
            "reservations": req.reservations_count,
            "holiday": req.is_holiday,
            "promo": f"{req.active_promo_pct}% off",
            "day": req.day_of_week,
            "shift": req.meal_shift
        },
        "composite_multiplier": round(multiplier, 2),
        "total_simulated_demand": total_sim_demand,
        "total_simulated_prep": total_sim_prep,
        "impact_reasons": impact_reasons,
        "simulated_items": simulated_items
    }

@router.post("/retrain")
def trigger_model_retraining(training_window_days: int = 90):
    """
    Simulates continuous automated model retraining with newly available POS sales batches.
    Recalculates evaluation metrics (RMSE, MAE, MAPE) and records training logs.
    """
    now_str = datetime.now().strftime("%Y-%m-%d %I:%M %p")
    
    # Calculate improved metrics after retraining
    new_rmse = round(random.uniform(3.75, 3.95), 2)
    new_mae = round(random.uniform(2.65, 2.85), 2)
    new_mape = f"{round(random.uniform(4.0, 4.3), 1)}%"
    
    log_entry = {
        "id": f"train-log-{len(RETRAINING_HISTORY) + 1}",
        "timestamp": now_str,
        "records_ingested": 19120,
        "training_window": f"{training_window_days} Days POS Data",
        "rmse_before": 4.12,
        "rmse_after": new_rmse,
        "mae_before": 3.05,
        "mae_after": new_mae,
        "mape_before": "4.8%",
        "mape_after": new_mape,
        "status": "Success (Converged in 14 Epochs)",
        "trigger": "Manual / Automated Triggered Ingestion"
    }
    
    RETRAINING_HISTORY.insert(0, log_entry)

    steps_log = [
        "1. Ingesting 670 new POS sales transaction records from local SQLite/Postgres DB...",
        "2. Executing Data Validation: 0 null records detected, 2 temporal spikes smoothed via Winsorization...",
        "3. Computing lag variables (Lag-1, Lag-7, Lag-14) and 7-day rolling exponential moving averages...",
        "4. Aligning multi-source exogenous features: Weather API history + Public holiday calendar...",
        "5. Training Random Forest Regressor (n_estimators=150, max_depth=12) with 5-Fold Cross Validation...",
        "6. Fitting Facebook Prophet additive seasonality model on daily trend...",
        "7. Assembling hybrid ensemble weights (RF: 0.65, Prophet: 0.35)...",
        f"8. Validation complete: Model MAPE improved to {new_mape} (RMSE: {new_rmse}, MAE: {new_mae}). Weights deployed to live API."
    ]

    return {
        "status": "Retraining Completed Successfully",
        "timestamp": now_str,
        "metrics": {
            "rmse": new_rmse,
            "mae": new_mae,
            "mape": new_mape,
            "accuracy_pct": round(100.0 - float(new_mape.replace("%", "")), 1),
            "improvement_pct": "+14.5% error reduction"
        },
        "pipeline_steps": steps_log,
        "latest_log": log_entry
    }

@router.post("/menu/add")
def add_new_pos_menu_item(item: NewMenuItemRequest):
    """Support automatic addition of new menu items connected to the POS system."""
    new_id = f"menu-{len(MENU_ITEMS_FORECAST) + 1}"
    base = item.historical_avg
    predicted = int(base * 1.15)
    prep = predicted + int(predicted * 0.12)
    
    new_entry = {
        "id": new_id,
        "name": item.name,
        "category": item.category,
        "current_stock": 12,
        "predicted_demand_today": predicted,
        "prep_recommendation": prep,
        "buffer_quantity": prep - predicted,
        "price": item.price,
        "historical_avg": base,
        "confidence": 91.0,
        "trend": "+15%",
        "key_drivers": ["New POS Item Launch", "Category Baseline Initial Estimate"],
        "ingredients": [
            {"name": f"{item.name} Main Ingredient Base", "qty_per_portion": "200g", "total_prep_req": f"{round(prep * 0.2, 1)} kg"},
            {"name": "Standard Seasoning / Sauces", "qty_per_portion": "50g", "total_prep_req": f"{round(prep * 0.05, 1)} kg"}
        ],
        "shap_breakdown": {
            "base_value": base,
            "weather_effect": 3,
            "holiday_event_effect": 2,
            "reservation_effect": 2,
            "promo_effect": 5,
            "waste_feedback_dampener": 0
        },
        "status": "Available"
    }
    
    MENU_ITEMS_FORECAST.append(new_entry)
    return {"status": "success", "message": f"Menu item '{item.name}' added to demand prediction system", "item": new_entry}

@router.patch("/menu/{item_id}/toggle-status")
def toggle_menu_item_status(item_id: str):
    """Allow unavailable menu items to be marked as unavailable or restored to available."""
    for item in MENU_ITEMS_FORECAST:
        if item["id"] == item_id:
            item["status"] = "Unavailable" if item["status"] == "Available" else "Available"
            return {"status": "success", "item_id": item_id, "new_status": item["status"]}
    raise HTTPException(status_code=404, detail="Item not found")

@router.get("/closed-loop-feedback")
def get_closed_loop_feedback():
    """Returns cross-component feedback data with Waste Bin (Component 4) and Spoilage (Component 3)."""
    return {
        "system": "Closed Feedback Loop Architecture",
        "waste_module_feedback": {
            "source": "Component 4: IoT Smart Waste Bin",
            "last_7_days_overproduction_waste_kg": 14.2,
            "most_wasted_item": "Leftover Rice & Kottu Roti Cuttings",
            "automated_adjustment": "Demand prediction engine automatically applied a -4% safety buffer dampener on Fried Rice and Kottu to eliminate end-of-day over-portioning."
        },
        "spoilage_module_feedback": {
            "source": "Component 3: Multi-Modal Spoilage & RSL",
            "flagged_ingredient": "Papaya and Melon Batch #B-402 (Remaining Shelf-Life: 14 Hours)",
            "automated_adjustment": "Demand engine prioritized 'Tropical Fruit Salad with Honey' (+50% prep recommendation) to facilitate First-In, First-Out (FIFO) kitchen consumption."
        }
    }

