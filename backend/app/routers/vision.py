import base64
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
from ..models.cv_engine import vision_engine

router = APIRouter(prefix="/api/vision", tags=["Computer Vision Inspection"])

@router.post("/inspect")
async def inspect_food_image(
    file: Optional[UploadFile] = File(None),
    category: str = Form("Meat"),
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
        "category": category,
        "features": results
    }
