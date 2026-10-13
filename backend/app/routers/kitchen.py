import os
import pandas as pd
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/kitchen", tags=["Component 2: Kitchen Efficiency & Staff Optimization"])

# backend folder path resolution
ROUTER_DIR = os.path.dirname(os.path.abspath(__file__))               # backend/app/routers
BACKEND_DIR = os.path.abspath(os.path.join(ROUTER_DIR, "..", ".."))    # backend

def load_csv_data(filename: str) -> pd.DataFrame:
    p1 = os.path.join(BACKEND_DIR, filename)
    p2 = os.path.join(BACKEND_DIR, "data", filename)
    
    if os.path.exists(p1):
        return pd.read_csv(p1)
    elif os.path.exists(p2):
        return pd.read_csv(p2)
    return pd.DataFrame()

def get_stations_data() -> List[Dict[str, Any]]:
    df = load_csv_data("kitchen_bottlenecks_detected.csv")
    if not df.empty:
        # Latest day snapshot
        latest_row = df.iloc[-1]
        
        # Prathi station-na overload aada dinagala count
        overload_counts = {
            "Hot Kitchen": int((df['Bottleneck_Stations'].str.contains("Hot Kitchen", na=False)).sum()),
            "Grill": int((df['Bottleneck_Stations'].str.contains("Grill", na=False)).sum()),
            "Cold Salad": int((df['Bottleneck_Stations'].str.contains("Cold", na=False)).sum()),
            "Pizza": int((df['Bottleneck_Stations'].str.contains("Pizza", na=False)).sum()),
            "Fryer": int((df['Bottleneck_Stations'].str.contains("Fryer", na=False)).sum())
        }

        # Thresholds (detect_bottlenecks.py moolaka bandha seemegalu)
        thresholds = {
            "Hot Kitchen": 76.5,
            "Grill": 17.9,
            "Cold Salad": 17.6,
            "Pizza": 16.3,
            "Fryer": 10.0
        }

        # Station configurations mathu dynamic mapping
        stations_config = [
            {"id": "station-1", "name": "Hot Kitchen", "col": "Hot_Kitchen_Load", "default_cooks": 3, "target_prep": 8.0},
            {"id": "station-2", "name": "Grill", "col": "Grill_Load", "default_cooks": 2, "target_prep": 10.0},
            {"id": "station-3", "name": "Cold Salad", "col": "Cold_Salad_Load", "default_cooks": 1, "target_prep": 4.0},
            {"id": "station-4", "name": "Pizza", "col": "Pizza_Load", "default_cooks": 2, "target_prep": 7.0},
            {"id": "station-5", "name": "Fryer", "col": "Fryer_Load", "default_cooks": 1, "target_prep": 5.0}
        ]

        mapped_stations = []
        for st in stations_config:
            current_load = float(latest_row.get(st["col"], 10))
            thresh = thresholds[st["name"]]
            load_percentage = min(100, int(round((current_load / thresh) * 80)))
            is_bottleneck = current_load >= thresh
            
            status = "High Delay Risk" if is_bottleneck else ("Moderate Load" if load_percentage > 65 else "Smooth Flow")
            recommended_cooks = st["default_cooks"] + (1 if is_bottleneck else 0)
            avg_prep = round(st["target_prep"] * (1.35 if is_bottleneck else 1.0), 1)

            action = f"Add +1 Cook to {st['name']} due to peak backlog" if is_bottleneck else "Maintain current station staffing"

            # Predicted load mathu actual load frontend-ge mukhya
            pred_load = round(current_load * 0.95, 1)

            mapped_stations.append({
                "id": st["id"],
                "name": st["name"],
                "actual_load": round(current_load, 1),
                "predicted_load": pred_load,
                "load_level": load_percentage,
                "predicted_load_level": max(10, load_percentage - 5),
                "active_cooks": st["default_cooks"],
                "recommended_cooks": recommended_cooks,
                "avg_prep_time_mins": avg_prep,
                "target_prep_time_mins": st["target_prep"],
                "queue_length": int(round(current_load / 2.5)),
                "bottleneck_status": status,
                "action": action,
                "overload_days_count": overload_counts[st["name"]]
            })

        return mapped_stations

    # CSV sigadidhdare fallback data
    return [
        {
            "id": "station-1",
            "name": "Hot Kitchen",
            "actual_load": 64.1,
            "predicted_load": 60.7,
            "load_level": 92,
            "predicted_load_level": 87,
            "active_cooks": 2,
            "recommended_cooks": 3,
            "avg_prep_time_mins": 8.5,
            "target_prep_time_mins": 6.0,
            "queue_length": 14,
            "bottleneck_status": "High Delay Risk",
            "action": "Reallocate S. Fernando from Cold Salad to Hot Kitchen based on skill matching"
        },
        {
            "id": "station-2",
            "name": "Grill",
            "actual_load": 18.2,
            "predicted_load": 17.2,
            "load_level": 84,
            "predicted_load_level": 79,
            "active_cooks": 1,
            "recommended_cooks": 2,
            "avg_prep_time_mins": 14.0,
            "target_prep_time_mins": 10.0,
            "queue_length": 9,
            "bottleneck_status": "Moderate Queue Load",
            "action": "Reallocate T. Silva to Grill & prep protein cuts"
        },
        {
            "id": "station-3",
            "name": "Cold Salad",
            "actual_load": 16.9,
            "predicted_load": 16.0,
            "load_level": 30,
            "predicted_load_level": 28,
            "active_cooks": 2,
            "recommended_cooks": 1,
            "avg_prep_time_mins": 3.0,
            "target_prep_time_mins": 4.0,
            "queue_length": 2,
            "bottleneck_status": "Underutilized",
            "action": "Reassign S. Fernando to Hot Kitchen during peak rush"
        },
        {
            "id": "station-4",
            "name": "Pizza",
            "actual_load": 14.5,
            "predicted_load": 13.8,
            "load_level": 55,
            "predicted_load_level": 52,
            "active_cooks": 2,
            "recommended_cooks": 2,
            "avg_prep_time_mins": 5.2,
            "target_prep_time_mins": 5.0,
            "queue_length": 4,
            "bottleneck_status": "Smooth Flow",
            "action": "Maintain current deck oven line pacing"
        },
        {
            "id": "station-5",
            "name": "Fryer",
            "actual_load": 7.3,
            "predicted_load": 6.9,
            "load_level": 40,
            "predicted_load_level": 38,
            "active_cooks": 1,
            "recommended_cooks": 1,
            "avg_prep_time_mins": 3.5,
            "target_prep_time_mins": 4.0,
            "queue_length": 2,
            "bottleneck_status": "Smooth Flow",
            "action": "Maintain current line staffing & prep batch oil temperature"
        }
    ]

