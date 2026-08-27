from fastapi import APIRouter
from ..schemas import PredictionRequest, SpoilagePredictionResult
from ..models.ml_engine import ml_spoilage_engine

router = APIRouter(prefix="/api/predictions", tags=["Multi-Modal Spoilage Predictions"])

@router.post("/assess", response_model=SpoilagePredictionResult)
def assess_food_spoilage(payload: PredictionRequest):
    """
    Combine IoT sensory telemetry and computer vision features to generate:
    - Remaining Shelf-Life (hours)
    - Spoilage Probability (%)
    - Risk Score & Categorization (Low, Medium, High, Critical)
    - Intelligent culinary & storage recommendations
    """
    result = ml_spoilage_engine.predict(
        item_name=payload.item_name,
        category=payload.category,
        storage_duration_hours=payload.storage_duration_hours,
        sensor=payload.sensor_data,
        vision=payload.vision_data
    )
    return result
