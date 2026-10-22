#!/usr/bin/env python3
"""
YOLO Training Script for Component 4: Smart Waste Bin Food Waste Recognition
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

Trains lightweight Ultralytics YOLO model on the 7-class food waste dataset.
Supports:
- Configurable dataset path (data.yaml)
- Pretrained weights (yolo11n.pt / yolov8n.pt)
- Dynamic hardware acceleration (CUDA GPU with CPU fallback)
- Configurable hyperparameters (epochs, imgsz, batch, patience, seed)
- Experiment logging and best.pt artifact preservation
"""

import os
import sys
import json
import shutil
import argparse
from datetime import datetime
from pathlib import Path
import torch
from ultralytics import YOLO

# Add current scripts directory to path for validation imports
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from validate_dataset import validate_yolo_dataset, EXPECTED_CLASSES


def train_food_waste_yolo(
    data_yaml_path: Path,
    weights: str = "yolov8n.pt",
    epochs: int = 100,
    imgsz: int = 640,
    batch: int = 16,
    patience: int = 20,
    seed: int = 42,
    device: str = None,
    project_dir: Path = None,
    experiment_name: str = "food-waste-yolo-pilot-v1",
    models_dir: Path = None,
    results_dir: Path = None
) -> dict:
    data_yaml_path = data_yaml_path.resolve()
    dataset_root = data_yaml_path.parent
    if project_dir is None:
        project_dir = CURRENT_DIR.parent / "results" / "train_runs"
    if models_dir is None:
        models_dir = CURRENT_DIR.parent / "models"
    if results_dir is None:
        results_dir = CURRENT_DIR.parent / "results"

    project_dir.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(parents=True, exist_ok=True)
    results_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("  SLIIT IT4010 RESEARCH - COMPONENT 4: YOLO TRAINING PIPELINE")
    print("=" * 70)
    print(f"Date & Time    : {datetime.now().isoformat()}")
    print(f"Data Config    : {data_yaml_path}")
    print(f"Base Weights   : {weights}")
    print(f"Target Epochs  : {epochs} (Early Stopping Patience: {patience})")
    print(f"Image Size     : {imgsz}")
    print(f"Batch Size     : {batch}")
    print(f"Random Seed    : {seed}")

    # Auto-detect hardware device
    if device is None:
        if torch.cuda.is_available():
            device = "0"
            gpu_name = torch.cuda.get_device_name(0)
            print(f"Hardware Accel : NVIDIA GPU ({gpu_name}) via CUDA")
        else:
            device = "cpu"
            print("Hardware Accel : CPU fallback (CUDA not detected)")
    else:
        print(f"Hardware Accel : Specified device '{device}'")
    print("-" * 70)

    # 1. Dataset Pre-Flight Integrity Check
    print("[*] Performing pre-flight dataset validation...")
    val_res = validate_yolo_dataset(dataset_root, data_yaml_path=data_yaml_path)

    if val_res["is_empty"] or val_res["total_images"] == 0:
        error_msg = (
            "TRAINING BLOCKED: Dataset contains 0 images.\n"
            "Academic Research Integrity Notice:\n"
            "Model training cannot proceed without real annotated food waste images.\n"
            f"Please populate images and labels in: {dataset_root}\n"
            "You can use `python ai/scripts/import_roboflow_dataset.py --source <path_to_zip>`"
        )
        print(f"\n[!] {error_msg}")
        # Log experiment attempt as pending/blocked
        _log_experiment(
            results_dir=results_dir,
            experiment_id=experiment_name,
            status="BLOCKED_PENDING_DATASET",
            details={"reason": "0 images in dataset", "dataset_path": str(dataset_root)}
        )
        raise RuntimeError(error_msg)

    if not val_res["is_valid"]:
        error_msg = f"TRAINING BLOCKED: Dataset validation failed with {len(val_res['errors'])} errors."
        print(f"\n[!] {error_msg}")
        for err in val_res["errors"][:5]:
            print(f"    • {err}")
        _log_experiment(
            results_dir=results_dir,
            experiment_id=experiment_name,
            status="BLOCKED_INVALID_DATASET",
            details={"errors": val_res["errors"][:10]}
        )
        raise RuntimeError(error_msg)

    print(f"[+] Dataset verified: {val_res['total_images']} images ready across train/val/test splits.")
    print("-" * 70)

    # 2. Initialize Model
    print(f"[*] Initializing YOLO architecture from {weights}...")
    model = YOLO(weights)

    # 3. Execute Training
    print("[*] Launching training process...")
    train_results = model.train(
        data=str(data_yaml_path),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        patience=patience,
        seed=seed,
        device=device,
        project=str(project_dir),
        name=experiment_name,
        exist_ok=True,
        save=True,
        verbose=True
    )

    run_dir = project_dir / experiment_name
    best_pt_src = run_dir / "weights" / "best.pt"
    versioned_best_pt = models_dir / f"{experiment_name}_best.pt"
    target_best_pt = models_dir / "best.pt"

    if best_pt_src.exists():
        shutil.copy2(best_pt_src, versioned_best_pt)
        print(f"[+] Versioned weights saved to: {versioned_best_pt}")
        # Only copy to best.pt if best.pt does not exist, preserving any active deployed model
        if not target_best_pt.exists():
            shutil.copy2(best_pt_src, target_best_pt)
            print(f"[+] Initialized best.pt at: {target_best_pt}")
        else:
            print(f"[*] Preserving existing deployed best.pt at: {target_best_pt} (not overwritten automatically)")

    # 4. Record Experiment Metrics
    num_classes = len(val_res.get("yaml_names") or EXPECTED_CLASSES)
    experiment_record = {
        "experiment_id": experiment_name,
        "date": datetime.now().isoformat(),
        "status": "COMPLETED",
        "model_architecture": str(weights),
        "dataset_path": str(dataset_root),
        "total_images": val_res["total_images"],
        "num_classes": num_classes,
        "epochs": epochs,
        "batch_size": batch,
        "imgsz": imgsz,
        "device": str(device),
        "seed": seed,
        "versioned_weights": str(versioned_best_pt),
        "weights_saved_at": str(target_best_pt),
        "run_directory": str(run_dir)
    }
    _log_experiment(results_dir=results_dir, experiment_id=experiment_name, status="COMPLETED", details=experiment_record)

    print("=" * 70)
    print("  TRAINING RUN COMPLETED SUCCESSFULLY")
    print("=" * 70)
    return experiment_record