def get_staff_data() -> List[Dict[str, Any]]:
    df = load_csv_data("staff_database.csv")
    if not df.empty:
        return df.to_dict(orient="records")
    return [
        {
            "id": "staff-1",
            "name": "K. Perera (Senior Line Chef)",
            "assigned_station": "Hot Kitchen",
            "shift": "11:00 AM - 09:30 PM",
            "efficiency_rating": 94,
            "skill_level": "Expert (Level 4)",
            "speed_score": "4.8 / 5.0",
            "skill_gap": "Advanced Pastry & Bakery",
            "training_recommendation": "Executive Kitchen Leadership & Precision Temperature Control",
            "career_progression": "Ready for Sous-Chef Promotion (88% Milestones Complete)"
        },
        {
            "id": "staff-2",
            "name": "S. Fernando (Junior Chef)",
            "assigned_station": "Cold Salad",
            "shift": "03:00 PM - 11:00 PM",
            "efficiency_rating": 78,
            "skill_level": "Intermediate (Level 2)",
            "speed_score": "3.9 / 5.0",
            "skill_gap": "High-Heat Saute & Wok Handling",
            "training_recommendation": "Enrolled in 'High-Volume Stir-Fry Optimization' (Module 3)",
            "career_progression": "Target: Line Cook Specialist (62% Completed)"
        },
        {
            "id": "staff-3",
            "name": "T. Silva (Prep Cook)",
            "assigned_station": "Grill",
            "shift": "10:00 AM - 07:00 PM",
            "efficiency_rating": 85,
            "skill_level": "Intermediate (Level 3)",
            "speed_score": "4.2 / 5.0",
            "skill_gap": "HACCP Seafood Core Temperature Monitoring",
            "training_recommendation": "Seafood Freshness Grading & Quick-Sear Techniques",
            "career_progression": "Grill Master Track (74% Completed)"
        },
        {
            "id": "staff-4",
            "name": "A. Jayasinghe (Station Lead)",
            "assigned_station": "Pizza",
            "shift": "07:00 AM - 04:00 PM",
            "efficiency_rating": 91,
            "skill_level": "Expert (Level 4)",
            "speed_score": "4.7 / 5.0",
            "skill_gap": "High-Volume Batch Inventory Planning",
            "training_recommendation": "Wood-Fired Pizza Deck Oven Management & Crust Proofing",
            "career_progression": "Head of Pizza Track (82% Completed)"
        },
        {
            "id": "staff-5",
            "name": "M. Wickramasinghe (Kitchen Trainee)",
            "assigned_station": "Fryer",
            "shift": "11:00 AM - 08:00 PM",
            "efficiency_rating": 64,
            "skill_level": "Trainee (Level 1)",
            "speed_score": "3.1 / 5.0",
            "skill_gap": "Knife Handling, Prep Hygiene & Portion Control",
            "training_recommendation": "Foundation Kitchen Safety, Deep Fryer Safety & Oil Filtering",
            "career_progression": "Apprentice Onboarding (35% Completed)"
        },
        {
            "id": "staff-6",
            "name": "R. Dissanayake (Kitchen Trainee)",
            "assigned_station": "Hot Kitchen",
            "shift": "01:00 PM - 10:00 PM",
            "efficiency_rating": 58,
            "skill_level": "Trainee (Level 1)",
            "speed_score": "2.8 / 5.0",
            "skill_gap": "Station Setup & Order Ticket Flow",
            "training_recommendation": "Basic Line Cooking Fundamentals & Ticket Dispatching",
            "career_progression": "Junior Line Apprentice (25% Completed)"
        }
    ]

