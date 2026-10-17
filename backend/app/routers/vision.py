import base64
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
from ..models.cv_engine import vision_engine

router = APIRouter(prefix="/api/vision", tags=["Computer Vision Inspection"])

@router.post("/inspect")
async def inspect_food_image(
    file: Optional[UploadFile] = File(None),
    category: str = Form("Fruits"),
    image_base64: Optional[str] = Form(None)
):
    """
    Inspect an uploaded food image for discoloration, mould colonies, 
    ripeness stage, and texture degradation.
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()
    elif image_base64:
        try:
            # Clean header if present (e.g. data:image/jpeg;base64,...)
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
            image_bytes = base64.b64decode(image_base64)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")
    else:
        raise HTTPException(status_code=400, detail="No image file or base64 data provided")

    results = vision_engine.analyze_image(image_bytes, category=category)
    return {
        "status": "success",
        "category": results.get("category", category),
        "identified_produce": results.get("identified_produce", "Produce"),
        "produce_confidence": results.get("produce_confidence", 85.0),
        "produce_icon": results.get("produce_icon", "🍎"),
        "scientific_name": results.get("scientific_name", ""),
        "remaining_shelf_life_hours": results.get("remaining_shelf_life_hours", 0.0),
        "baseline_shelf_life_hours": results.get("baseline_shelf_life_hours", 120.0),
        "ripeness_stage": results.get("ripeness_stage", "Optimal Ripe (Grade B)"),
        "ripeness_percent": results.get("ripeness_percent", 50.0),
        "visual_spoilage_score": results.get("visual_spoilage_score", 50.0),
        "risk_level": results.get("risk_level", "Low"),
        "discoloration_score": results.get("discoloration_score", 0.0),
        "mould_detected": results.get("mould_detected", False),
        "mould_coverage": results.get("mould_coverage", 0.0),
        "texture_degradation": results.get("texture_degradation", 0.0),
        "detected_defects": results.get("detected_defects", []),
        "bounding_boxes": results.get("bounding_boxes", []),
        "image_width": results.get("image_width", 256),
        "image_height": results.get("image_height", 256),
        "features": results
    }
