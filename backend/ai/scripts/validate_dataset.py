#!/usr/bin/env python3
"""
Dataset Validation Script for Component 4: Food Waste Object Detection
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

Validates YOLO dataset integrity:
1. Image readability & corruption check
2. Missing annotation files
3. Invalid class IDs (must be in range 0..6)
4. Invalid bounding-box coordinates (normalized [0, 1])
5. Empty / corrupt images
6. Duplicate images across or within splits (SHA-256 hash)
7. Class distribution and imbalance analysis
8. Dataset split sizes (train/val/test)
"""

import os
import sys
import yaml
import hashlib
import argparse
import json
from pathlib import Path
from typing import Dict, Any, List, Set, Tuple
from PIL import Image

EXPECTED_CLASSES = {
    0: "rice",
    1: "kottu",
    2: "noodles",
    3: "chicken",
    4: "bread",
    5: "whole_mango",
    6: "mango_peel"
}

VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def compute_file_hash(filepath: Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def validate_yolo_dataset(
    dataset_dir: Path,
    data_yaml_path: Path = None,
    output_report_path: Path = None
) -> Dict[str, Any]:
    dataset_dir = dataset_dir.resolve()
    if data_yaml_path is None:
        data_yaml_path = dataset_dir / "data.yaml"

    # Dynamic class resolution: use data.yaml names if available, else EXPECTED_CLASSES
    active_classes = dict(EXPECTED_CLASSES)
    yaml_loaded = False
    yaml_data = {}

    if data_yaml_path.exists():
        try:
            with open(data_yaml_path, "r", encoding="utf-8") as f:
                yaml_data = yaml.safe_load(f) or {}
            yaml_loaded = True
            names_entry = yaml_data.get("names")
            if isinstance(names_entry, dict):
                active_classes = {int(k): str(v) for k, v in names_entry.items()}
            elif isinstance(names_entry, list):
                active_classes = {i: str(v) for i, v in enumerate(names_entry)}
        except Exception:
            yaml_loaded = False

    report: Dict[str, Any] = {
        "dataset_path": str(dataset_dir),
        "data_yaml_present": data_yaml_path.exists(),
        "total_images": 0,
        "total_labels": 0,
        "splits": {},
        "class_counts_by_split": {},
        "overall_class_counts": {name: 0 for name in active_classes.values()},
        "errors": [],
        "warnings": [],
        "duplicates": [],
        "is_valid": False,
        "is_empty": True,
        "status": "NOT_CHECKED"
    }

    # 1. Check data.yaml
    if not data_yaml_path.exists():
        report["errors"].append(f"data.yaml not found at: {data_yaml_path}")
    else:
        try:
            report["yaml_nc"] = yaml_data.get("nc")
            report["yaml_names"] = yaml_data.get("names")
            if yaml_data.get("nc") is not None and yaml_data.get("nc") != len(active_classes):
                report["warnings"].append(
                    f"data.yaml nc={yaml_data.get('nc')} does not match parsed class count {len(active_classes)}"
                )
        except Exception as exc:
            report["errors"].append(f"Failed to parse data.yaml: {exc}")

    # Track seen hashes to detect duplicates across splits
    seen_hashes: Dict[str, Path] = {}
    total_images_found = 0

    # 2. Iterate through splits: train, val, test
    for split in ["train", "val", "test"]:
        split_images_dir = dataset_dir / "images" / split
        split_labels_dir = dataset_dir / "labels" / split

        split_report = {
            "images_found": 0,
            "labels_found": 0,
            "corrupt_images": [],
            "missing_labels": [],
            "unannotated_background_images": [],
            "invalid_labels": [],
            "duplicate_images_in_split": []
        }
        report["class_counts_by_split"][split] = {name: 0 for name in active_classes.values()}

        if not split_images_dir.exists():
            report["warnings"].append(f"Directory missing: {split_images_dir}")
            report["splits"][split] = split_report
            continue

        image_files = [
            f for f in split_images_dir.iterdir()
            if f.is_file() and f.suffix.lower() in VALID_IMAGE_EXTENSIONS
        ]
        split_report["images_found"] = len(image_files)
        total_images_found += len(image_files)

        for img_path in image_files:
            # Check readability and corruption
            try:
                with Image.open(img_path) as img:
                    img.verify()
                # Re-open to read dimensions
                with Image.open(img_path) as img:
                    width, height = img.size
                    if width <= 0 or height <= 0:
                        split_report["corrupt_images"].append(f"{img_path.name}: Invalid dimensions {width}x{height}")
            except Exception as e:
                split_report["corrupt_images"].append(f"{img_path.name}: Corrupt image - {e}")
                report["errors"].append(f"Corrupt image in {split}: {img_path.name} ({e})")
                continue

            # Duplicate check
            try:
                img_hash = compute_file_hash(img_path)
                if img_hash in seen_hashes:
                    dup_info = {
                        "duplicate": str(img_path),
                        "original": str(seen_hashes[img_hash]),
                        "split": split
                    }
                    report["duplicates"].append(dup_info)
                    split_report["duplicate_images_in_split"].append(img_path.name)
                    report["warnings"].append(f"Duplicate image: {img_path.name} identical to {seen_hashes[img_hash]}")
                else:
                    seen_hashes[img_hash] = img_path
            except Exception as e:
                report["warnings"].append(f"Hash calculation failed for {img_path.name}: {e}")

            # Check matching label file
            label_path = split_labels_dir / f"{img_path.stem}.txt"
            if not label_path.exists():
                split_report["missing_labels"].append(img_path.name)
                # In YOLO, an image without a label file can be treated as background, but flag as warning
                split_report["unannotated_background_images"].append(img_path.name)
            else:
                try:
                    split_report["labels_found"] += 1
                    with open(label_path, "r", encoding="utf-8") as lf:
                        lines = [line.strip() for line in lf if line.strip()]

                    if not lines:
                        split_report["unannotated_background_images"].append(img_path.name)

                    for line_idx, line in enumerate(lines):
                        parts = line.split()
                        if len(parts) != 5:
                            split_report["invalid_labels"].append(
                                f"{label_path.name}:L{line_idx+1} expected 5 fields, got {len(parts)}"
                            )
                            report["errors"].append(f"Invalid label syntax in {label_path.name}: {line}")
                            continue

                        try:
                            cls_id = int(parts[0])
                            xc, yc, w, h = map(float, parts[1:])
                        except ValueError as ve:
                            split_report["invalid_labels"].append(f"{label_path.name}:L{line_idx+1} invalid float/int: {ve}")
                            report["errors"].append(f"Parse error in {label_path.name}: {ve}")
                            continue

                        # Check class ID
                        if cls_id not in active_classes:
                            split_report["invalid_labels"].append(
                                f"{label_path.name}:L{line_idx+1} class {cls_id} out of bounds (0..{len(active_classes)-1})"
                            )
                            report["errors"].append(
                                f"Invalid class ID {cls_id} in {label_path.name} (must be 0..{len(active_classes)-1})"
                            )
                        else:
                            cls_name = active_classes[cls_id]
                            report["class_counts_by_split"][split][cls_name] += 1
                            report["overall_class_counts"][cls_name] += 1

                        # Check bounding-box coordinates (must be normalized [0, 1] and positive)
                        if not (0.0 <= xc <= 1.0 and 0.0 <= yc <= 1.0):
                            split_report["invalid_labels"].append(
                                f"{label_path.name}:L{line_idx+1} center ({xc}, {yc}) out of range [0, 1]"
                            )
                            report["errors"].append(f"Bounding box center out of [0, 1] in {label_path.name}: {line}")
                        if not (0.0 < w <= 1.0 and 0.0 < h <= 1.0):
                            split_report["invalid_labels"].append(
                                f"{label_path.name}:L{line_idx+1} size ({w}, {h}) out of range (0, 1]"
                            )
                            report["errors"].append(f"Bounding box size out of (0, 1] in {label_path.name}: {line}")

                except Exception as exc:
                    split_report["invalid_labels"].append(f"{label_path.name}: Failed to read ({exc})")
                    report["errors"].append(f"Label read error {label_path.name}: {exc}")

        report["splits"][split] = split_report

    report["total_images"] = total_images_found
    report["is_empty"] = (total_images_found == 0)

    if report["is_empty"]:
        report["status"] = "EMPTY_DATASET_PENDING_IMPORT"
        report["is_valid"] = False
        report["warnings"].append(
            "Dataset directory contains 0 images. Please import annotated images into train/val/test splits."
        )
    elif len(report["errors"]) == 0:
        report["status"] = "VALID"
        report["is_valid"] = True
    else:
        report["status"] = "INVALID"
        report["is_valid"] = False

    # Save report
    if output_report_path:
        output_report_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_report_path, "w", encoding="utf-8") as rf:
            json.dump(report, rf, indent=2)

    return report


