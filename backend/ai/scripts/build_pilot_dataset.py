#!/usr/bin/env python3
"""
Build Pilot Dataset for YOLO Training
SLIIT IT4010 Research Project 2026 - Component 4

1. Verifies all 130 approved images and their annotations.
2. Implements the leak-free, sequence-grouped 70/20/10 split.
3. Exports versioned YOLO dataset to datasets/food_waste_pilot_v1/
4. Saves SPLIT_MANIFEST_PILOT.csv and data.yaml
"""

import sys
import json
import shutil
import csv
from collections import defaultdict, Counter
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BACKEND_DIR / "ai" / "datasets"
TARGET_DATASET_DIR = DATASETS_DIR / "food_waste_pilot_v1"

# 7 Active Research Classes
ACTIVE_CLASSES = [
    "rice",          # 0
    "kottu",         # 1
    "noodles",       # 2
    "chicken",       # 3
    "whole_mango",   # 4
    "mango_flesh",   # 5
    "mango_peel"     # 6
]

CLASS_TO_ID = {cname: idx for idx, cname in enumerate(ACTIVE_CLASSES)}

# Load Roboflow detailed metadata
with open(BACKEND_DIR / "ai" / "scripts" / "roboflow_images_detailed.json", "r", encoding="utf-8") as f:
    all_rf_images = json.load(f)

# Exclude bread (unannotated)
approved_images = [img for img in all_rf_images if img.get("annotation") and img["annotation"].get("boxes")]
rf_map = {img["name"]: img for img in approved_images}

print(f"[*] Loaded {len(approved_images)} approved images from Roboflow metadata.")

# Index all local image paths
local_images = {}
for p in DATASETS_DIR.rglob("*.*"):
    if p.suffix.lower() in (".jpg", ".jpeg", ".png"):
        # Store in priority order (staging first)
        if p.name not in local_images or "staging_open_images" in str(p):
            local_images[p.name] = p

print(f"[*] Indexed {len(local_images)} local image files on disk.")

# Split Definitions
SPLIT_ASSIGNMENTS = {}

# 1. Chicken: 20 images -> All 20 to Train
for i in range(1, 21):
    SPLIT_ASSIGNMENTS[f"chicken_plate_{i:03d}.jpg"] = "train"

# 2. Mango Peel: 6 images -> All 6 to Train
for fn in ["mango_peel_wm_001.jpg", "mango_peel_wm_002.jpg", "mango_peel_add_002.jpg",
           "mango_peel_add_003.jpg", "mango_peel_add_004.jpg", "mango_peel_add_005.jpg"]:
    SPLIT_ASSIGNMENTS[fn] = "train"

# 3. Mango Flesh: 25 images
# Bulacan 775Cuisine sequence (flesh 005, 017, 018) -> Train
# Bulacan 0526Cuisine sequence (flesh 002, 003, 004, 012, 013) -> Train
# Bulacan 0082Cuisine sequence (flesh 011, 024) -> Train
# Himsagar sequence (flesh 001, 020) -> Train
# Suchitra kumari (flesh 008) -> Train
# Spiced & Spongy defect & leaves (flesh 022, 023, 025) -> Train
flesh_train = [
    "mango_flesh_add_001.jpg", "mango_flesh_add_002.jpg", "mango_flesh_add_003.jpg",
    "mango_flesh_add_004.jpg", "mango_flesh_add_005.jpg", "mango_flesh_add_008.jpg",
    "mango_flesh_add_011.jpg", "mango_flesh_add_012.jpg", "mango_flesh_add_013.jpg",
    "mango_flesh_add_017.jpg", "mango_flesh_add_018.jpg", "mango_flesh_add_020.jpg",
    "mango_flesh_add_022.jpg", "mango_flesh_add_023.jpg", "mango_flesh_add_024.jpg",
    "mango_flesh_add_025.jpg"
]
for fn in flesh_train:
    SPLIT_ASSIGNMENTS[fn] = "train"

