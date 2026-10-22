#!/usr/bin/env python3
"""
Inspect all images in Roboflow project: annotations, boxes, classes, splits
SLIIT IT4010 Research Project 2026 - Component 4
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

api_key = os.getenv("ROBOFLOW_API_KEY")
workspace_name = os.getenv("ROBOFLOW_WORKSPACE", "runeths-workspace")
project_name = os.getenv("ROBOFLOW_PROJECT", "smart-waste-bin-food-recogniti")

from roboflow import Roboflow

rf = Roboflow(api_key=api_key)
ws = rf.workspace(workspace_name)
proj = ws.project(project_name)

print(f"Fetching images for {workspace_name}/{project_name}...")
gen = proj.search_all()

all_items = []
seen_ids = set()
for batch in gen:
    items = batch if isinstance(batch, list) else [batch]
    for it in items:
        iid = it.get("id")
        if iid and iid not in seen_ids:
            seen_ids.add(iid)
            all_items.append(it)

print(f"Total unique images retrieved: {len(all_items)}")

# Fetch detailed metadata for each image
detailed_images = []
for idx, it in enumerate(all_items, 1):
    iid = it["id"]
    try:
        detail = proj.image(iid)
        detailed_images.append(detail)
        name = detail.get("name", "unknown")
        split = detail.get("split", "none")
        boxes = detail.get("annotation", {}).get("boxes", []) if detail.get("annotation") else []
        box_labels = [b.get("label") for b in boxes]
        if idx % 20 == 0 or idx == len(all_items):
            print(f"[{idx:03d}/{len(all_items)}] Processed {name} (split: {split}, boxes: {len(boxes)}, labels: {set(box_labels)})")
    except Exception as e:
        print(f"[{idx:03d}/{len(all_items)}] Error fetching {iid}: {e}")

out_path = Path(__file__).resolve().parent / "roboflow_images_detailed.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(detailed_images, f, indent=2)

print(f"\nSaved detailed metadata to {out_path} ({len(detailed_images)} images)")
