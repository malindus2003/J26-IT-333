#!/usr/bin/env python3
"""
Comprehensive Audit of Roboflow Approved Dataset
SLIIT IT4010 Research Project 2026 - Component 4
"""

import sys
import json
import csv
from collections import defaultdict, Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BACKEND_DIR / "ai" / "datasets"

with open(BACKEND_DIR / "ai" / "scripts" / "roboflow_images_detailed.json", "r", encoding="utf-8") as f:
    images = json.load(f)

# Exclude bread (unannotated/paused)
approved_images = [img for img in images if img.get("annotation") and img["annotation"].get("boxes")]

print(f"Total approved annotated images: {len(approved_images)}")

# 1. Box Validity & Duplicate Annotations Check
invalid_boxes = []
duplicate_boxes = []
class_box_counts = Counter()

for img in approved_images:
    name = img.get("name")
    w = float(img["annotation"].get("width", 0))
    h = float(img["annotation"].get("height", 0))
    boxes = img["annotation"].get("boxes", [])

    seen_boxes_in_img = []
    for b_idx, b in enumerate(boxes):
        lbl = b.get("label")
        class_box_counts[lbl] += 1
        bx = float(b.get("x", 0))
        by = float(b.get("y", 0))
        bw = float(b.get("width", 0))
        bh = float(b.get("height", 0))

        # Check invalid dimensions
        if bw <= 0 or bh <= 0:
            invalid_boxes.append((name, b_idx, "Zero or negative width/height", b))
        if bx < 0 or by < 0 or (w > 0 and bx > w) or (h > 0 and by > h):
            invalid_boxes.append((name, b_idx, "Center outside image bounds", b))

        # Check box bounds
        x1 = bx - bw / 2
        y1 = by - bh / 2
        x2 = bx + bw / 2
        y2 = by + bh / 2

        # Check duplicate box in same image
        for prev_lbl, px1, py1, px2, py2 in seen_boxes_in_img:
            # IoU check
            inter_x1 = max(x1, px1)
            inter_y1 = max(y1, py1)
            inter_x2 = min(x2, px2)
            inter_y2 = min(y2, py2)
            inter_area = max(0, inter_x2 - inter_x1) * max(0, inter_y2 - inter_y1)
            area1 = (x2 - x1) * (y2 - y1)
            area2 = (px2 - px1) * (py2 - py1)
            union_area = area1 + area2 - inter_area
            iou = inter_area / union_area if union_area > 0 else 0

            if iou > 0.95 and lbl == prev_lbl:
                duplicate_boxes.append((name, lbl, iou, (x1, y1, x2, y2), (px1, py1, px2, py2)))

        seen_boxes_in_img.append((lbl, x1, y1, x2, y2))

print(f"\n1. Box Validity Check:")
print(f"   Invalid boxes found: {len(invalid_boxes)}")
for iv in invalid_boxes:
    print(f"     [!] {iv}")

print(f"   Duplicate boxes found: {len(duplicate_boxes)}")
for db in duplicate_boxes:
    print(f"     [!] {db[0]} - {db[1]} (IoU: {db[2]:.2f})")

print(f"\n2. Bounding Box Counts by Class:")
for c, cnt in sorted(class_box_counts.items()):
    print(f"   {c:15s}: {cnt:4d} boxes")

# 3. Check Current Split Assignments in Roboflow
print(f"\n3. Current Remote Split Assignments in Roboflow:")
remote_splits = defaultdict(list)
for img in approved_images:
    s = img.get("split", "unassigned")
    remote_splits[s].append(img)

for s, img_list in remote_splits.items():
    lbl_set = set()
    for img in img_list:
        for b in img["annotation"]["boxes"]:
            lbl_set.add(b.get("label"))
    print(f"   Split '{s}': {len(img_list):3d} images | Classes: {sorted(list(lbl_set))}")

# 4. Detailed class-by-split matrix
print(f"\n4. Class Distribution Across Remote Splits:")
header = f"{'Class':15s} | {'Train':6s} | {'Valid':6s} | {'Test':6s} | {'Total Imgs':10s} | {'Total Boxes':11s}"
print(header)
print("-" * len(header))

all_classes = sorted(list(class_box_counts.keys()))
for cls in all_classes:
    train_imgs = sum(1 for img in remote_splits["train"] if any(b.get("label") == cls for b in img["annotation"]["boxes"]))
    val_imgs = sum(1 for img in remote_splits["valid"] if any(b.get("label") == cls for b in img["annotation"]["boxes"]))
    test_imgs = sum(1 for img in remote_splits["test"] if any(b.get("label") == cls for b in img["annotation"]["boxes"]))
    tot_imgs = train_imgs + val_imgs + test_imgs
    tot_boxes = class_box_counts[cls]
    print(f"{cls:15s} | {train_imgs:6d} | {val_imgs:6d} | {test_imgs:6d} | {tot_imgs:10d} | {tot_boxes:11d}")