# Independent flesh -> Val (5 images)
flesh_val = [
    "mango_flesh_add_006.jpg",  # Transversal cross section cut
    "mango_flesh_add_007.jpg",  # Mango blossom on stick street food
    "mango_flesh_add_010.jpg",  # Dasheri sliced on white plate
    "mango_flesh_add_014.jpg",  # Sliced halves on banana leaf
    "mango_flesh_add_016.jpg"   # Halves on styrofoam tray
]
for fn in flesh_val:
    SPLIT_ASSIGNMENTS[fn] = "val"

# Independent flesh -> Test (4 images)
flesh_test = [
    "mango_flesh_add_009.jpg",  # Sliced mango hedgehog
    "mango_flesh_add_015.jpg",  # Mango half in hand
    "mango_flesh_add_019.jpg",  # Cut mangoes on plate 2 (petal pattern)
    "mango_flesh_add_021.jpg"   # Cut pieces at beach stall
]
for fn in flesh_test:
    SPLIT_ASSIGNMENTS[fn] = "test"

# 4. Kottu: 13 images
# Thamizhpparithi Maari sequence (007, 019) -> Train
# Standalone train (001, 002, 003, 004, 009, 011, 016) -> Train
kottu_train = [
    "kottu_wm_001.jpg", "kottu_wm_002.jpg", "kottu_wm_003.jpg", "kottu_wm_004.jpg",
    "kottu_wm_007.jpg", "kottu_wm_009.jpg", "kottu_wm_011.jpg", "kottu_wm_016.jpg",
    "kottu_wm_019.jpg"
]
for fn in kottu_train:
    SPLIT_ASSIGNMENTS[fn] = "train"

kottu_val = ["kottu_wm_006.jpg", "kottu_wm_008.jpg"]
for fn in kottu_val:
    SPLIT_ASSIGNMENTS[fn] = "val"

kottu_test = ["kottu_wm_005.jpg", "kottu_wm_020.jpg"]
for fn in kottu_test:
    SPLIT_ASSIGNMENTS[fn] = "test"

# 5. Noodles: 20 images (noodles_rep_002 to 021)
# ORWU 025 Sheung Wan sequence (006, 007, 008, 009) -> All to Train
# Standalone train (005, 010, 011, 012, 013, 014, 015, 016, 021) -> Train
noodles_train = [
    "noodles_rep_005.jpg", "noodles_rep_006.jpg", "noodles_rep_007.jpg",
    "noodles_rep_008.jpg", "noodles_rep_009.jpg", "noodles_rep_010.jpg", "noodles_rep_011.jpg",
    "noodles_rep_012.jpg", "noodles_rep_013.jpg", "noodles_rep_014.jpg", "noodles_rep_015.jpg",
    "noodles_rep_016.jpg", "noodles_rep_021.jpg"
]
for fn in noodles_train:
    SPLIT_ASSIGNMENTS[fn] = "train"

# PattayaPatrol DFC (017, 018) & HaJunkiyada Liat (019, 020) -> Val (4 images)
noodles_val = ["noodles_rep_017.jpg", "noodles_rep_018.jpg", "noodles_rep_019.jpg", "noodles_rep_020.jpg"]
for fn in noodles_val:
    SPLIT_ASSIGNMENTS[fn] = "val"

# Independent standalone -> Test (3 images)
noodles_test = ["noodles_rep_002.jpg", "noodles_rep_003.jpg", "noodles_rep_004.jpg"]
for fn in noodles_test:
    SPLIT_ASSIGNMENTS[fn] = "test"

# 6. Rice: 27 images
# HaJunkiyada Liat Portal sequence (008, 009, 010, 011, 023, 024, 025) -> Train (7)
# Alpha sequence (017, 019, 021, 026) -> Train (4)
# Standalone train (001, 004, 005, 007, 012, 013, 014, 016) -> Train (8)
rice_train = [
    "rice_rep_001.jpg", "rice_rep_004.jpg", "rice_rep_005.jpg", "rice_rep_007.jpg",
    "rice_rep_008.jpg", "rice_rep_009.jpg", "rice_rep_010.jpg", "rice_rep_011.jpg",
    "rice_rep_012.jpg", "rice_rep_013.jpg", "rice_rep_014.jpg", "rice_rep_016.jpg",
    "rice_rep_017.jpg", "rice_rep_019.jpg", "rice_rep_021.jpg", "rice_rep_023.jpg",
    "rice_rep_024.jpg", "rice_rep_025.jpg", "rice_rep_026.jpg"
]
for fn in rice_train:
    SPLIT_ASSIGNMENTS[fn] = "train"

