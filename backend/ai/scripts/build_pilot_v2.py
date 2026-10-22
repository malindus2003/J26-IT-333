#!/usr/bin/env python3
"""
Build Pilot Dataset v2 for YOLO Training (Component 4)
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

Builds clean food_waste_pilot_v2:
- Exactly 127 verified approved images
- Strictly excludes mango_flesh_add_022.jpg, mango_flesh_add_021.jpg, mango_flesh_add_006.jpg
- Strictly excludes deleted mango_peel_add_001.jpg and paused bread images
- Preserves 95 Train, 18 Validation, 14 Test split
- Generates EXCLUSION_RECORD_PILOT_V2.csv and SPLIT_MANIFEST_PILOT_V2.csv
"""

import sys
import json
import shutil
import csv
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path("d:/SLIIT/Research/Research-/backend")
DATASETS_DIR = BACKEND_DIR / "ai" / "datasets"
V1_DIR = DATASETS_DIR / "food_waste_pilot_v1"
TARGET_DIR = DATASETS_DIR / "food_waste_pilot_v2"

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

# 1. Clean and prepare target directory
if TARGET_DIR.exists():
    shutil.rmtree(TARGET_DIR)
for split in ["train", "val", "test"]:
    (TARGET_DIR / "images" / split).mkdir(parents=True, exist_ok=True)
    (TARGET_DIR / "labels" / split).mkdir(parents=True, exist_ok=True)

# 2. Excluded files definition
EXCLUDED_FILES = {
    "mango_flesh_add_022.jpg": {
        "roboflow_id": "Y9zKWgkTBs5fE5ScUpR1",
        "reason": "Rejected during Roboflow review (unapproved non-mango flesh image)",
        "previous_split": "train"
    },
    "mango_flesh_add_021.jpg": {
        "roboflow_id": "pUdpgXMLCnBtvkiTRKS2",
        "reason": "Rejected during Roboflow review (unapproved non-mango flesh image)",
        "previous_split": "test"
    },
    "mango_flesh_add_006.jpg": {
        "roboflow_id": "lnEloSX4QCL6SwEB83EI",
        "reason": "Rejected during Roboflow review (unapproved Mangifera foetida / non-standard flesh image)",
        "previous_split": "val"
    },
    "mango_peel_add_001.jpg": {
        "roboflow_id": "tpvVwf4dZ4MQzNdth2LL",
        "reason": "Deleted from Roboflow dataset following review; fly on skin in street setting",
        "previous_split": "excluded"
    }
}

# 3. Read Pilot v1 manifest
v1_manifest_path = DATASETS_DIR / "SPLIT_MANIFEST_PILOT.csv"
with open(v1_manifest_path, "r", encoding="utf-8") as f:
    v1_rows = list(csv.DictReader(f))

# Define known capture groups and grouping evidence
def get_group_info(filename):
    if filename.startswith("chicken_plate_"):
        return ("SEQ-CHICKEN-PLATE-CAFETERIA", "Burst canteen photo sequence of identical plate, tableware, and lighting.")
    elif filename.startswith("mango_peel_wm_"):
        return ("SEQ-MANGO-PEEL-COUNTER", "Burst photo sequence of spiral peel strips on dark kitchen counter.")
    elif filename.startswith("mango_peel_add_"):
        return ("SEQ-MANGO-PEEL-BULACAN-GARDEN", "Burst photo sequence of peel shavings held in hand by Judgefloro against wall/greenery.")
    elif filename in ["mango_flesh_add_002.jpg", "mango_flesh_add_003.jpg", "mango_flesh_add_004.jpg", "mango_flesh_add_012.jpg", "mango_flesh_add_013.jpg"]:
        return ("SEQ-MANGO-FLESH-BULACAN-0526", "Multi-angle sequence of scored mango halves and slices over plate by Judgefloro.")
    elif filename in ["mango_flesh_add_011.jpg", "mango_flesh_add_024.jpg"]:
        return ("SEQ-MANGO-FLESH-BULACAN-0082", "Sequence of scored mango halves held against stone balustrade by Judgefloro.")
    elif filename in ["mango_flesh_add_005.jpg", "mango_flesh_add_017.jpg", "mango_flesh_add_018.jpg"]:
        return ("SEQ-MANGO-FLESH-BULACAN-775", "Transversal cut and sliced mango sequence by Judgefloro.")
    elif filename in ["mango_flesh_add_001.jpg", "mango_flesh_add_020.jpg"]:
        return ("SEQ-MANGO-FLESH-HIMSAGAR-SLICES", "Close-up platter burst sequence of sliced Himsagar mangoes.")
    elif filename in ["noodles_rep_006.jpg", "noodles_rep_007.jpg", "noodles_rep_008.jpg", "noodles_rep_009.jpg"]:
        return ("SEQ-NOODLES-STIRFRY-ORWU", "Cooking and preparation sequence of stir-fry noodles.")
    elif filename.startswith("whole_mango_wm_"):
        return ("GRP-WHOLE-MANGO-WM", "Waste/market collection; independent shots (uncertain intra-market batch grouping).")
    elif filename.startswith("kottu_wm_"):
        return ("GRP-KOTTU-WM", "Independent plated restaurant shots across Sri Lankan eateries.")
    elif filename.startswith("rice_rep_"):
        return ("GRP-RICE-REP", "Open-source CC plated rice waste samples; independent capture sources.")
    elif filename.startswith("noodles_rep_"):
        return ("GRP-NOODLES-REP", "Open-source CC plated noodle waste samples; independent capture sources.")
    elif filename.startswith("mango_flesh_add_"):
        return ("GRP-MANGO-FLESH-STANDALONE", "Independent verified mango flesh photograph with unique background/creator.")
    return ("GRP-UNCERTAIN", "Uncertain capture grouping.")

