import base64
import json
import os
import urllib.request
import urllib.error
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Request
from typing import Optional, Dict, Any, List
from ..models.cv_engine import vision_engine

router = APIRouter(prefix="/api/vision", tags=["Computer Vision Inspection"])

# Inspection History Storage Path
HISTORY_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "inspection_history.json"
)

def _load_inspection_history() -> List[Dict[str, Any]]:
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def _save_to_inspection_history(record: Dict[str, Any]):
    try:
        os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
        history = _load_inspection_history()
        # Prepend latest inspection, maintain max 100 entries
        history.insert(0, record)
        if len(history) > 100:
            history = history[:100]
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"[VisionRouter] Warning saving inspection history: {e}")

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
    camera_url: str = "http://172.20.10.2/capture"
    category: Optional[str] = "Fruits"
    container_id: Optional[str] = "Container #C-101"

def _format_vision_response(results: Dict[str, Any], category: str) -> Dict[str, Any]:
    return {
        "status": "success",
        "analysis_id": results.get("analysis_id", "CV-SCAN-UNKNOWN"),
        "timestamp": results.get("timestamp", datetime.now().isoformat()),
        "model_version": results.get("model_version", "v2.3-calibrated"),
        "image_hash": results.get("image_hash", ""),
        "category": results.get("category", category),

        # Decoupled Core Fields
        "species_identity": results.get("species_identity", results.get("identified_produce", "Produce")),
        "identified_produce": results.get("identified_produce", "Produce"),
        "is_supported_produce": results.get("is_supported_produce", True),
        "produce_confidence": results.get("produce_confidence", 85.0),
        "alternative_predictions": results.get("alternative_predictions", []),
        "species_probabilities": results.get("species_probabilities", {}),

        "ripeness_classification": results.get("ripeness_classification", "Ripe / Optimal"),
        "ripeness_stage": results.get("ripeness_stage", "Ripe / Optimal (Grade B)"),
        "is_uncertain": results.get("is_uncertain", False),
        "stage_probabilities": results.get("stage_probabilities", {}),
        "ripeness_percent": results.get("ripeness_percent", 50.0),

        "visible_spoilage_classification": results.get("visible_spoilage_classification", "No visible spoilage detected"),
        "spoilage_probability": results.get("spoilage_probability", 0.0),
        "calibrated_threshold": results.get("calibrated_threshold", 41.0),
        "visual_spoilage_score": results.get("visual_spoilage_score", 50.0),
        "risk_level": results.get("risk_level", "Low"),

        "defect_types": results.get("defect_types", ["None"]),
        "detected_defects": results.get("detected_defects", []),
        "defect_surface_area_percent": results.get("defect_surface_area_percent", 0.0),
        "mould_detected": results.get("mould_detected", False),
        "mould_confidence": results.get("mould_confidence", 0.0),
        "calibrated_mould_threshold": results.get("calibrated_mould_threshold", 46.0),
        "mould_coverage": results.get("mould_coverage", 0.0),
        "discoloration_score": results.get("discoloration_score", 0.0),
        "texture_degradation": results.get("texture_degradation", 0.0),

        "remaining_shelf_life_hours": results.get("remaining_shelf_life_hours", 0.0),
        "baseline_shelf_life_hours": results.get("baseline_shelf_life_hours", 120.0),
        "rsl_min_hours": results.get("rsl_min_hours", 0.0),
        "rsl_max_hours": results.get("rsl_max_hours", 0.0),
        "rsl_confidence_interval": results.get("rsl_confidence_interval", "0.0 hrs"),

        "produce_icon": results.get("produce_icon", "🍎"),
        "scientific_name": results.get("scientific_name", ""),
        "bounding_boxes": results.get("bounding_boxes", []),
        "image_width": results.get("image_width", 256),
        "image_height": results.get("image_height", 256),
        "processing_latency_ms": results.get("processing_latency_ms", 0.0),
        "diagnostic_log": results.get("diagnostic_log", {}),
        "scientific_disclaimer": results.get("scientific_disclaimer", ""),
        "features": results
    }