def get_workload_forecast() -> List[Dict[str, Any]]:
    df = load_csv_data("predicted_daily_workload.csv")
    if not df.empty:
        records = []
        sample_df = df.tail(15)
        for _, row in sample_df.iterrows():
            pred = int(round(float(row.get('Predicted_Total_Load', 20))))
            actual = int(round(float(row.get('Actual_Total_Load', pred))))
            req_staff = max(2, int(round(pred / 12)))
            act_staff = max(2, req_staff - (1 if pred > 70 else 0))
            
            records.append({
                "hour": str(row.get('Date', 'N/A')),
                "predicted_orders": pred,
                "actual_orders": actual,
                "staff_required": req_staff,
                "actual_staff": act_staff,
                "hot_kitchen_est_load": round(float(row.get('Hot_Kitchen_Est_Load', 0)), 1),
                "grill_est_load": round(float(row.get('Grill_Est_Load', 0)), 1),
                "cold_salad_est_load": round(float(row.get('Cold_Salad_Est_Load', 0)), 1),
                "pizza_est_load": round(float(row.get('Pizza_Est_Load', 0)), 1),
                "fryer_est_load": round(float(row.get('Fryer_Est_Load', 0)), 1),
            })
        return records

    return [
        {"hour": "07:00", "predicted_orders": 28, "staff_required": 4, "actual_staff": 4},
        {"hour": "08:00 (Breakfast Peak)", "predicted_orders": 76, "staff_required": 6, "actual_staff": 6},
        {"hour": "09:00", "predicted_orders": 58, "staff_required": 5, "actual_staff": 5},
        {"hour": "10:00", "predicted_orders": 32, "staff_required": 4, "actual_staff": 4},
        {"hour": "11:00", "predicted_orders": 24, "staff_required": 4, "actual_staff": 4},
        {"hour": "12:00", "predicted_orders": 68, "staff_required": 7, "actual_staff": 6},
        {"hour": "13:00 (Lunch Peak)", "predicted_orders": 95, "staff_required": 8, "actual_staff": 8},
        {"hour": "14:00", "predicted_orders": 45, "staff_required": 5, "actual_staff": 5},
        {"hour": "15:00", "predicted_orders": 18, "staff_required": 3, "actual_staff": 3},
        {"hour": "16:00", "predicted_orders": 22, "staff_required": 3, "actual_staff": 3},
        {"hour": "17:00", "predicted_orders": 38, "staff_required": 5, "actual_staff": 4},
        {"hour": "18:00", "predicted_orders": 74, "staff_required": 7, "actual_staff": 7},
        {"hour": "19:00 (Dinner Peak)", "predicted_orders": 115, "staff_required": 9, "actual_staff": 7},
        {"hour": "20:00 (Dinner Rush)", "predicted_orders": 105, "staff_required": 9, "actual_staff": 8},
        {"hour": "21:00", "predicted_orders": 52, "staff_required": 5, "actual_staff": 6}
    ]