# Independent standalone -> Val (4 images)
rice_val = ["rice_rep_002.jpg", "rice_rep_018.jpg", "rice_rep_022.jpg", "rice_rep_027.jpg"]
for fn in rice_val:
    SPLIT_ASSIGNMENTS[fn] = "val"

# Independent standalone -> Test (4 images)
rice_test = ["rice_rep_003.jpg", "rice_rep_006.jpg", "rice_rep_015.jpg", "rice_rep_020.jpg"]
for fn in rice_test:
    SPLIT_ASSIGNMENTS[fn] = "test"

# 7. Whole Mango: 19 images
whole_mango_train = [
    "whole_mango_wm_002.jpg", "whole_mango_wm_003.jpg", "whole_mango_wm_004.jpg",
    "whole_mango_wm_005.jpg", "whole_mango_wm_006.jpg", "whole_mango_wm_008.jpg",
    "whole_mango_wm_009.jpg", "whole_mango_wm_010.jpg", "whole_mango_wm_012.jpg",
    "whole_mango_wm_014.jpg", "whole_mango_wm_015.jpg", "whole_mango_wm_016.jpg",
    "whole_mango_wm_020.jpg"
]
for fn in whole_mango_train:
    SPLIT_ASSIGNMENTS[fn] = "train"

whole_mango_val = ["whole_mango_wm_013.jpg", "whole_mango_wm_017.jpg", "whole_mango_wm_018.jpg", "whole_mango_wm_019.jpg"]
for fn in whole_mango_val:
    SPLIT_ASSIGNMENTS[fn] = "val"

whole_mango_test = ["whole_mango_wm_001.jpg", "whole_mango_wm_011.jpg"]
for fn in whole_mango_test:
    SPLIT_ASSIGNMENTS[fn] = "test"

# Verify all approved images are assigned
unassigned = [fn for fn in rf_map if fn not in SPLIT_ASSIGNMENTS]
if unassigned:
    raise ValueError(f"Unassigned images found: {unassigned}")

print("\n" + "=" * 70)
print("  SPLIT ASSIGNMENT SUMMARY")
print("=" * 70)
split_counts = Counter(SPLIT_ASSIGNMENTS.values())
for s in ["train", "val", "test"]:
    cnt = split_counts[s]
    pct = (cnt / len(approved_images)) * 100
    print(f"  • {s.upper():5s} : {cnt:3d} images ({pct:5.1f}%)")
print(f"  • TOTAL : {len(approved_images):3d} images (100.0%)")
print("=" * 70)

# Check Class Coverage per Split
print("\nClass Coverage per Split:")
split_class_counts = defaultdict(Counter)
for fn, s in SPLIT_ASSIGNMENTS.items():
    img = rf_map[fn]
    for b in img["annotation"]["boxes"]:
        split_class_counts[s][b["label"]] += 1

header = f"{'Class':15s} | {'Train':7s} | {'Val':7s} | {'Test':7s} | {'Total Boxes':11s}"
print(header)
print("-" * len(header))
for cls in ACTIVE_CLASSES:
    tr_b = split_class_counts["train"][cls]
    va_b = split_class_counts["val"][cls]
    te_b = split_class_counts["test"][cls]
    tot_b = tr_b + va_b + te_b
    print(f"{cls:15s} | {tr_b:7d} | {va_b:7d} | {te_b:7d} | {tot_b:11d}")
print("-" * len(header))

# Create Directory Structure
if TARGET_DATASET_DIR.exists():
    shutil.rmtree(TARGET_DATASET_DIR)

