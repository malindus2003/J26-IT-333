"""
Automated Test Suite for Component 4: Smart Waste Bin AI Recognition
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

Tests:
1. Dataset validation (empty dataset, valid structure, corrupt checks)
2. Supported image formats acceptance
3. Unsupported file rejection
4. Missing image payload rejection
5. Missing model weights error handling (HTTP 503)
6. Valid inference response schema serialization
7. Empty detection results formatting
8. Canonical 7-class name consistency
9. Bounding box validity
10. Existing Waste API backwards compatibility (GET /api/waste/metrics, recycling)
"""

import io
import os
import sys
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest
from PIL import Image
from fastapi.testclient import TestClient

# Setup sys.path
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.services.food_detection_service import (
    FoodDetectionService,
    food_detection_service,
    CANONICAL_CLASSES,
    ModelNotAvailableError,
    InvalidImageError
)
from ai.scripts.validate_dataset import validate_yolo_dataset, EXPECTED_CLASSES


client = TestClient(app)


def create_test_image(format="JPEG", size=(200, 200), color="blue") -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# 1. Dataset Validation Tests
# ---------------------------------------------------------------------------
def test_dataset_validation_on_empty_dir():
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        # Create minimal yolo folders
        for split in ["train", "val", "test"]:
            (tmp_path / "images" / split).mkdir(parents=True)
            (tmp_path / "labels" / split).mkdir(parents=True)

        res = validate_yolo_dataset(tmp_path)
        assert res["is_empty"] is True
        assert res["total_images"] == 0
        assert res["status"] == "EMPTY_DATASET_PENDING_IMPORT"


def test_dataset_validation_detects_corrupt_files():
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        train_img = tmp_path / "images" / "train"
        train_lbl = tmp_path / "labels" / "train"
        train_img.mkdir(parents=True)
        train_lbl.mkdir(parents=True)

        # Write invalid corrupt image
        corrupt_img = train_img / "corrupt.jpg"
        corrupt_img.write_bytes(b"NOT_AN_IMAGE_FILE_RANDOM_BYTES")

        # Write corresponding label
        (train_lbl / "corrupt.txt").write_text("0 0.5 0.5 0.2 0.2\n")

        res = validate_yolo_dataset(tmp_path)
        assert res["is_valid"] is False
        assert len(res["errors"]) > 0
        assert any("Corrupt image" in err for err in res["errors"])


def test_dataset_validation_detects_invalid_class_id():
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        train_img = tmp_path / "images" / "train"
        train_lbl = tmp_path / "labels" / "train"
        train_img.mkdir(parents=True)
        train_lbl.mkdir(parents=True)

        # Valid image
        valid_bytes = create_test_image("JPEG")
        (train_img / "sample.jpg").write_bytes(valid_bytes)

        # Invalid class id 99 (must be 0..6)
        (train_lbl / "sample.txt").write_text("99 0.5 0.5 0.2 0.2\n")

        res = validate_yolo_dataset(tmp_path)
        assert res["is_valid"] is False
        assert any("out of bounds" in err or "Invalid class ID 99" in err for err in res["errors"])


# ---------------------------------------------------------------------------
# 2. Supported Image Formats
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("fmt,ext", [
    ("JPEG", "jpg"),
    ("PNG", "png"),
    ("WEBP", "webp"),
    ("BMP", "bmp")
])
def test_supported_image_formats(fmt, ext):
    img_bytes = create_test_image(format=fmt)
    service = FoodDetectionService()
    img, w, h = service.validate_image_bytes(img_bytes, filename=f"test.{ext}")
    assert w == 200
    assert h == 200
    assert img.mode == "RGB"


# ---------------------------------------------------------------------------
# 3. Unsupported File Rejection
# ---------------------------------------------------------------------------
def test_unsupported_file_extension_rejected():
    service = FoodDetectionService()
    with pytest.raises(InvalidImageError) as exc_info:
        service.validate_image_bytes(b"some bytes", filename="document.pdf")
    assert "Unsupported image extension" in str(exc_info.value)


def test_oversized_image_rejected():
    service = FoodDetectionService()
    oversized = b"0" * (11 * 1024 * 1024)  # 11MB
    with pytest.raises(InvalidImageError) as exc_info:
        service.validate_image_bytes(oversized, filename="large.jpg")
    assert "exceeds maximum allowed" in str(exc_info.value)


# ---------------------------------------------------------------------------
# 4. Missing Image Uploads
# ---------------------------------------------------------------------------
def test_classify_endpoint_missing_file():
    res = client.post("/api/waste/classify")
    assert res.status_code == 400
    assert "No image file provided" in res.json()["detail"]