@router.post("/inspect")
async def inspect_food_image(
    file: Optional[UploadFile] = File(None),
    category: str = Form("Fruits"),
    image_base64: Optional[str] = Form(None)
):
    """
    Inspect an uploaded food image for species recognition, discoloration, mould colonies, 
    ripeness stage, defect bounding boxes, and remaining shelf-life prediction intervals.
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()
    elif image_base64:
        try:
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
            image_bytes = base64.b64decode(image_base64)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")
    else:
        raise HTTPException(status_code=400, detail="No image file or base64 data provided")

    results = vision_engine.analyze_image(image_bytes, category=category)
    response_data = _format_vision_response(results, category)

    # Persist summary into inspection history
    history_entry = {
        "analysis_id": response_data["analysis_id"],
        "timestamp": response_data["timestamp"],
        "source": "Manual Upload",
        "produce": response_data["identified_produce"],
        "species_identity": response_data.get("species_identity", response_data["identified_produce"]),
        "produce_icon": response_data["produce_icon"],
        "confidence": response_data["produce_confidence"],
        "stage": response_data["ripeness_stage"],
        "ripeness_classification": response_data.get("ripeness_classification", "Ripe / Optimal"),
        "visible_spoilage_classification": response_data.get("visible_spoilage_classification", "No visible spoilage detected"),
        "spoilage_probability": response_data.get("spoilage_probability", 0.0),
        "defect_types": response_data.get("defect_types", ["None"]),
        "rsl_hours": response_data["remaining_shelf_life_hours"],
        "rsl_interval": response_data["rsl_confidence_interval"],
        "risk_level": response_data["risk_level"],
        "mould_detected": response_data["mould_detected"],
        "mould_confidence": response_data.get("mould_confidence", 0.0),
        "defect_count": len(response_data["bounding_boxes"]),
        "latency_ms": response_data["processing_latency_ms"]
    }
    _save_to_inspection_history(history_entry)

    return response_data

@router.post("/esp32/capture")
async def capture_from_esp32_camera(payload: ESP32CaptureRequest):
    """
    Directly pulls a snapshot from an active ESP32-CAM hardware module
    over Wi-Fi (e.g. http://172.20.10.2/capture), runs the multi-stage
    AI inference pipeline, persists history, and returns diagnostics.
    """
    clean_url = payload.camera_url.strip()
    if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
        clean_url = f"http://{clean_url}"

    try:
        req = urllib.request.Request(
            clean_url,
            headers={"User-Agent": "GreenPulse-Smart-Restaurant-Server/2.2"}
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

    # Persist into inspection history
    history_entry = {
        "analysis_id": response_data["analysis_id"],
        "timestamp": response_data["timestamp"],
        "source": "ESP32-CAM Node",
        "camera_url": clean_url,
        "container_id": payload.container_id,
        "produce": response_data["identified_produce"],
        "species_identity": response_data.get("species_identity", response_data["identified_produce"]),
        "produce_icon": response_data["produce_icon"],
        "confidence": response_data["produce_confidence"],
        "stage": response_data["ripeness_stage"],
        "ripeness_classification": response_data.get("ripeness_classification", "Ripe / Optimal"),
        "visible_spoilage_classification": response_data.get("visible_spoilage_classification", "No visible spoilage detected"),
        "spoilage_probability": response_data.get("spoilage_probability", 0.0),
        "defect_types": response_data.get("defect_types", ["None"]),
        "rsl_hours": response_data["remaining_shelf_life_hours"],
        "rsl_interval": response_data["rsl_confidence_interval"],
        "risk_level": response_data["risk_level"],
        "mould_detected": response_data["mould_detected"],
        "defect_count": len(response_data["bounding_boxes"]),
        "latency_ms": response_data["processing_latency_ms"]
    }
    _save_to_inspection_history(history_entry)

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

    history_entry = {
        "analysis_id": response_data["analysis_id"],
        "timestamp": response_data["timestamp"],
        "source": "ESP32-CAM (Push)",
        "container_id": container_id,
        "produce": response_data["identified_produce"],
        "species_identity": response_data.get("species_identity", response_data["identified_produce"]),
        "produce_icon": response_data["produce_icon"],
        "confidence": response_data["produce_confidence"],
        "stage": response_data["ripeness_stage"],
        "ripeness_classification": response_data.get("ripeness_classification", "Ripe / Optimal"),
        "visible_spoilage_classification": response_data.get("visible_spoilage_classification", "No visible spoilage detected"),
        "spoilage_probability": response_data.get("spoilage_probability", 0.0),
        "defect_types": response_data.get("defect_types", ["None"]),
        "rsl_hours": response_data["remaining_shelf_life_hours"],
        "rsl_interval": response_data["rsl_confidence_interval"],
        "risk_level": response_data["risk_level"],
        "mould_detected": response_data["mould_detected"],
        "defect_count": len(response_data["bounding_boxes"]),
        "latency_ms": response_data["processing_latency_ms"]
    }
    _save_to_inspection_history(history_entry)

    return response_data

@router.get("/esp32/latest")
def get_latest_esp32_scan():
    """Returns the most recent snapshot and CV diagnostics from the ESP32-CAM."""
    return latest_esp32_scan

@router.get("/history")
def get_inspection_history(limit: int = 50):
    """Returns recent persistent visual inspection history records."""
    history = _load_inspection_history()
    return {
        "status": "success",
        "total_records": len(history),
        "history": history[:limit]
    }

@router.delete("/history")
def clear_inspection_history():
    """Clears the persistent inspection history log."""
    try:
        if os.path.exists(HISTORY_FILE):
            os.remove(HISTORY_FILE)
        return {"status": "success", "message": "Inspection history cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
def get_model_benchmark_metrics():
    """Returns the genuine test set benchmark metrics for the deployed CV models."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    metrics_path = os.path.join(base_dir, "models", "saved_models", "cv_real_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"status": "error", "message": "Metrics report not found."}
