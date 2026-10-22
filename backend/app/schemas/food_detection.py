from datetime import datetime, timezone
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float = Field(..., description="Top-left X coordinate in pixels")
    y1: float = Field(..., description="Top-left Y coordinate in pixels")
    x2: float = Field(..., description="Bottom-right X coordinate in pixels")
    y2: float = Field(..., description="Bottom-right Y coordinate in pixels")


class FoodDetection(BaseModel):
    class_id: int = Field(..., description="Class identifier (0..6)")
    class_name: str = Field(..., description="Canonical food waste class name")
    confidence: float = Field(..., description="Detection confidence score (0.0 to 1.0)")
    bounding_box: BoundingBox


class FoodClassificationResponse(BaseModel):
    success: bool = True
    model_version: str = Field(..., description="Model version tag or checkpoint identifier")
    detections: List[FoodDetection] = Field(default_factory=list)
    inference_time_ms: float = Field(..., description="Inference latency in milliseconds")
    total_detected: int = Field(0, description="Total food items recognized")
    image_dimensions: Optional[Dict[str, int]] = Field(None, description="Width and height of the processed image")


class ManualCorrectionRequest(BaseModel):
    prediction_id: Optional[str] = None
    original_class_id: Optional[int] = None
    original_class_name: str = Field(..., min_length=1)
    original_confidence: float = Field(..., ge=0.0, le=1.0)
    corrected_class_id: Optional[int] = None
    corrected_class_name: str = Field(..., min_length=1, description="Selected class or 'unsupported'")
    status: Literal["confirmed", "corrected"] = "confirmed"
    model_version: str = Field(default="food-waste-yolo-v1")
    notes: Optional[str] = None


class ManualCorrectionRecord(BaseModel):
    id: str
    timestamp: str
    prediction_id: Optional[str] = None
    original_class_id: Optional[int] = None
    original_class_name: str
    original_confidence: float
    corrected_class_id: Optional[int] = None
    corrected_class_name: str
    status: Literal["confirmed", "corrected"]
    model_version: str
    notes: Optional[str] = None


class ManualCorrectionResponse(BaseModel):
    success: bool = True
    message: str
    record: ManualCorrectionRecord
