import os
import smtplib
import json
import re
from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import getaddresses, parseaddr
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Literal
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator


load_dotenv()

router = APIRouter(prefix="/api/waste", tags=["Component 4: Three-Bin Waste Monitoring"])


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except ValueError:
        return default


FULL_BIN_THRESHOLD_PERCENT = min(
    100.0,
    max(1.0, _env_float("WASTE_FULL_BIN_THRESHOLD_PERCENT", 90.0)),
)
ALMOST_FULL_THRESHOLD_PERCENT = max(0.0, FULL_BIN_THRESHOLD_PERCENT - 15.0)
EMPTY_BIN_RESET_THRESHOLD_PERCENT = min(
    FULL_BIN_THRESHOLD_PERCENT,
    max(0.0, _env_float("WASTE_BIN_EMPTY_THRESHOLD_PERCENT", 10.0)),
)


def _bin_status(fill_level_percent: float) -> str:
    if fill_level_percent >= FULL_BIN_THRESHOLD_PERCENT:
        return "Full"
    if fill_level_percent >= ALMOST_FULL_THRESHOLD_PERCENT:
        return "Almost Full"
    return "Normal"


def _sensor_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


SMART_BIN_COMPARTMENTS: List[Dict[str, Any]] = [
    {
        "id": "food",
        "name": "Food Waste Bin",
        "waste_type": "Food",
        "fill_level_percent": 78.5,
        "current_weight_kg": 18.2,
        "capacity_kg": 25.0,
        "ultrasonic_distance_cm": 8.5,
        "status": _bin_status(78.5),
        "last_sensor_update": _sensor_timestamp(),
        "frequent_items": [
            "Leftover Cooked Rice (6.2 kg)",
            "Vegetable Peelings (4.8 kg)",
            "Chicken Bones (3.5 kg)",
            "Plate Scraps (3.7 kg)",
        ],
        "cost_loss_today": "LKR 7,450.00",
    },
    {
        "id": "plastic",
        "name": "Plastic Waste Bin",
        "waste_type": "Plastic",
        "fill_level_percent": 42.0,
        "current_weight_kg": 4.1,
        "capacity_kg": 12.0,
        "status": _bin_status(42.0),
        "last_sensor_update": _sensor_timestamp(),
    },
    {
        "id": "paper",
        "name": "Paper Waste Bin",
        "waste_type": "Paper",
        "fill_level_percent": 35.0,
        "current_weight_kg": 3.8,
        "capacity_kg": 15.0,
        "status": _bin_status(35.0),
        "last_sensor_update": _sensor_timestamp(),
    },
]

WASTE_COMPOSITION = [
    {"category": "Leftover Rice & Grains", "weight_kg": 7.4, "percentage": 34.5, "cost_rs": 2800, "color": "#f59e0b"},
    {"category": "Vegetable Cuttings & Trimmings", "weight_kg": 5.2, "percentage": 24.2, "cost_rs": 1850, "color": "#10b981"},
    {"category": "Meat & Seafood Bones/Trimmings", "weight_kg": 3.8, "percentage": 17.7, "cost_rs": 3200, "color": "#ef4444"},
    {"category": "Bakery & Bread Waste", "weight_kg": 2.6, "percentage": 12.1, "cost_rs": 950, "color": "#8b5cf6"},
    {"category": "Spoiled / Overripe Produce", "weight_kg": 2.5, "percentage": 11.5, "cost_rs": 1100, "color": "#ec4899"},
]

DAILY_WASTE_TREND = [
    {"day": "Mon", "total_food_waste_kg": 21.4, "cost_loss_rs": 8200},
    {"day": "Tue", "total_food_waste_kg": 19.8, "cost_loss_rs": 7600},
    {"day": "Wed", "total_food_waste_kg": 24.5, "cost_loss_rs": 9400},
    {"day": "Thu", "total_food_waste_kg": 18.2, "cost_loss_rs": 7100},
    {"day": "Fri (Today)", "total_food_waste_kg": 28.5, "cost_loss_rs": 10900},
    {"day": "Sat (Projected)", "total_food_waste_kg": 34.0, "cost_loss_rs": 13200},
    {"day": "Sun (Projected)", "total_food_waste_kg": 31.5, "cost_loss_rs": 12100},
]