for split in ["train", "val", "test"]:
    (TARGET_DATASET_DIR / "images" / split).mkdir(parents=True, exist_ok=True)
    (TARGET_DATASET_DIR / "labels" / split).mkdir(parents=True, exist_ok=True)

# Export Images and YOLO Labels
split_manifest_rows = []

for fn, s in SPLIT_ASSIGNMENTS.items():
    img_meta = rf_map[fn]
    src_img = local_images[fn]
    dst_img = TARGET_DATASET_DIR / "images" / s / fn
    shutil.copy2(src_img, dst_img)

    # Get image dimensions from PIL to ensure exact correspondence
    with Image.open(dst_img) as im:
        img_w, img_h = im.size

    # Write YOLO format label file (.txt)
    dst_label = TARGET_DATASET_DIR / "labels" / s / (Path(fn).stem + ".txt")
    boxes = img_meta["annotation"]["boxes"]

    yolo_lines = []
    box_summary = []
    for b in boxes:
        lbl = b["label"]
        if lbl not in CLASS_TO_ID:
            continue
        cid = CLASS_TO_ID[lbl]

        # Roboflow coordinates are in pixels relative to original image size
        bx = float(b["x"])
        by = float(b["y"])
        bw = float(b["width"])
        bh = float(b["height"])

        # Normalize to [0, 1]
        x_norm = max(0.0, min(1.0, bx / img_w))
        y_norm = max(0.0, min(1.0, by / img_h))
        w_norm = max(0.0, min(1.0, bw / img_w))
        h_norm = max(0.0, min(1.0, bh / img_h))

        yolo_lines.append(f"{cid} {x_norm:.6f} {y_norm:.6f} {w_norm:.6f} {h_norm:.6f}")
        box_summary.append(f"{lbl}(ID:{cid})")

    with open(dst_label, "w", encoding="utf-8") as lf:
        lf.write("\n".join(yolo_lines) + "\n" if yolo_lines else "")

    split_manifest_rows.append({
        "filename": fn,
        "roboflow_id": img_meta["id"],
        "split": s,
        "width": img_w,
        "height": img_h,
        "box_count": len(yolo_lines),
        "classes": "|".join(sorted(list(set(box_summary)))),
        "local_image_path": str(dst_img.relative_to(BACKEND_DIR)).replace("\\", "/"),
        "local_label_path": str(dst_label.relative_to(BACKEND_DIR)).replace("\\", "/")
    })

# Write Split Manifest CSV
split_manifest_path = DATASETS_DIR / "SPLIT_MANIFEST_PILOT.csv"
with open(split_manifest_path, "w", encoding="utf-8", newline="") as sf:
    fieldnames = [
        "filename", "roboflow_id", "split", "width", "height",
        "box_count", "classes", "local_image_path", "local_label_path"
    ]
    writer = csv.DictWriter(sf, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(sorted(split_manifest_rows, key=lambda x: (x["split"], x["filename"])))

print(f"\n[+] Wrote split manifest: {split_manifest_path} ({len(split_manifest_rows)} rows)")

# Write data.yaml
yaml_content = f"""# SLIIT IT4010 Research Project J26-IT-333
# Component 4: Smart Waste Bin - Food Recognition YOLO Pilot Configuration
# Versioned Pilot Dataset v1 (7 Active Classes, Zero Bread)
# Generated: 2026-10-21

path: {str(TARGET_DATASET_DIR.resolve()).replace('\\\\', '/')}
train: images/train
val: images/val
test: images/test

nc: {len(ACTIVE_CLASSES)}

names:
"""
for idx, cname in enumerate(ACTIVE_CLASSES):
    yaml_content += f"  {idx}: {cname}\n"

data_yaml_path = TARGET_DATASET_DIR / "data.yaml"
with open(data_yaml_path, "w", encoding="utf-8") as yf:
    yf.write(yaml_content)

print(f"[+] Wrote dataset configuration: {data_yaml_path}")
print(f"[+] Exported 130 images and {sum(r['box_count'] for r in split_manifest_rows)} annotations to {TARGET_DATASET_DIR}")