def test_classify_endpoint_empty_file():
    res = client.post(
        "/api/waste/classify",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 5. Missing Model Weights Handling (Academic Integrity Rule)
# ---------------------------------------------------------------------------
def test_missing_model_weights_returns_503():
    # Point to nonexistent weights path
    service = FoodDetectionService()
    service._default_weights_path = Path("nonexistent/path/best.pt")

    img_bytes = create_test_image()
    with pytest.raises(ModelNotAvailableError) as exc_info:
        service.detect_food_waste(img_bytes, filename="test.jpg")
    assert "Academic Integrity Rule" in str(exc_info.value)


def test_endpoint_returns_503_when_weights_missing(monkeypatch):
    monkeypatch.setenv("FOOD_WASTE_MODEL_PATH", "nonexistent_best.pt")
    img_bytes = create_test_image()
    res = client.post(
        "/api/waste/classify",
        files={"file": ("tray.jpg", img_bytes, "image/jpeg")}
    )
    assert res.status_code == 503
    assert "weights not found" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 6 & 7. Valid Inference Response Structure & Empty Detections (Mocked)
# ---------------------------------------------------------------------------
def test_inference_response_structure_with_detections():
    """Tests schema serialization using mock YOLO output to verify API contracts."""
    mock_box = MagicMock()
    mock_box.cls = [MagicMock(item=lambda: 0)]  # class 0: rice
    mock_box.conf = [MagicMock(item=lambda: 0.9412)]
    mock_box.xyxy = [MagicMock(tolist=lambda: [120.0, 80.0, 320.0, 280.0])]

    mock_result = MagicMock()
    mock_result.boxes = [mock_box]

    mock_model = MagicMock()
    mock_model.predict.return_value = [mock_result]

    service = FoodDetectionService()
    service._model = mock_model

    img_bytes = create_test_image(size=(640, 480))
    res = service.detect_food_waste(img_bytes, filename="plate.jpg")

    assert res["success"] is True
    assert res["model_version"] == "food-waste-yolo-v1"
    assert res["total_detected"] == 1
    assert res["inference_time_ms"] >= 0.0
    assert res["image_dimensions"] == {"width": 640, "height": 480}

    det = res["detections"][0]
    assert det["class_id"] == 0
    assert det["class_name"] == "rice"
    assert det["confidence"] == 0.9412
    assert det["bounding_box"] == {"x1": 120.0, "y1": 80.0, "x2": 320.0, "y2": 280.0}


def test_empty_detection_results_returns_empty_list():
    mock_result = MagicMock()
    mock_result.boxes = []

    mock_model = MagicMock()
    mock_model.predict.return_value = [mock_result]

    service = FoodDetectionService()
    service._model = mock_model

    img_bytes = create_test_image()
    res = service.detect_food_waste(img_bytes, filename="empty_tray.jpg")

    assert res["success"] is True
    assert res["total_detected"] == 0
    assert res["detections"] == []


# ---------------------------------------------------------------------------
# 8. Class Name Consistency
# ---------------------------------------------------------------------------
def test_canonical_class_names_consistency():
    expected = {
        0: "rice",
        1: "kottu",
        2: "noodles",
        3: "chicken",
        4: "bread",
        5: "whole_mango",
        6: "mango_peel"
    }
    assert CANONICAL_CLASSES == expected
    assert EXPECTED_CLASSES == expected


# ---------------------------------------------------------------------------
# 9. Manual Corrections Recording
# ---------------------------------------------------------------------------
def test_manual_correction_workflow():
    payload = {
        "original_class_id": 0,
        "original_class_name": "rice",
        "original_confidence": 0.86,
        "corrected_class_id": 1,
        "corrected_class_name": "kottu",
        "status": "corrected",
        "model_version": "food-waste-yolo-v1",
        "notes": "Leftover mixed dinner kottu"
    }
    res = client.post("/api/waste/corrections", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["record"]["corrected_class_name"] == "kottu"
    assert data["record"]["status"] == "corrected"
    assert "timestamp" in data["record"]


# ---------------------------------------------------------------------------
# 10. Existing Waste API Compatibility
# ---------------------------------------------------------------------------
def test_existing_waste_metrics_endpoint_unbroken():
    res = client.get("/api/waste/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "compartments" in data
    assert "hardware_status" in data
    assert "total_food_waste_today_kg" in data
    assert len(data["compartments"]) == 3
    bin_ids = [c["id"] for c in data["compartments"]]
    assert bin_ids == ["food", "plastic", "paper"]


def test_existing_recycling_companies_endpoint_unbroken():
    res = client.get("/api/waste/recycling-companies")
    assert res.status_code == 200
    assert "companies" in res.json()