class BinTelemetryUpdate(BaseModel):
    fill_level_percent: float = Field(ge=0, le=100)
    current_weight_kg: float = Field(ge=0)


class RecyclingCompanyRegistration(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254)
    contact_number: str = Field(min_length=1, max_length=40)
    address: str = Field(min_length=1, max_length=500)
    accepted_waste_types: Literal["Plastic", "Paper", "Both"]

    @field_validator("name", "contact_number", "address")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError("This field is required")
        return stripped_value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = parseaddr(value.strip())[1]
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            raise ValueError("A valid recycling company email is required")
        return email.lower()


def _configured_recycling_companies() -> List[Dict[str, Any]]:
    raw_recipients = os.getenv("RECYCLING_COMPANY_EMAILS", "")
    companies = []
    for index, (name, email) in enumerate(getaddresses([raw_recipients.replace(";", ",")])):
        if email:
            companies.append({
                "id": f"env-{index + 1}",
                "name": name or email.split("@", 1)[0],
                "email": email.lower(),
                "contact_number": "",
                "address": "Configured through environment",
                "accepted_waste_types": "Both",
                "created_at": None,
                "source": "environment",
            })
    return companies


RECYCLING_COMPANY_FILE = Path(
    os.getenv(
        "RECYCLING_COMPANY_FILE",
        str(Path(__file__).resolve().parents[2] / ".recycling_companies.json"),
    )
)


