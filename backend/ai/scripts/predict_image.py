#!/usr/bin/env python3
"""
CLI Image Prediction Script for Component 4: Smart Waste Bin
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

Tests YOLO food waste recognition on a local image:
- Validates image file
- Checks trained weights availability
- Performs multi-object detection
- Displays bounding boxes, confidence scores, and inference time
"""

import sys
import argparse
from pathlib import Path

# Add backend directory to path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.food_detection_service import (
    food_detection_service,
    ModelNotAvailableError,
    InvalidImageError,
    CANONICAL_CLASSES
)


def main():
    parser = argparse.ArgumentParser(description="Run YOLO Food Waste Detection on an Image")
    parser.add_argument("--image", type=str, required=True, help="Path to input image file")
    parser.add_argument("--weights", type=str, default=None, help="Optional custom weights path")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (0.0 - 1.0)")
    parser.add_argument("--imgsz", type=int, default=640, help="Inference resolution")

    args = parser.parse_args()
    image_path = Path(args.image).resolve()

    print("=" * 70)
    print("  SLIIT IT4010 RESEARCH - COMPONENT 4: FOOD WASTE RECOGNITION")
    print("=" * 70)
    print(f"Target Image   : {image_path}")
    print(f"Confidence     : {args.conf}")

    if not image_path.exists():
        print(f"[!] Error: Image file not found: {image_path}")
        sys.exit(1)

    if args.weights:
        import os
        os.environ["FOOD_WASTE_MODEL_PATH"] = str(Path(args.weights).resolve())

    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        results = food_detection_service.detect_food_waste(
            image_bytes=image_bytes,
            filename=image_path.name,
            confidence_threshold=args.conf,
            imgsz=args.imgsz
        )

        print("-" * 70)
        print(f"Model Version  : {results['model_version']}")
        print(f"Inference Time : {results['inference_time_ms']} ms")
        print(f"Total Detected : {results['total_detected']} food item(s)")
        print("-" * 70)

        if results["detections"]:
            print("DETECTIONS:")
            for idx, det in enumerate(results["detections"], 1):
                bb = det["bounding_box"]
                print(
                    f"  [{idx}] Class {det['class_id']}: {det['class_name'].upper():12s} "
                    f"| Conf: {det['confidence']:.2%} "
                    f"| Box: ({bb['x1']}, {bb['y1']}) -> ({bb['x2']}, {bb['y2']})"
                )
        else:
            print("No food waste items recognized above the confidence threshold.")
        print("=" * 70)

    except ModelNotAvailableError as mne:
        print(f"\n[!] MODEL UNAVAILABLE ERROR:\n{mne}")
        sys.exit(2)
    except InvalidImageError as iie:
        print(f"\n[!] INVALID IMAGE ERROR:\n{iie}")
        sys.exit(3)
    except Exception as exc:
        print(f"\n[!] INFERENCE ERROR: {exc}")
        sys.exit(4)


if __name__ == "__main__":
    main()
