#!/usr/bin/env python3
"""
Model Evaluation Script for Component 4: Food Waste Detection
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

Evaluates trained YOLO weights on held-out test dataset:
- Precision, Recall, F1-Score
- mAP@0.5, mAP@0.5:0.95
- Per-class performance metrics
- Confusion matrix & PR curves
- Inference latency measurement (ms/image)
- Academic CSV/JSON export and target comparison
"""

import os
import sys
import time
import json
import csv
import argparse
from pathlib import Path
from datetime import datetime
import numpy as np

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from validate_dataset import EXPECTED_CLASSES

ENGINEERING_TARGETS = {
    "precision": 0.85,
    "recall": 0.80,
    "f1_score": 0.82,
    "map50": 0.85,
    "latency_seconds": 2.0
}


def evaluate_food_waste_model(
    model_path: Path,
    data_yaml_path: Path,
    split: str = "test",
    imgsz: int = 640,
    device: str = "cpu",
    output_dir: Path = None
) -> dict:
    model_path = model_path.resolve()
    data_yaml_path = data_yaml_path.resolve()
    if output_dir is None:
        output_dir = CURRENT_DIR.parent / "results" / "evaluations"
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("  SLIIT IT4010 RESEARCH - COMPONENT 4: MODEL EVALUATION SUITE")
    print("=" * 70)
    print(f"Model Weights  : {model_path}")
    print(f"Dataset Config : {data_yaml_path}")
    print(f"Dataset Split  : {split}")
    print(f"Image Size     : {imgsz}")
    print("-" * 70)

    # Pre-condition 1: Model weights must exist
    if not model_path.exists():
        msg = (
            f"EVALUATION BLOCKED: Trained model weights not found at: {model_path}\n"
            "Academic Research Integrity Notice:\n"
            "Evaluation cannot be performed because no trained model artifact exists.\n"
            "Please train the model using `python ai/scripts/train_model.py` once real annotated data is available."
        )
        print(f"[!] {msg}")
        return {"status": "BLOCKED_NO_WEIGHTS", "error": msg}

    # Pre-condition 2: Test split must contain images
    test_img_dir = data_yaml_path.parent / "images" / split
    if not test_img_dir.exists() or len([f for f in test_img_dir.iterdir() if f.is_file()]) == 0:
        msg = (
            f"EVALUATION BLOCKED: Held-out {split} dataset contains 0 images ({test_img_dir}).\n"
            "Cannot evaluate model accuracy without a verified test split."
        )
        print(f"[!] {msg}")
        return {"status": "BLOCKED_NO_TEST_DATA", "error": msg}

    from ultralytics import YOLO

    print(f"[*] Loading model from {model_path.name}...")
    model = YOLO(str(model_path))

    # Measure latency over sample images
    test_images = [f for f in test_img_dir.iterdir() if f.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]]
    latencies = []
    print(f"[*] Benchmarking inference latency over {len(test_images)} test samples...")
    for img_file in test_images[:min(30, len(test_images))]:
        t0 = time.perf_counter()
        _ = model.predict(source=str(img_file), imgsz=imgsz, device=device, verbose=False)
        latencies.append((time.perf_counter() - t0) * 1000.0)

    avg_latency_ms = float(np.mean(latencies)) if latencies else 0.0

    print(f"[*] Running official validation against {split} split...")
    eval_results = model.val(
        data=str(data_yaml_path),
        split=split,
        imgsz=imgsz,
        device=device,
        project=str(output_dir),
        name=f"eval_{split}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        save_json=True
    )

    metrics = eval_results.box
    precision = float(metrics.mp)
    recall = float(metrics.mr)
    map50 = float(metrics.map50)
    map50_95 = float(metrics.map)
    f1_score = float(2 * (precision * recall) / (precision + recall + 1e-16))

    # Per-class metrics safely indexed via ap_class_index
    per_class_results = []
    class_names = eval_results.names
    ap_class_index = list(metrics.ap_class_index) if hasattr(metrics, "ap_class_index") else []
    cid_to_metric_idx = {int(cid): idx for idx, cid in enumerate(ap_class_index)}

    for cid in sorted(class_names.keys()):
        c_name = class_names[cid]
        if cid in cid_to_metric_idx:
            idx = cid_to_metric_idx[cid]
            c_p = float(metrics.p[idx]) if hasattr(metrics, "p") and len(metrics.p) > idx else 0.0
            c_r = float(metrics.r[idx]) if hasattr(metrics, "r") and len(metrics.r) > idx else 0.0
            c_map50 = float(metrics.ap50[idx]) if hasattr(metrics, "ap50") and len(metrics.ap50) > idx else 0.0
            c_map50_95 = float(metrics.ap[idx]) if hasattr(metrics, "ap") and len(metrics.ap) > idx else 0.0
            c_f1 = float(2 * (c_p * c_r) / (c_p + c_r + 1e-16))
            status_note = "EVALUATED"
        else:
            c_p, c_r, c_f1, c_map50, c_map50_95 = 0.0, 0.0, 0.0, 0.0, 0.0
            status_note = "UNASSESSED (0 evaluation samples in split - isolated to Train to eliminate leakage)"

        per_class_results.append({
            "class_id": cid,
            "class_name": c_name,
            "precision": round(c_p, 4),
            "recall": round(c_r, 4),
            "f1_score": round(c_f1, 4),
            "map50": round(c_map50, 4),
            "map50_95": round(c_map50_95, 4),
            "status": status_note
        })

    summary = {
        "status": "COMPLETED",
        "timestamp": datetime.now().isoformat(),
        "model_file": str(model_path),
        "split": split,
        "test_images_count": len(test_images),
        "overall_metrics": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1_score, 4),
            "map50": round(map50, 4),
            "map50_95": round(map50_95, 4),
            "avg_latency_ms": round(avg_latency_ms, 2)
        },
        "target_comparison": {
            "precision_met": precision >= ENGINEERING_TARGETS["precision"],
            "recall_met": recall >= ENGINEERING_TARGETS["recall"],
            "f1_score_met": f1_score >= ENGINEERING_TARGETS["f1_score"],
            "map50_met": map50 >= ENGINEERING_TARGETS["map50"],
            "latency_met": (avg_latency_ms / 1000.0) <= ENGINEERING_TARGETS["latency_seconds"]
        },
        "per_class_metrics": per_class_results
    }

    # Export to JSON
    json_path = output_dir / "evaluation_report.json"
    with open(json_path, "w", encoding="utf-8") as jf:
        json.dump(summary, jf, indent=2)

    # Export to CSV
    csv_path = output_dir / "evaluation_metrics.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as cf:
        writer = csv.writer(cf)
        writer.writerow(["Class ID", "Class Name", "Precision", "Recall", "F1-Score", "mAP@0.5", "mAP@0.5:0.95", "Status"])
        for pcr in per_class_results:
            writer.writerow([pcr["class_id"], pcr["class_name"], pcr["precision"], pcr["recall"], pcr["f1_score"], pcr["map50"], pcr["map50_95"], pcr["status"]])
        writer.writerow([])
        writer.writerow(["Overall", "ALL_CLASSES", summary["overall_metrics"]["precision"], summary["overall_metrics"]["recall"], summary["overall_metrics"]["f1_score"], summary["overall_metrics"]["map50"], summary["overall_metrics"]["map50_95"], "OVERALL"])

    print("-" * 70)
    print("EVALUATION RESULTS:")
    print(f"  • Precision (P)    : {summary['overall_metrics']['precision']:.2%} (Target: >=85%)")
    print(f"  • Recall (R)       : {summary['overall_metrics']['recall']:.2%} (Target: >=80%)")
    print(f"  • F1-Score         : {summary['overall_metrics']['f1_score']:.2%} (Target: >=82%)")
    print(f"  • mAP@0.5          : {summary['overall_metrics']['map50']:.2%} (Target: >=85%)")
    print(f"  • mAP@0.5:0.95     : {summary['overall_metrics']['map50_95']:.2%}")
    print(f"  • Latency (ms)     : {summary['overall_metrics']['avg_latency_ms']} ms/image (Target: <=2000 ms)")
    print("-" * 70)
    print("PER-CLASS EVALUATION BREAKDOWN:")
    for pcr in per_class_results:
        if "UNASSESSED" in pcr["status"]:
            print(f"  • {pcr['class_name']:12s} (ID {pcr['class_id']}): UNASSESSED (0 evaluation samples in split)")
        else:
            print(f"  • {pcr['class_name']:12s} (ID {pcr['class_id']}): P={pcr['precision']:.2%}, R={pcr['recall']:.2%}, mAP50={pcr['map50']:.2%}, mAP50-95={pcr['map50_95']:.2%}")
    print("-" * 70)
    print(f"Reports saved to:")
    print(f"  JSON : {json_path}")
    print(f"  CSV  : {csv_path}")
    print("=" * 70)

    return summary


def main():
    parser = argparse.ArgumentParser(description="Evaluate YOLO Food Waste Detection Model")
    parser.add_argument(
        "--model",
        type=str,
        default=str(CURRENT_DIR.parent / "models" / "best.pt"),
        help="Path to trained best.pt weights"
    )
    parser.add_argument(
        "--data",
        type=str,
        default=str(CURRENT_DIR.parent / "datasets" / "food_waste" / "data.yaml"),
        help="Path to data.yaml"
    )
    parser.add_argument("--split", type=str, default="test", help="Split to evaluate on ('test' or 'val')")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    parser.add_argument("--device", type=str, default="cpu", help="Device ('cpu' or '0')")
    parser.add_argument("--output", type=str, default=None, help="Directory to save evaluation reports and plots")

    args = parser.parse_args()
    evaluate_food_waste_model(
        model_path=Path(args.model),
        data_yaml_path=Path(args.data),
        split=args.split,
        imgsz=args.imgsz,
        device=args.device,
        output_dir=Path(args.output) if args.output else None
    )


if __name__ == "__main__":
    main()
