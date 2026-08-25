from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SensorReading(BaseModel):
    storage_zone: str = Field(..., example="Chiller 1 (Meat & Poultry)")
    temperature: float = Field(..., description="Temperature in Celsius", example=3.5)
    humidity: float = Field(..., description="Relative Humidity percentage", example=72.0)
    nh3: float = Field(..., description="Ammonia concentration in ppm", example=0.15)
    co2: float = Field(..., description="Carbon Dioxide in ppm", example=480.0)
    voc: float = Field(..., description="Volatile Organic Compounds in ppm / IAQ index", example=0.25)
    timestamp: Optional[datetime] = None

class VisionFeatures(BaseModel):
    category: str = Field(..., example="Meat")
    discoloration_score: float = Field(..., description="0-100% surface discoloration", example=12.5)
    mould_detected: bool = Field(..., example=False)
    mould_coverage: float = Field(..., description="0-100% mould surface area", example=0.0)
    ripeness_stage: str = Field(..., example="Fresh / Optimal")
    texture_degradation: float = Field(..., description="0-100% texture defect score", example=15.0)
    visual_spoilage_score: float = Field(..., description="Aggregated visual risk 0-100", example=18.0)

class PredictionRequest(BaseModel):
    item_name: str = Field(..., example="Chicken Breast Fillet")
    category: str = Field(..., example="Meat")  # Meat, Fish, Dairy, Fruits, Vegetables
    storage_duration_hours: float = Field(..., example=48.0)
    sensor_data: SensorReading
    vision_data: Optional[VisionFeatures] = None

class SpoilagePredictionResult(BaseModel):
    item_name: str
    category: str
    spoilage_probability: float  # 0 to 100%
    remaining_shelf_life_hours: float
    risk_level: str  # Low, Medium, High, Critical
    risk_score: float  # 0 to 100
    dominant_spoilage_factors: List[str]
    recommendations: List[str]
    storage_action: str
    predicted_at: datetime = Field(default_factory=datetime.utcnow)

class InventoryItem(BaseModel):
    id: str
    name: str
    category: str
    storage_zone: str
    batch_number: str
    quantity: str
    stored_at: str
    storage_duration_hours: float
    current_temp: float
    current_humidity: float
    current_nh3: float
    current_co2: float
    current_voc: float
    spoilage_prob: float
    remaining_shelf_life_hours: float
    risk_level: str
    status: str
    recommendation: str

class RecommendationItem(BaseModel):
    id: str
    type: str  # 'PRIORITY_USE', 'STORAGE_ALERT', 'DISPOSAL_WARNING', 'OPTIMAL'
    severity: str  # 'low', 'medium', 'high', 'critical'
    title: str
    item_name: str
    zone: str
    message: str
    suggested_action: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
