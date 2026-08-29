from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/demand", tags=["Component 1: AI Food Demand Prediction"])

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
        "status": "Available"
    }
]

@router.get("/summary")
def get_demand_summary():
    """Returns today's aggregate meal demand prediction overview."""
    total_pred = sum(item["predicted_demand_today"] for item in MENU_ITEMS_FORECAST)
    total_prep = sum(item["prep_recommendation"] for item in MENU_ITEMS_FORECAST)
    return {
        "today_total_predicted_meals": total_pred,
        "today_recommended_prep_portions": total_prep,
        "avg_forecast_confidence": 94.6,
        "items_tracked": len(MENU_ITEMS_FORECAST)
    }

WEATHER_FORECAST = {
    "condition": "Rainy / Overcast",
    "temperature_c": 26.5,
    "rain_probability_pct": 85,
    "impact_coefficient": 1.18
}

EVENT_CALENDAR = [
    {"event": "Friday Corporate Payday Dinner", "date": "Today", "impact": "+15% Dine-In Rush"}
]

@router.get("/drivers")
def get_demand_external_drivers():
    """Retrieve environmental, weather, and event external demand drivers."""
    return {"weather": WEATHER_FORECAST, "events": EVENT_CALENDAR}

SEVEN_DAY_FORECAST = [
    {"day": "Mon", "date": "2026-08-31", "predicted_orders": 390, "breakfast": 90, "lunch": 180, "dinner": 120},
    {"day": "Tue", "date": "2026-09-01", "predicted_orders": 415, "breakfast": 95, "lunch": 190, "dinner": 130}
]

@router.get("/7day-trend")
def get_7day_demand_trend():
    """Retrieve 7-day multi-shift meal demand forecasts from Prophet & Random Forest."""
    return {"forecast": SEVEN_DAY_FORECAST}

@router.get("/features/shap")
def get_explainable_ai_weights(item_id: Optional[str] = "menu-1"):
    """Returns SHAP-inspired feature attribution breakdown for Explainable AI."""
    return {
        "base_expected_portions": 95,
        "feature_attributions": [
            {"factor": "Rainy Weather Impact (+85% Rain Probability)", "delta": "+17 portions", "impact": "positive"},
            {"factor": "Public Holiday / Long Weekend Surge", "delta": "+8 portions", "impact": "positive"}
        ]
    }
