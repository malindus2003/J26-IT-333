from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication & Access Control"])

# Pre-configured credentials as specified for PP1 evaluation
USERS_DATABASE = {
    "admin@gmail.com": {
        "email": "admin@gmail.com",
        "password": "admin@123",
        "role": "admin",
        "name": "System Administrator",
        "title": "Restaurant Operations Director & Admin",
        "default_module": "executive",
        "permissions": [
            "all",
            "executive_hub",
            "order_management",
            "inventory_valuation",
            "food_spoilage_ml",
            "kitchen_efficiency",
            "demand_prediction",
            "waste_monitoring",
            "iot_telemetry",
            "system_settings"
        ],
        "avatar_badge": "crown"
    },
    "kitchen@gmail.com": {
        "email": "kitchen@gmail.com",
        "password": "kitchen@123",
        "role": "staff",
        "name": "Kitchen Head Chef",
        "title": "Executive Sous Chef & KDS Lead",
        "default_module": "kds",
        "permissions": [
            "kds_tickets",
            "daily_prep_guide",
            "kitchen_stations",
            "perishable_inventory",
            "food_spoilage_quality",
            "smart_waste_bin"
        ],
        "avatar_badge": "chef"
    },
    "cashier@gmail.com": {
        "email": "cashier@gmail.com",
        "password": "cashier@123",
        "role": "cashier",
        "name": "Front Counter Cashier",
        "title": "Front-of-House POS Cashier",
        "default_module": "pos_menu",
        "permissions": [
            "pos_menu_ordering",
            "restaurant_table_map",
            "orders_sales_ledger"
        ],
        "avatar_badge": "card"
    }
}

class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfileResponse(BaseModel):
    email: str
    name: str
    title: str
    role: str
    default_module: str
    permissions: List[str]
    avatar_badge: str
    authenticated_at: datetime
    token: str

@router.post("/login", response_model=UserProfileResponse)
def login(credentials: LoginRequest):
    email_clean = credentials.email.strip().lower()
    user = USERS_DATABASE.get(email_clean)

    if not user or user["password"] != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    # Return authenticated user profile and mock session token
    return UserProfileResponse(
        email=user["email"],
        name=user["name"],
        title=user["title"],
        role=user["role"],
        default_module=user["default_module"],
        permissions=user["permissions"],
        avatar_badge=user["avatar_badge"],
        authenticated_at=datetime.utcnow(),
        token=f"auth-session-{user['role']}-{int(datetime.utcnow().timestamp())}"
    )

@router.get("/users")
def get_available_roles_info():
    """Returns the list of configured roles for display / demo purposes."""
    return [
        {
            "role": u["role"],
            "name": u["name"],
            "email": u["email"],
            "title": u["title"],
            "default_module": u["default_module"],
            "badge": u["avatar_badge"]
        }
        for u in USERS_DATABASE.values()
    ]