v2_manifest_rows = []
split_counts = {"train": 0, "val": 0, "test": 0}

for r in v1_rows:
    fname = r["filename"]
    if fname in EXCLUDED_FILES:
        continue

    old_split = r["split"]
    # Source paths in v1
    src_img = V1_DIR / "images" / old_split / fname
    src_lbl = V1_DIR / "labels" / old_split / f"{Path(fname).stem}.txt"

    # Destination paths in v2
    dst_img = TARGET_DIR / "images" / old_split / fname
    dst_lbl = TARGET_DIR / "labels" / old_split / f"{Path(fname).stem}.txt"

    if not src_img.exists() or not src_lbl.exists():
        print(f"[!] Warning: Missing v1 asset {fname}")
        continue

    shutil.copy2(src_img, dst_img)
    shutil.copy2(src_lbl, dst_lbl)
    split_counts[old_split] += 1

    grp_id, grp_ev = get_group_info(fname)

    v2_manifest_rows.append({
        "filename": fname,
        "roboflow_id": r["roboflow_id"],
        "split": old_split,
        "width": r["width"],
        "height": r["height"],
        "box_count": r["box_count"],
        "classes": r["classes"],
        "capture_group": grp_id,
        "grouping_evidence": grp_ev,
        "local_image_path": f"ai/datasets/food_waste_pilot_v2/images/{old_split}/{fname}",
        "local_label_path": f"ai/datasets/food_waste_pilot_v2/labels/{old_split}/{Path(fname).stem}.txt"
    })

print(f"[+] Built food_waste_pilot_v2 successfully.")
print(f"    Train images: {split_counts['train']} (Expected: 95)")
print(f"    Val images  : {split_counts['val']} (Expected: 18)")
print(f"    Test images : {split_counts['test']} (Expected: 14)")
print(f"    Total images: {sum(split_counts.values())} (Expected: 127)")

# Write data.yaml
data_yaml_content = f"""# SLIIT IT4010 Research Project J26-IT-333
# Component 4: Smart Waste Bin - Food Recognition YOLO Pilot Configuration v2
# Versioned Pilot Dataset v2 (127 Approved Images, 7 Active Classes, Zero Bread, Zero Rejected Images)
# Generated: 2026-10-21

path: {TARGET_DIR.resolve()}
train: images/train
val: images/val
test: images/test

nc: 7

names:
  0: rice
  1: kottu
  2: noodles
  3: chicken
  4: whole_mango
  5: mango_flesh
  6: mango_peel
"""

with open(TARGET_DIR / "data.yaml", "w", encoding="utf-8") as f:
    f.write(data_yaml_content.strip() + "\n")

# Write SPLIT_MANIFEST_PILOT_V2.csv
manifest_v2_path = DATASETS_DIR / "SPLIT_MANIFEST_PILOT_V2.csv"
with open(manifest_v2_path, "w", newline="", encoding="utf-8") as f:
    fieldnames = [
        "filename", "roboflow_id", "split", "width", "height", "box_count",
        "classes", "capture_group", "grouping_evidence", "local_image_path", "local_label_path"
    ]
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(v2_manifest_rows)

print(f"[+] Saved SPLIT_MANIFEST_PILOT_V2.csv with {len(v2_manifest_rows)} rows.")

# Write EXCLUSION_RECORD_PILOT_V2.csv
exclusion_rows = []
for fn, meta in EXCLUDED_FILES.items():
    exclusion_rows.append({
        "Filename": fn,
        "Roboflow_ID": meta["roboflow_id"],
        "Reason": meta["reason"],
        "Previous_Split": meta["previous_split"],
        "Current_Status": "EXCLUDED from food_waste_pilot_v2"
    })

# Also record paused bread
for b_idx in range(1, 15):
    exclusion_rows.append({
        "Filename": f"bread_plate_{b_idx:03d}.jpg",
        "Roboflow_ID": "UNANNOTATED",
        "Reason": "Paused research class; 0 annotations in Roboflow",
        "Previous_Split": "unassigned",
        "Current_Status": "EXCLUDED from food_waste_pilot_v2"
    })
for b_idx in range(15, 21):
    exclusion_rows.append({
        "Filename": f"bread_wm_{b_idx:03d}.jpg",
        "Roboflow_ID": "UNANNOTATED",
        "Reason": "Paused research class; 0 annotations in Roboflow",
        "Previous_Split": "unassigned",
        "Current_Status": "EXCLUDED from food_waste_pilot_v2"
    })

exclusion_csv_path = DATASETS_DIR / "EXCLUSION_RECORD_PILOT_V2.csv"
with open(exclusion_csv_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["Filename", "Roboflow_ID", "Reason", "Previous_Split", "Current_Status"])
    w.writeheader()
    w.writerows(exclusion_rows)

print(f"[+] Saved EXCLUSION_RECORD_PILOT_V2.csv with {len(exclusion_rows)} entries.")
