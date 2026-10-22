#!/usr/bin/env python3
"""
Roboflow Dataset Import Script for Component 4: Smart Waste Bin
SLIIT IT4010 Research Project 2026

Imports a Roboflow YOLOv8 exported dataset (zip file or directory),
maps class IDs to the canonical 7 research classes:
  0: rice
  1: kottu
  2: noodles
  3: chicken
  4: bread
  5: whole_mango
  6: mango_peel

And places the organized splits into datasets/food_waste/
"""

import os
import sys
import shutil
import zipfile
import argparse
import yaml
from pathlib import Path

CANONICAL_CLASSES = {
    0: "rice",
    1: "kottu",
    2: "noodles",
    3: "chicken",
    4: "bread",
    5: "whole_mango",
    6: "mango_peel"
}

NAME_TO_CANONICAL_ID = {name.lower().replace(" ", "_"): cid for cid, name in CANONICAL_CLASSES.items()}
# Add common synonyms/aliases
NAME_TO_CANONICAL_ID.update({
    "cooked_rice": 0,
    "white_rice": 0,
    "roti_kottu": 1,
    "fried_noodles": 2,
    "cooked_noodles": 2,
    "chicken_meat": 3,
    "chicken_bone": 3,
    "bread_slice": 4,
    "white_bread": 4,
    "mango": 5,
    "ripe_mango": 5,
    "peel": 6,
    "mango_skin": 6,
})


def import_roboflow_data(source_path: Path, target_dir: Path) -> bool:
    source_path = source_path.resolve()
    target_dir = target_dir.resolve()
    temp_dir = target_dir / "_temp_extract"

    print(f"[*] Importing Roboflow dataset from: {source_path}")
    print(f"[*] Destination dataset folder    : {target_dir}")

    extracted_dir = source_path
    if source_path.is_file() and source_path.suffix.lower() == ".zip":
        print(f"[*] Extracting archive {source_path.name}...")
        temp_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(source_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)
        extracted_dir = temp_dir

    # Find data.yaml in source
    source_yaml = None
    for candidate in [extracted_dir / "data.yaml", extracted_dir / "dataset.yaml"]:
        if candidate.exists():
            source_yaml = candidate
            break

    source_class_mapping = {}
    if source_yaml and source_yaml.exists():
        with open(source_yaml, "r", encoding="utf-8") as f:
            yaml_content = yaml.safe_load(f)
        names = yaml_content.get("names", [])
        if isinstance(names, list):
            source_names = {idx: name for idx, name in enumerate(names)}
        elif isinstance(names, dict):
            source_names = {int(k): v for k, v in names.items()}
        else:
            source_names = {}

        print(f"[+] Found source classes ({len(source_names)}): {source_names}")
        for src_id, src_name in source_names.items():
            norm_name = str(src_name).lower().strip().replace(" ", "_").replace("-", "_")
            if norm_name in NAME_TO_CANONICAL_ID:
                source_class_mapping[src_id] = NAME_TO_CANONICAL_ID[norm_name]
                print(f"    • Mapped '{src_name}' (ID {src_id}) -> canonical '{CANONICAL_CLASSES[source_class_mapping[src_id]]}' (ID {source_class_mapping[src_id]})")
            else:
                print(f"    [!] Warning: Unknown class '{src_name}' (ID {src_id}), keeping as ID {src_id} if < 7")
                if src_id < 7:
                    source_class_mapping[src_id] = src_id

    # Copy images and rewrite labels if needed
    for split in ["train", "valid", "val", "test"]:
        src_split_name = split
        target_split_name = "val" if split == "valid" else split

        # Check various Roboflow folder layout patterns
        candidate_img_dirs = [
            extracted_dir / src_split_name / "images",
            extracted_dir / src_split_name,
            extracted_dir / "images" / src_split_name
        ]
        candidate_lbl_dirs = [
            extracted_dir / src_split_name / "labels",
            extracted_dir / "labels" / src_split_name
        ]

        src_imgs = next((d for d in candidate_img_dirs if d.exists() and any(d.glob("*.*"))), None)
        src_lbls = next((d for d in candidate_lbl_dirs if d.exists()), None)

        if not src_imgs:
            continue

        tgt_img_dir = target_dir / "images" / target_split_name
        tgt_lbl_dir = target_dir / "labels" / target_split_name
        tgt_img_dir.mkdir(parents=True, exist_ok=True)
        tgt_lbl_dir.mkdir(parents=True, exist_ok=True)

        copied_count = 0
        for img_file in src_imgs.iterdir():
            if img_file.is_file() and img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".bmp", ".webp"]:
                shutil.copy2(img_file, tgt_img_dir / img_file.name)
                copied_count += 1

                # Corresponding label
                if src_lbls:
                    lbl_file = src_lbls / f"{img_file.stem}.txt"
                    if lbl_file.exists():
                        # Rewrite label if source_class_mapping has changes
                        with open(lbl_file, "r", encoding="utf-8") as lf:
                            lines = lf.readlines()
                        rewritten = []
                        for line in lines:
                            parts = line.strip().split()
                            if len(parts) == 5:
                                cid = int(parts[0])
                                new_cid = source_class_mapping.get(cid, cid)
                                rewritten.append(f"{new_cid} {parts[1]} {parts[2]} {parts[3]} {parts[4]}\n")
                        with open(tgt_lbl_dir / f"{img_file.stem}.txt", "w", encoding="utf-8") as tf:
                            tf.writelines(rewritten)

        print(f"[+] Imported {copied_count} images into {target_split_name} split.")

    # Cleanup temp
    if temp_dir.exists():
        shutil.rmtree(temp_dir, ignore_errors=True)

    print("[*] Dataset import completed successfully.")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Roboflow YOLOv8 dataset")
    parser.add_argument("--source", type=str, required=True, help="Path to Roboflow .zip or extracted folder")
    parser.add_argument(
        "--target",
        type=str,
        default=str(Path(__file__).resolve().parents[1] / "datasets" / "food_waste"),
        help="Target datasets/food_waste directory"
    )
    args = parser.parse_args()
    import_roboflow_data(Path(args.source), Path(args.target))
