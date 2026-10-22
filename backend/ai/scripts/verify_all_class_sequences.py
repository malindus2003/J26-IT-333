#!/usr/bin/env python3
"""
Verify sequences for rice, noodles, kottu, and whole_mango
"""
import sys
import json
import csv
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BACKEND_DIR / "ai" / "datasets"

with open(BACKEND_DIR / "ai" / "scripts" / "roboflow_images_detailed.json", "r", encoding="utf-8") as f:
    images = json.load(f)

approved_images = [img for img in images if img.get("annotation") and img["annotation"].get("boxes")]
rf_img_map = {img["name"]: img for img in approved_images}

manifests = [
    DATASETS_DIR / "DATASET_MANIFEST.csv",
    DATASETS_DIR / "DATASET_MANIFEST_APPROVED.csv",
    DATASETS_DIR / "DATASET_MANIFEST_REPLACEMENTS.csv",
    DATASETS_DIR / "DATASET_MANIFEST_ADDITIONAL_MANGO.csv"
]

manifest_data = {}
for m_path in manifests:
    if m_path.exists():
        with open(m_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                fn = row.get("filename") or row.get("local_filename")
                if fn and fn in rf_img_map and fn not in manifest_data:
                    manifest_data[fn] = row

for cls in ["rice", "noodles", "kottu", "whole_mango"]:
    cls_imgs = [img for img in approved_images if any(b["label"] == cls for b in img["annotation"]["boxes"])]
    print(f"\n=== CLASS: {cls.upper()} ({len(cls_imgs)} images) ===")

    # Check by creator and source title
    by_creator = defaultdict(list)
    for img in cls_imgs:
        fn = img["name"]
        meta = manifest_data.get(fn, {})
        creator = meta.get("creator") or meta.get("attribution") or "Unknown"
        title = meta.get("title") or meta.get("source_title") or "Unknown"
        split = img.get("split")
        by_creator[creator].append((fn, split, title[:35]))

    for creator, items in sorted(by_creator.items()):
        splits = set(s for fn, s, t in items)
        if len(items) > 1:
            leak = " [LEAKAGE!]" if len(splits) > 1 else " [OK]"
            print(f"  Creator '{creator[:25]}' ({len(items)} imgs, splits {splits}){leak}:")
            for fn, s, t in items:
                print(f"    - {fn:22s} [{s:5s}] : {t}")
