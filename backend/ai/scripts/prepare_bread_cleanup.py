#!/usr/bin/env python3
"""
Prepare Bread Dumpling Cleanup List for User Review
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)
Component 4: AI & IoT-Based Smart Waste Bin

Indexes the 14 ambiguous bread dumpling plate images in Roboflow:
bread_plate_001.jpg through bread_plate_014.jpg
Generates ROBOFLOW_CLEANUP_BREAD_DUMPLINGS.json for user approval.
DOES NOT delete any images remotely.
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding="utf-8")

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parents[1]
DATASETS_DIR = CURRENT_DIR.parent / "datasets"

load_dotenv(BACKEND_DIR / ".env")

CLEANUP_BREAD_PATH = DATASETS_DIR / "ROBOFLOW_CLEANUP_BREAD_DUMPLINGS.json"


def prepare_bread_dumpling_cleanup():
    print("=" * 80)
    print("  PREPARING BREAD DUMPLING CLEANUP LIST (PENDING USER APPROVAL)")
    print("=" * 80)

    from roboflow import Roboflow
    api_key = os.getenv("ROBOFLOW_API_KEY")
    if not api_key:
        print("[!] ROBOFLOW_API_KEY not found.")
        sys.exit(1)

    rf = Roboflow(api_key=api_key)
    workspace = rf.workspace("runeths-workspace")
    project = workspace.project("smart-waste-bin-food-recogniti")

    remote_images = project.search(limit=250, fields=["id", "name"])
    id_map = {img["name"]: img["id"] for img in remote_images}

    candidates = []
    for i in range(1, 15):
        fname = f"bread_plate_{i:03d}.jpg"
        rid = id_map.get(fname, "NOT_FOUND")
        candidates.append({
            "filename": fname,
            "class_name": "bread",
            "batch_name": "pilot-bread",
            "roboflow_id": rid,
            "reason": "Bavarian bread dumpling leftover scraps (Semmelknoedel) with dark beer-mustard gravy smears; unrepresentative of standard bread waste (slices, buns, crusts) and risks model confusion with gravy/meat stains."
        })

    doc = {
        "total_candidates": len(candidates),
        "class_name": "bread",
        "action": "EXCLUDE_FROM_TRAINING_CLASS",
        "status": "PENDING_USER_APPROVAL",
        "note": "Preserved locally in staging_open_images/bread/. Remote deletion deferred pending user confirmation.",
        "candidates": candidates
    }

    with open(CLEANUP_BREAD_PATH, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2)

    print(f"[+] Successfully saved {len(candidates)} candidates to: {CLEANUP_BREAD_PATH.name}")
    for c in candidates:
        print(f"  • {c['filename']:20s} -> Roboflow ID: {c['roboflow_id']}")


if __name__ == "__main__":
    prepare_bread_dumpling_cleanup()
