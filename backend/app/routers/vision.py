import base64
import urllib.request
import urllib.error
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Request
from typing import Optional, Dict, Any
from ..models.cv_engine import vision_engine

router = APIRouter(prefix="/api/vision", tags=["Computer Vision Inspection"])

# In-memory storage for latest ESP32-CAM frame & diagnosis
latest_esp32_scan: Dict[str, Any] = {
    "status": "idle",
    "image_base64": None,
    "analysis": None,
    "timestamp": None,
    "source_url": None,
    "container_id": "Container #C-101"
}

class ESP32CaptureRequest(BaseModel):
    camera_url: str = "http://192.168.1.100/capture"
    category: Optional[str] = "Fruits"
    container_id: Optional[str] = "Container #C-101"

def _format_vision_response(results: Dict[str, Any], category: str) -> Dict[str, Any]:
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
    return _format_vision_response(results, category)

@router.post("/esp32/capture")
async def capture_from_esp32_camera(payload: ESP32CaptureRequest):
    """
    Directly pulls a snapshot from an active ESP32-CAM hardware module
    over Wi-Fi (e.g. http://192.168.1.100/capture or /jpg), runs the
    AI Computer Vision inspection pipeline, and returns the diagnostics.
    """
    clean_url = payload.camera_url.strip()
    if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
        clean_url = f"http://{clean_url}"

    try:
        req = urllib.request.Request(
            clean_url,
            headers={"User-Agent": "Smart-Restaurant-Vision-Server/1.0"}
        )
        with urllib.request.urlopen(req, timeout=7.0) as resp:
            image_bytes = resp.read()
            if not image_bytes or len(image_bytes) < 100:
                raise HTTPException(status_code=502, detail="Empty frame received from ESP32-CAM module")
    except urllib.error.URLError as e:
        raise HTTPException(
            status_code=504,
            detail=f"Unable to connect to ESP32-CAM at {clean_url}. Check Wi-Fi connection and IP address: {e.reason}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch frame from ESP32-CAM ({clean_url}): {str(e)}"
        )

    results = vision_engine.analyze_image(image_bytes, category=payload.category)
    b64_str = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{b64_str}"

    response_data = _format_vision_response(results, payload.category)
    response_data["image_base64"] = data_url
    response_data["source"] = "ESP32-CAM (Pull Mode)"
    response_data["camera_url"] = clean_url
    response_data["container_id"] = payload.container_id
    response_data["captured_at"] = datetime.now().isoformat()

    latest_esp32_scan.update({
        "status": "success",
        "image_base64": data_url,
        "analysis": response_data,
        "timestamp": datetime.now().isoformat(),
        "source_url": clean_url,
        "container_id": payload.container_id
    })

    return response_data

@router.post("/esp32/upload")
async def upload_esp32_frame(
    request: Request,
    file: Optional[UploadFile] = File(None),
    category: str = Form("Fruits"),
    container_id: str = Form("Container #C-101")
):
    """
    Receives an image pushed by the ESP32-CAM module directly via HTTP POST
    (multipart form or raw JPEG binary stream).
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()
    else:
        # Check raw body stream
        body = await request.body()
        if body and len(body) > 100:
            image_bytes = body

    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image bytes received from ESP32-CAM")

    results = vision_engine.analyze_image(image_bytes, category=category)
    b64_str = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{b64_str}"

    response_data = _format_vision_response(results, category)
    response_data["image_base64"] = data_url
    response_data["source"] = "ESP32-CAM (Push Mode)"
    response_data["container_id"] = container_id
    response_data["captured_at"] = datetime.now().isoformat()

    latest_esp32_scan.update({
        "status": "success",
        "image_base64": data_url,
        "analysis": response_data,
        "timestamp": datetime.now().isoformat(),
        "source_url": "HTTP POST (Push)",
        "container_id": container_id
    })

    return response_data

@router.get("/esp32/latest")
def get_latest_esp32_scan():
    """Returns the most recent snapshot and CV diagnostics from the ESP32-CAM."""
    return latest_esp32_scan