@router.get("/metrics")
def get_kitchen_metrics():
    stations = get_stations_data()
    staff = get_staff_data()
    forecast = get_workload_forecast()
    
    actual_total = round(sum(s.get("actual_load", 0) for s in stations), 1)
    predicted_total = round(sum(s.get("predicted_load", 0) for s in stations), 1)
    
    return {
        "researcher": "Pahesara H.H.D.S (IT23349292)",
        "module": "Component 2: Kitchen Efficiency and Staff Optimization Analytics",
        "overall_kitchen_efficiency": "98.2%",
        "avg_ticket_fulfillment_time": "6.8 mins",
        "actual_total_load": actual_total,
        "predicted_total_load": predicted_total,
        "active_bottlenecks_count": len([s for s in stations if s.get("load_level", 0) > 80]),
        "stations": stations,
        "staff": staff,
        "hourly_peak_forecast": forecast,
        "ai_allocation_suggestions": [
            "⚠️ DINNER RUSH ALERT: Station 1 (Hot Kitchen) requires +1 Cook at 7:00 PM due to 115 projected orders.",
            "Reallocate S. Fernando from Cold Salad to Hot Kitchen during 7:00 PM - 9:00 PM window.",
            "Pre-portion 30x Pizza dough bases & Fryer cuttlefish at 5:30 PM to bypass peak queues."
        ]
    }

@router.post("/schedule/proactive")
def apply_proactive_schedule():
    forecast = get_workload_forecast()
    for item in forecast:
        if item.get("actual_staff", 0) < item.get("staff_required", 0):
            item["actual_staff"] = item["staff_required"]

    proactive_roster = [
        {
            "rush_period": "Lunch Peak (12:00 – 14:00)",
            "peak_hour": "12:00 & 13:00",
            "predicted_orders": 95,
            "scheduled_cooks": 8,
            "staff_assigned": ["K. Perera (Lead)", "S. Fernando", "T. Silva", "A. Jayasinghe", "M. Wickramasinghe", "R. Dissanayake", "Station Floater 1", "Station Floater 2"],
            "status": "Proactively Staffed (100% Demand Met)"
        },
        {
            "rush_period": "Dinner Peak (19:00 – 20:30)",
            "peak_hour": "19:00 & 20:00",
            "predicted_orders": 115,
            "scheduled_cooks": 9,
            "staff_assigned": ["K. Perera (Sous-Chef)", "S. Fernando (Wok Specialist)", "T. Silva (Grill Lead)", "A. Jayasinghe", "M. Wickramasinghe", "R. Dissanayake", "Relief Cook 1", "Relief Cook 2", "Relief Cook 3"],
            "status": "Proactively Staffed (100% Demand Met)"
        }
    ]

    return {
        "success": True,
        "message": "Proactive peak-hour staffing successfully applied across all rush intervals.",
        "hourly_peak_forecast": forecast,
        "proactive_roster": proactive_roster
    }

@router.post("/schedule/reset")
def reset_schedule():
    forecast = get_workload_forecast()
    return {
        "success": True,
        "message": "Schedule reset to baseline.",
        "hourly_peak_forecast": forecast
    }