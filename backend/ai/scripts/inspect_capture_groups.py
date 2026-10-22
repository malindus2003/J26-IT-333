#!/usr/bin/env python3
"""
Inspect Capture Sequences, Series Groups, and Leakage Across Splits
SLIIT IT4010 Research Project 2026 - Component 4
"""

import sys
import json
import csv
import re
from collections import defaultdict, Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BACKEND_DIR / "ai" / "datasets"

with open(BACKEND_DIR / "ai" / "scripts" / "roboflow_images_detailed.json", "r", encoding="utf-8") as f:
    images = json.load(f)

# Exclude bread
approved_images = [img for img in images if img.get("annotation") and img["annotation"].get("boxes")]
rf_img_map = {img["name"]: img for img in approved_images}

# Load manifests
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

print(f"Loaded metadata for {len(manifest_data)} / {len(approved_images)} approved images.")

# Determine series / capture group for each image
def get_series_id(filename, meta):
    # Chicken sequence
    if "chicken_plate" in filename:
        return "SEQ-CHICKEN-PLATE"

    title = meta.get("title", "") or meta.get("source_title", "")
    url = meta.get("source_url", "") or meta.get("image_url", "")
    page_url = meta.get("source_page_url", "")

    # 775Cuisine foods of Bulacan sequence (mango peel & flesh)
    if "775cuisine foods of bulacan" in title.lower() or "775cuisine" in url.lower():
        return "SEQ-BULACAN-775CUISINE"

    # 0526Cuisine food in Baliuag Bulacan Province
    if "0526cuisine" in title.lower() or "0526cuisine" in url.lower():
        return "SEQ-BALIUAG-0526CUISINE"

    # 3535Mango slices
    if "3535mango" in title.lower():
        return "SEQ-BALIUAG-3535MANGO"

    # 0082Cuisine food of Bulacan
    if "0082cuisine" in title.lower():
        return "SEQ-BULACAN-0082CUISINE"

    # 1253Sliced mangoes
    if "1253sliced" in title.lower():
        return "SEQ-BALIUAG-1253SLICED"

    # 2222Sliced mangoes
    if "2222sliced" in title.lower():
        return "SEQ-BALIUAG-2222SLICED"

    # Himsagar mango slices (Salil Kumar Mukherjee)
    if "himsagar" in title.lower():
        return "SEQ-HIMSAGAR-SLICES"

    # Sliced mangoes / Mango peel by Suchitra kumari
    if "suchitra kumari" in meta.get("creator", "").lower() or "suchitra kumari" in meta.get("attribution", "").lower() or "mango peel 1" in title.lower() or "mango peel 2" in title.lower():
        return "SEQ-SUCHITRA-KUMARI"

    # Common flickr or author groups
    author = meta.get("creator", "") or meta.get("attribution", "")
    if "judgefloro" in author.lower():
        # Match series prefix from title
        m = re.match(r"(?:File:)?(\d+[\w\s]+?)\s+\d+\.jpg", title, re.IGNORECASE)
        if m:
            return f"SEQ-JUDGEFLORO-{m.group(1).strip().upper().replace(' ', '_')}"
        return "SEQ-JUDGEFLORO-MISC"

    # Generic grouping by title base if multi-part series
    m = re.match(r"(?:File:)?([a-zA-Z\s_-]+?)(?:\s+|_)?(\d+)\.jpg", title, re.IGNORECASE)
    if m:
        base = m.group(1).strip().upper().replace(" ", "_")
        if len(base) > 4:
            return f"SEQ-SERIES-{base}"

    return f"SINGLE-{filename}"

# Group images
groups = defaultdict(list)
for fn, img in rf_img_map.items():
    meta = manifest_data.get(fn, {})
    gid = get_series_id(fn, meta)
    groups[gid].append((fn, img.get("split"), img))

print(f"\nIdentified {len(groups)} distinct capture / scene groups among {len(approved_images)} images.")

# Check for cross-split leakage
leakage_found = []
for gid, members in sorted(groups.items()):
    splits_in_group = set(split for fn, split, img in members)
    if len(splits_in_group) > 1:
        leakage_found.append((gid, splits_in_group, members))

print(f"\nCross-Split Sequence Leakage Audit:")
if not leakage_found:
    print("   [+] ZERO cross-split sequence leakage detected!")
else:
    print(f"   [!] WARNING: {len(leakage_found)} sequences are currently split across multiple splits:")
    for gid, splits, members in leakage_found:
        print(f"     • Group '{gid}' spans splits {splits}:")
        for fn, split, img in members:
            labels = set(b['label'] for b in img['annotation']['boxes'])
            print(f"         - {fn:25s} [{split:5s}] -> labels: {labels}")

# Summary of Multi-Image Groups
print(f"\nSummary of Multi-Image Capture Groups:")
for gid, members in sorted(groups.items()):
    if len(members) > 1:
        splits = Counter(split for fn, split, img in members)
        print(f"   • {gid:30s} ({len(members):2d} images) -> splits: {dict(splits)}")
