#!/usr/bin/env python3
import sys
import json
from collections import defaultdict, Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path(__file__).resolve().parents[2]
with open(BACKEND_DIR / "ai" / "scripts" / "roboflow_images_detailed.json", "r", encoding="utf-8") as f:
    images = json.load(f)

approved_images = [img for img in images if img.get("annotation") and img["annotation"].get("boxes")]
print(f"Total approved: {len(approved_images)}")

# Current split count
curr_splits = Counter(img.get("split") for img in approved_images)
print(f"Current splits: {dict(curr_splits)}")

# Print all valid and test images currently
print("\nCurrent VALID images (19):")
for img in sorted(approved_images, key=lambda x: x["name"]):
    if img.get("split") == "valid":
        lbls = [b["label"] for b in img["annotation"]["boxes"]]
        print(f"  {img['name']:25s} | labels: {lbls}")

print("\nCurrent TEST images (8):")
for img in sorted(approved_images, key=lambda x: x["name"]):
    if img.get("split") == "test":
        lbls = [b["label"] for b in img["annotation"]["boxes"]]
        print(f"  {img['name']:25s} | labels: {lbls}")
