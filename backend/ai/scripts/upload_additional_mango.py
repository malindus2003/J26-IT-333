#!/usr/bin/env python3
"""
Upload Additional Mango Images to Roboflow
SLIIT IT4010 Research Project 2026 (Group J26-IT-333) - Component 4

Uploads unannotated accepted images to:
- Batch: additional-mango_flesh (25 images)
- Batch: additional-mango_peel (5 images)
Records results and returned Roboflow image IDs to ROBOFLOW_UPLOAD_RECORD.json.
"""

import os
import sys
import json
import csv
from pathlib import Path
from datetime import datetime, timezone
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding="utf-8")

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parents[1]
DATASETS_DIR = CURRENT_DIR.parent / "datasets"
ENV_PATH = BACKEND_DIR / ".env"

load_dotenv(ENV_PATH)

api_key = os.getenv("ROBOFLOW_API_KEY")
workspace_name = os.getenv("ROBOFLOW_WORKSPACE", "runeths-workspace")
project_name = os.getenv("ROBOFLOW_PROJECT", "smart-waste-bin-food-recogniti")

if not api_key:
    raise RuntimeError("ROBOFLOW_API_KEY is not defined in environment!")

from roboflow import Roboflow

print("=" * 75)
print("  STEP 4: ROBOFLOW ADDITIONAL MANGO UPLOAD")
print("=" * 75)
print(f"[*] Authenticating with Roboflow workspace '{workspace_name}', project '{project_name}'...")
rf = Roboflow(api_key=api_key)
workspace = rf.workspace(workspace_name)
project = workspace.project(project_name)
print("[+] Successfully connected to Roboflow project.")

manifest_path = DATASETS_DIR / "DATASET_MANIFEST_ADDITIONAL_MANGO.csv"
record_path = DATASETS_DIR / "ROBOFLOW_UPLOAD_RECORD.json"

upload_records = {}
if record_path.exists():
    with open(record_path, "r", encoding="utf-8") as f:
        upload_records = json.load(f)
print(f"[*] Loaded {len(upload_records)} existing upload records from {record_path.name}")

with open(manifest_path, "r", encoding="utf-8") as f:
    items = list(csv.DictReader(f))

print(f"[*] Found {len(items)} images to process from manifest.\n")

success_count = 0
fail_count = 0
skipped_count = 0

for idx, item in enumerate(items, 1):
    fn = item["filename"]
    batch_name = item["batch_name"]
    cname = item["intended_class"]
    img_path = DATASETS_DIR / item["local_path"]

    if not img_path.exists():
        print(f"[{idx:02d}/{len(items)}] [!] File not found: {img_path}")
        fail_count += 1
        continue

    if fn in upload_records and upload_records[fn].get("status") == "success":
        roboflow_id = upload_records[fn].get("roboflow_id", "ALREADY_UPLOADED")
        print(f"[{idx:02d}/{len(items)}] [-] Skipped (already uploaded): {fn} -> ID: {roboflow_id}")
        skipped_count += 1
        continue

    print(f"[{idx:02d}/{len(items)}] [*] Uploading {fn} ({cname}) -> Batch: {batch_name}...")
    try:
        res = project.upload(
            image_path=str(img_path),
            split="train",
            batch_name=batch_name
        )

        # Extract Roboflow image ID
        roboflow_id = None
        if isinstance(res, list) and len(res) > 0 and isinstance(res[0], dict):
            roboflow_id = res[0].get("image", {}).get("id") or res[0].get("id")
        elif isinstance(res, dict):
            roboflow_id = res.get("image", {}).get("id") or res.get("id")

        upload_records[fn] = {
            "image_id": item["image_id"],
            "filename": fn,
            "class_name": cname,
            "batch_name": batch_name,
            "split": "train",
            "status": "success",
            "roboflow_id": roboflow_id or "UPLOADED",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
        success_count += 1
        print(f"         [+] Success! Roboflow ID: {roboflow_id or 'Assigned'}")

        # Incremental save
        with open(record_path, "w", encoding="utf-8") as rf_out:
            json.dump(upload_records, rf_out, indent=2)

    except Exception as exc:
        print(f"         [!] Upload failed for {fn}: {exc}")
        upload_records[fn] = {
            "image_id": item["image_id"],
            "filename": fn,
            "class_name": cname,
            "batch_name": batch_name,
            "status": "failed",
            "error": str(exc),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        fail_count += 1
        with open(record_path, "w", encoding="utf-8") as rf_out:
            json.dump(upload_records, rf_out, indent=2)

print("\n" + "=" * 75)
print("  UPLOAD EXECUTION COMPLETE")
print("=" * 75)
print(f"Total Processed : {len(items)}")
print(f"Newly Uploaded  : {success_count}")
print(f"Skipped Dups    : {skipped_count}")
print(f"Failed Uploads  : {fail_count}")
print(f"Total Tracked   : {len(upload_records)}")
print("=" * 75)