def _load_registered_recycling_companies() -> List[Dict[str, Any]]:
    try:
        saved_companies = json.loads(RECYCLING_COMPANY_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return []
    return saved_companies if isinstance(saved_companies, list) else []


def _merge_recycling_companies() -> List[Dict[str, Any]]:
    companies = []
    known_emails = set()
    for company in _configured_recycling_companies() + _load_registered_recycling_companies():
        email = str(company.get("email", "")).lower()
        if email and email not in known_emails:
            companies.append(company)
            known_emails.add(email)
    return companies


RECYCLING_COMPANIES = _merge_recycling_companies()
RECYCLING_COMPANY_LOCK = Lock()


def _save_registered_recycling_companies() -> None:
    registered_companies = [
        company for company in RECYCLING_COMPANIES
        if company.get("source") != "environment"
    ]
    RECYCLING_COMPANY_FILE.parent.mkdir(parents=True, exist_ok=True)
    temporary_file = RECYCLING_COMPANY_FILE.with_suffix(".tmp")
    temporary_file.write_text(
        json.dumps(registered_companies, indent=2),
        encoding="utf-8",
    )
    temporary_file.replace(RECYCLING_COMPANY_FILE)
NOTIFICATION_STATE_FILE = Path(
    os.getenv(
        "WASTE_NOTIFICATION_STATE_FILE",
        str(Path(__file__).resolve().parents[2] / ".waste_notification_state.json"),
    )
)


def _load_notification_state() -> Dict[str, bool]:
    default_state = {"plastic": False, "paper": False}
    try:
        saved_state = json.loads(NOTIFICATION_STATE_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return default_state
    return {
        bin_id: bool(saved_state.get(bin_id, False))
        for bin_id in default_state
    }


QUOTATION_EMAIL_SENT = _load_notification_state()
QUOTATION_EMAIL_LOCK = Lock()


def _save_notification_state() -> None:
    try:
        NOTIFICATION_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        temporary_file = NOTIFICATION_STATE_FILE.with_suffix(".tmp")
        temporary_file.write_text(json.dumps(QUOTATION_EMAIL_SENT), encoding="utf-8")
        temporary_file.replace(NOTIFICATION_STATE_FILE)
    except OSError:
        # In-memory deduplication still protects the running API if storage is read-only.
        pass


def _find_bin(bin_id: str) -> Dict[str, Any]:
    normalized_id = bin_id.strip().lower()
    for bin_data in SMART_BIN_COMPARTMENTS:
        if bin_data["id"] == normalized_id:
            return bin_data
    raise HTTPException(status_code=404, detail="Waste bin not found")


def _send_quotation_email(bin_data: Dict[str, Any]) -> Dict[str, Any]:
    waste_type = bin_data["waste_type"]
    recipients = [
        company["email"]
        for company in RECYCLING_COMPANIES
        if company.get("accepted_waste_types", "Both") in {waste_type, "Both"}
    ]
    if not recipients:
        return {
            "sent": False,
            "reason": f"No recycling companies accept {waste_type} waste",
        }

    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL", "").strip()
    if not smtp_host or not smtp_from_email:
        return {"sent": False, "reason": "SMTP_HOST and SMTP_FROM_EMAIL are required"}

    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        return {"sent": False, "reason": "SMTP_PORT must be a valid integer"}
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_use_ssl = _env_bool("SMTP_USE_SSL", False)
    smtp_use_tls = _env_bool("SMTP_USE_TLS", not smtp_use_ssl)
    smtp_timeout = _env_float("SMTP_TIMEOUT_SECONDS", 10.0)

    message = EmailMessage()
    message["Subject"] = f"Recycling collection quotation request: {bin_data['waste_type']} waste"
    message["From"] = smtp_from_email
    message["To"] = ", ".join(recipients)
    message.set_content(
        "A recyclable waste bin has reached its configured full-bin threshold.\n\n"
        f"Waste type: {bin_data['waste_type']}\n"
        f"Current waste weight: {bin_data['current_weight_kg']:.2f} kg\n"
        f"Fill-level percentage: {bin_data['fill_level_percent']:.1f}%\n\n"
        "Please provide a quotation and available time for recycling collection."
    )

    smtp_class = smtplib.SMTP_SSL if smtp_use_ssl else smtplib.SMTP
    try:
        with smtp_class(smtp_host, smtp_port, timeout=smtp_timeout) as smtp:
            if smtp_use_tls and not smtp_use_ssl:
                smtp.starttls()
            if smtp_username:
                smtp.login(smtp_username, smtp_password)
            refused = smtp.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        return {"sent": False, "reason": f"Email delivery failed: {exc}"}

    if refused:
        return {
            "sent": False,
            "reason": "Email was refused for one or more recycling companies",
            "refused_recipients": list(refused),
        }
    return {"sent": True, "recipient_count": len(recipients)}


def _handle_full_bin_event(bin_data: Dict[str, Any]) -> Dict[str, Any]:
    bin_id = bin_data["id"]
    if bin_id not in QUOTATION_EMAIL_SENT:
        return {"sent": False, "reason": "Quotation emails apply only to Plastic and Paper bins"}

    with QUOTATION_EMAIL_LOCK:
        if bin_data["fill_level_percent"] <= EMPTY_BIN_RESET_THRESHOLD_PERCENT:
            QUOTATION_EMAIL_SENT[bin_id] = False
            _save_notification_state()
            return {"sent": False, "reason": "Bin is empty; quotation email event has been reset"}
        if bin_data["fill_level_percent"] < FULL_BIN_THRESHOLD_PERCENT:
            return {"sent": False, "reason": "Bin is below the full-bin threshold"}
        if QUOTATION_EMAIL_SENT[bin_id]:
            return {"sent": False, "reason": "Quotation email already sent for this full-bin event"}

        delivery = _send_quotation_email(bin_data)
        if delivery["sent"]:
            QUOTATION_EMAIL_SENT[bin_id] = True
            _save_notification_state()
        return delivery


@router.get("/metrics")
def get_waste_metrics():
    """Retrieve telemetry for three bins and detailed analytics for food waste only."""
    return {
        "researcher": "Pathirana P.R.T (IT23324060)",
        "module": "Component 4: Three-Bin Waste Identification and Monitoring",
        "description": "Dedicated Food, Plastic, and Paper bins with IoT fill-level and weight monitoring.",
        "hardware_status": {
            "mcu": "ESP32 Wi-Fi / MQTT Controller (Online)",
            "bin_array": "3 Dedicated Bins: Food / Plastic / Paper",
            "load_cells": "3x HX711 Load Cells Calibrated",
            "ultrasonic_sensors": "3x HC-SR04 Fill Sensors Active",
        },
        "full_bin_threshold_percent": FULL_BIN_THRESHOLD_PERCENT,
        "empty_bin_reset_threshold_percent": EMPTY_BIN_RESET_THRESHOLD_PERCENT,
        "registered_recycling_company_count": len(RECYCLING_COMPANIES),
        "total_food_waste_today_kg": 28.5,
        "total_cost_loss_today": "LKR 10,900.00",
        "estimated_monthly_saving_potential": "LKR 84,500.00",
        "compartments": SMART_BIN_COMPARTMENTS,
        "waste_composition": WASTE_COMPOSITION,
        "daily_trend": DAILY_WASTE_TREND,
        "waste_reduction_recommendations": [
            "Rice Portioning Notice: Cooked rice accounts for 34.5% of daily food waste. Reduce the default plate portion by 15% and offer free refills on request.",
            "Vegetable Trim Optimization: 5.2 kg vegetable cuttings detected today. Shift clean carrot and onion scraps to stock preparation.",
            "Closed Feedback to Component 1: Excessive Seafood Rice waste on Thursdays (-8% demand adjustment recommended for the next cycle).",
        ],
    }


@router.post("/bins/{bin_id}/telemetry")
def update_bin_telemetry(bin_id: str, telemetry: BinTelemetryUpdate):
    """Update a bin and trigger one quotation email when Plastic or Paper becomes full."""
    bin_data = _find_bin(bin_id)
    bin_data["fill_level_percent"] = round(telemetry.fill_level_percent, 1)
    bin_data["current_weight_kg"] = round(telemetry.current_weight_kg, 2)
    bin_data["status"] = _bin_status(bin_data["fill_level_percent"])
    bin_data["last_sensor_update"] = _sensor_timestamp()
    email_delivery = _handle_full_bin_event(bin_data)
    return {"bin": bin_data, "quotation_email": email_delivery}


@router.post("/bins/{bin_id}/reset")
def reset_bin(bin_id: str):
    """Mark a bin as emptied and permit a future full-bin quotation email."""
    bin_data = _find_bin(bin_id)
    bin_data["fill_level_percent"] = 0.0
    bin_data["current_weight_kg"] = 0.0
    bin_data["status"] = "Normal"
    bin_data["last_sensor_update"] = _sensor_timestamp()
    if bin_data["id"] in QUOTATION_EMAIL_SENT:
        with QUOTATION_EMAIL_LOCK:
            QUOTATION_EMAIL_SENT[bin_data["id"]] = False
            _save_notification_state()
    return {"bin": bin_data, "quotation_email_reset": True}


@router.get("/recycling-companies")
def get_recycling_companies():
    return {"companies": RECYCLING_COMPANIES, "count": len(RECYCLING_COMPANIES)}


@router.post("/recycling-companies", status_code=status.HTTP_201_CREATED)
def register_recycling_company(company: RecyclingCompanyRegistration):
    with RECYCLING_COMPANY_LOCK:
        if any(entry["email"].lower() == company.email for entry in RECYCLING_COMPANIES):
            raise HTTPException(status_code=409, detail="Recycling company email is already registered")

        registered_company = {
            "id": str(uuid4()),
            "name": company.name,
            "email": company.email,
            "contact_number": company.contact_number,
            "address": company.address,
            "accepted_waste_types": company.accepted_waste_types,
            "created_at": _sensor_timestamp(),
            "source": "registration",
        }
        RECYCLING_COMPANIES.append(registered_company)
        try:
            _save_registered_recycling_companies()
        except OSError as exc:
            RECYCLING_COMPANIES.pop()
            raise HTTPException(
                status_code=500,
                detail="Unable to save the recycling company registration",
            ) from exc
    return registered_company
