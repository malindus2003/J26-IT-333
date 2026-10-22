"""
Food Detection Service for Component 4: Smart Waste Bin
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

Handles:
- Singleton YOLO model loading & caching
- Pre-flight image format, readability, and size validation
- Multi-object detection inference with bounding boxes and confidence scores
- Canonical 7-class mapping (rice, kottu, noodles, chicken, bread, whole_mango, mango_peel)
- Academic manual correction logging for model retraining and audit
"""

import os
import io
import time
import json
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image

CANONICAL_CLASSES: Dict[int, str] = {
    0: "rice",
    1: "kottu",
    2: "noodles",
    3: "chicken",
    4: "whole_mango",
    5: "mango_flesh",
    6: "mango_peel"
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class ModelNotAvailableError(Exception):
    """Raised when YOLO weights are missing or not yet trained."""
    pass


class InvalidImageError(Exception):
    """Raised when image fails validation (corrupted, unsupported format, or oversized)."""
    pass


class FoodDetectionService:
    def __init__(self):
        self._model = None
        self._model_path: Optional[Path] = None
        self._model_version = "food-waste-yolo-pilot-v2"
        self._lock = Lock()
        self._correction_lock = Lock()

        # Resolve paths
        self._backend_dir = Path(__file__).resolve().parents[2]
        self._default_weights_path = self._backend_dir / "ai" / "models" / "food-waste-yolo-pilot-v2_best.pt"
        self._corrections_file = self._backend_dir / "ai" / "results" / "manual_corrections.json"

    def get_model_status(self) -> Dict[str, Any]:
        weights_path = self._get_configured_weights_path()
        device_str = "CUDA (GPU)" if self._is_cuda_active() else "CPU"

        # Ensure model is checked and loaded for live introspection
        loaded = False
        model_names = None
        if self._model is not None:
            loaded = True
            model_names = getattr(self._model, "names", None)
        elif weights_path.exists():
            try:
                m = self.load_model()
                loaded = m is not None
                model_names = getattr(m, "names", None)
            except Exception as e:
                print(f"[FoodDetectionService] Model load check on status query: {e}")
                loaded = False

        is_v2 = weights_path.name == "food-waste-yolo-pilot-v2_best.pt"

        if loaded and is_v2:
            status_label = f"Pilot v2 loaded ({device_str})"
        elif loaded:
            status_label = f"{weights_path.name} loaded ({device_str})"
        elif not weights_path.exists():
            status_label = "Checkpoint Missing"
        else:
            status_label = "Not Loaded"

        return {
            "model_version": "food-waste-yolo-pilot-v2" if is_v2 else self._model_version,
            "weights_filename": weights_path.name,
            "weights_path": str(weights_path),
            "weights_exist": weights_path.exists(),
            "is_loaded": loaded,
            "is_pilot_v2": is_v2 and loaded,
            "device": device_str,
            "status_label": status_label,
            "model_names": model_names or CANONICAL_CLASSES,
            "classes": model_names or CANONICAL_CLASSES,
            "num_classes": len(model_names or CANONICAL_CLASSES),
            "provenance": {
                "checkpoint": "food-waste-yolo-pilot-v2_best.pt",
                "clean_approved_images": 127,
                "dataset_config": "backend/ai/datasets/food_waste_pilot_v2/data.yaml",
                "training_run": "backend/ai/results/train_runs/food-waste-yolo-pilot-v2",
                "best_epoch": 36,
                "val_mAP50": 0.765,
                "test_mAP50": 0.7158,
                "unassessed_classes": ["chicken", "mango_peel"]
            }
        }

    def _is_cuda_active(self) -> bool:
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False

    def _get_configured_weights_path(self) -> Path:
        env_path = os.getenv("FOOD_WASTE_MODEL_PATH")
        if env_path:
            p = Path(env_path)
            if not p.is_absolute():
                p = (self._backend_dir / p).resolve()
            return p
        return self._default_weights_path.resolve()

    def load_model(self, force_reload: bool = False):
        """Loads model into memory if not already loaded (Thread-safe singleton)."""
        with self._lock:
            if self._model is not None and not force_reload:
                return self._model

            weights_path = self._get_configured_weights_path()
            if not weights_path.exists():
                raise ModelNotAvailableError(
                    f"Food waste detection model weights not found at '{weights_path}'. "
                    f"Academic Integrity Rule: Required clean checkpoint '{weights_path.name}' is missing. "
                    "Inference requires verified trained weights."
                )

            try:
                from ultralytics import YOLO
                print(f"[FoodDetectionService] Loading verified YOLO model weights from {weights_path}...")
                loaded_model = YOLO(str(weights_path))

                # Verify class IDs and names match Pilot v2 / data.yaml
                names = getattr(loaded_model, "names", {})
                expected_classes = {0: "rice", 1: "kottu", 2: "noodles", 3: "chicken", 4: "whole_mango", 5: "mango_flesh", 6: "mango_peel"}
                if not isinstance(names, dict) or names != expected_classes:
                    raise RuntimeError(
                        f"Loaded model classes {names} do not match the expected 7 Pilot v2 classes: {expected_classes}"
                    )

                self._model = loaded_model
                self._model_path = weights_path
                return self._model
            except Exception as exc:
                self._model = None
                raise RuntimeError(f"Failed to initialize YOLO model from '{weights_path}': {exc}") from exc

    def validate_image_bytes(self, image_bytes: bytes, filename: str = "") -> Tuple[Image.Image, int, int]:
        """Validates payload size, format, and readable pixel buffer."""
        if not image_bytes:
            raise InvalidImageError("Image payload is empty (0 bytes received).")

        if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise InvalidImageError(
                f"Image size ({len(image_bytes) / 1024 / 1024:.2f} MB) exceeds maximum allowed {MAX_IMAGE_SIZE_BYTES / 1024 / 1024:.0f} MB."
            )

        if filename:
            ext = Path(filename).suffix.lower()
            if ext and ext not in ALLOWED_EXTENSIONS:
                raise InvalidImageError(
                    f"Unsupported image extension '{ext}'. Supported formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
                )

        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            pil_img.verify()
        except Exception as exc:
            raise InvalidImageError(f"Corrupt or unreadable image data: {exc}") from exc

        # Re-open after verify() to get pixel dimensions and prepare RGB buffer
        pil_img = Image.open(io.BytesIO(image_bytes))
        width, height = pil_img.size
        if width <= 0 or height <= 0:
            raise InvalidImageError(f"Invalid image dimensions: {width}x{height}")

        return pil_img.convert("RGB"), width, height

    def detect_food_waste(
        self,
        image_bytes: bytes,
        filename: str = "",
        confidence_threshold: float = 0.25,
        imgsz: int = 640
    ) -> Dict[str, Any]:
        """Executes YOLO object detection and formats results."""
        # Validate input
        pil_image, orig_w, orig_h = self.validate_image_bytes(image_bytes, filename)

        # Ensure model is ready
        model = self.load_model()

        t_start = time.perf_counter()
        try:
            results = model.predict(
                source=pil_image,
                conf=confidence_threshold,
                imgsz=imgsz,
                verbose=False
            )
        except Exception as exc:
            raise RuntimeError(f"Model inference failed during prediction: {exc}") from exc

        t_elapsed_ms = (time.perf_counter() - t_start) * 1000.0

        detections = []
        if results and len(results) > 0:
            boxes = results[0].boxes
            model_names = getattr(model, "names", {})
            for box in boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]

                if isinstance(model_names, dict) and cls_id in model_names:
                    class_name = model_names[cls_id]
                else:
                    class_name = CANONICAL_CLASSES.get(cls_id, f"unknown_{cls_id}")

                detections.append({
                    "class_id": cls_id,
                    "class_name": class_name,
                    "confidence": round(conf, 4),
                    "bounding_box": {
                        "x1": round(xyxy[0], 2),
                        "y1": round(xyxy[1], 2),
                        "x2": round(xyxy[2], 2),
                        "y2": round(xyxy[3], 2)
                    }
                })

        return {
            "success": True,
            "model_version": self._model_version,
            "detections": detections,
            "inference_time_ms": round(t_elapsed_ms, 2),
            "total_detected": len(detections),
            "image_dimensions": {"width": orig_w, "height": orig_h}
        }

    def record_manual_correction(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves confirmation or human correction of AI classification for model retraining and audit."""
        from uuid import uuid4

        record = {
            "id": f"corr-{uuid4().hex[:10]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **record_data
        }

        with self._correction_lock:
            self._corrections_file.parent.mkdir(parents=True, exist_ok=True)
            existing_records = []
            if self._corrections_file.exists():
                try:
                    with open(self._corrections_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        existing_records = data.get("corrections", [])
                except Exception:
                    existing_records = []

            existing_records.append(record)

            temp_file = self._corrections_file.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump({"corrections": existing_records, "total": len(existing_records)}, f, indent=2)
            temp_file.replace(self._corrections_file)

        return record

    def get_corrections(self) -> List[Dict[str, Any]]:
        with self._correction_lock:
            if not self._corrections_file.exists():
                return []
            try:
                with open(self._corrections_file, "r", encoding="utf-8") as f:
                    return json.load(f).get("corrections", [])
            except Exception:
                return []


# Global singleton instance
food_detection_service = FoodDetectionService()