def _log_experiment(results_dir: Path, experiment_id: str, status: str, details: dict):
    experiments_file = results_dir / "experiments.json"
    experiments_data = {"experiments": []}
    if experiments_file.exists():
        try:
            with open(experiments_file, "r", encoding="utf-8") as f:
                experiments_data = json.load(f)
        except Exception:
            experiments_data = {"experiments": []}

    record = {
        "experiment_id": experiment_id,
        "timestamp": datetime.now().isoformat(),
        "status": status,
        **details
    }

    # Update existing or append
    existing_idx = next((i for i, exp in enumerate(experiments_data["experiments"]) if exp.get("experiment_id") == experiment_id), None)
    if existing_idx is not None:
        experiments_data["experiments"][existing_idx] = record
    else:
        experiments_data["experiments"].append(record)

    with open(experiments_file, "w", encoding="utf-8") as f:
        json.dump(experiments_data, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Train YOLO Food Waste Detection Model")
    parser.add_argument(
        "--data",
        type=str,
        default=str(CURRENT_DIR.parent / "datasets" / "food_waste" / "data.yaml"),
        help="Path to data.yaml"
    )
    parser.add_argument("--weights", type=str, default="yolov8n.pt", help="Pretrained model weights (e.g., yolov8n.pt)")
    parser.add_argument("--epochs", type=int, default=100, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution for training")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--patience", type=int, default=20, help="Early stopping patience")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--device", type=str, default=None, help="Device ('cpu', '0', etc.)")
    parser.add_argument("--name", type=str, default="food-waste-yolo-pilot-v1", help="Experiment name")

    args = parser.parse_args()

    try:
        train_food_waste_yolo(
            data_yaml_path=Path(args.data),
            weights=args.weights,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            patience=args.patience,
            seed=args.seed,
            device=args.device,
            experiment_name=args.name
        )
    except RuntimeError as re:
        print(f"\n[STOPPED] {re}")
        sys.exit(1)


if __name__ == "__main__":
    main()