def main():
    parser = argparse.ArgumentParser(description="Validate YOLO Food Waste Dataset")
    parser.add_argument(
        "--dataset",
        type=str,
        default=str(Path(__file__).resolve().parents[1] / "datasets" / "food_waste"),
        help="Path to dataset root folder containing images/ and labels/"
    )
    parser.add_argument(
        "--report",
        type=str,
        default=str(Path(__file__).resolve().parents[1] / "results" / "dataset_validation_report.json"),
        help="Path to save validation JSON report"
    )
    args = parser.parse_args()

    dataset_path = Path(args.dataset)
    report_path = Path(args.report)

    print("=" * 70)
    print("  SLIIT IT4010 RESEARCH - COMPONENT 4: DATASET VALIDATION REPORT")
    print("=" * 70)
    print(f"Dataset Path : {dataset_path}")
    print(f"Classes (7)  : {', '.join(f'{k}:{v}' for k, v in EXPECTED_CLASSES.items())}")
    print("-" * 70)

    res = validate_yolo_dataset(dataset_path, output_report_path=report_path)

    print(f"Status       : {res['status']}")
    print(f"Total Images : {res['total_images']}")
    print(f"Total Errors : {len(res['errors'])}")
    print(f"Total Warns  : {len(res['warnings'])}")
    print(f"Duplicates   : {len(res['duplicates'])}")
    print("-" * 70)
    print("Split Summaries:")
    for split, info in res.get("splits", {}).items():
        print(f"  • [{split.upper()}]: {info.get('images_found', 0)} images, {info.get('labels_found', 0)} labels")
    print("-" * 70)
    print("Class Distribution:")
    for cls_name, count in res.get("overall_class_counts", {}).items():
        print(f"  • {cls_name:12s}: {count:4d} annotations")
    print("=" * 70)

    if res["errors"]:
        print("\nERRORS DETECTED:")
        for err in res["errors"][:10]:
            print(f"  [X] {err}")
        if len(res["errors"]) > 10:
            print(f"  ... and {len(res['errors']) - 10} more errors.")
    elif res["is_empty"]:
        print("\nNOTE: Dataset directory is currently empty.")
        print("Please download and unzip your Roboflow YOLOv8 dataset export into:")
        print(f"  {dataset_path}")
    else:
        print("\n[+] Dataset integrity successfully verified!")

    print(f"\nFull report written to: {report_path}")

    return 0 if res["is_valid"] or res["is_empty"] else 1


if __name__ == "__main__":
    sys.exit(main())
