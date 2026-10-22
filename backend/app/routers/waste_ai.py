import os
from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Query, status

from ..schemas.food_detection import (
    FoodClassificationResponse,
    ManualCorrectionRequest,
    ManualCorrectionResponse,
    ManualCorrectionRecord,
)
from ..services.food_detection_service import (
    food_detection_service,
    ModelNotAvailableError,
    InvalidImageError,
    MAX_IMAGE_SIZE_BYTES,
    CANONICAL_CLASSES,
)

router = APIRouter(prefix="/api/waste", tags=["Component 4: AI Food Waste Recognition"])


@router.get("/ai/status")
def get_ai_model_status():
    """Retrieve operational status, weights existence, and canonical classes for YOLO AI module."""
    return food_detection_service.get_model_status()


@router.post(
    "/classify",
    response_model=FoodClassificationResponse,
    summary="Detect and classify food waste items in an image"
)
async def classify_food_waste_image(
    file: Optional[UploadFile] = File(None),
    confidence: float = Query(0.25, ge=0.01, le=1.0, description="Minimum confidence threshold"),
    imgsz: int = Query(640, ge=320, le=1280, description="Inference image resolution")
):
    """
    Accepts an RGB image upload, executes YOLO multi-object detection,
    and returns detected food waste classes with bounding boxes and confidence scores.
    """
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided in request. Please upload an image using multipart/form-data."
        )

    filename = file.filename or "uploaded_image.jpg"
    try:
        image_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read image stream: {exc}"
        )

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes received)."
        )

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image size exceeds limit of {MAX_IMAGE_SIZE_BYTES / 1024 / 1024:.0f} MB."
        )

    try:
        detection_result = food_detection_service.detect_food_waste(
            image_bytes=image_bytes,
            filename=filename,
            confidence_threshold=confidence,
            imgsz=imgsz
        )
        return FoodClassificationResponse(**detection_result)

    except InvalidImageError as iie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(iie)
        )
    except ModelNotAvailableError as mne:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(mne)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during AI recognition: {exc}"
        )


@router.post(
    "/corrections",
    response_model=ManualCorrectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record confirmation or correction of AI food waste prediction"
)
def record_prediction_correction(correction: ManualCorrectionRequest):
    """
    Saves kitchen operator confirmation or class correction.
    Preserves original prediction and human correction for retraining and evaluation.
    """
    try:
        record = food_detection_service.record_manual_correction(correction.model_dump())
        return ManualCorrectionResponse(
            success=True,
            message="Correction recorded successfully.",
            record=ManualCorrectionRecord(**record)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record manual correction: {exc}"
        )


@router.get(
    "/corrections",
    summary="List all recorded prediction corrections"
)
def list_prediction_corrections():
    """Retrieve all logged human confirmations and corrections for research evaluation."""
    corrections = food_detection_service.get_corrections()
    return {
        "total": len(corrections),
        "corrections": corrections
    }
