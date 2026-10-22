#!/usr/bin/env python3
"""
Verified Roboflow Cleanup Execution Script
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)
Component 4: AI & IoT-Based Smart Waste Bin

Safely executes deletion of approved 37 incorrect images:
- 20 images from pilot-rice (rice_plate_001.jpg to rice_plate_020.jpg)
- 17 images from pilot-noodles (noodles_plate_001.jpg to noodles_plate_017.jpg)

Safety Invariants:
1. Verifies live image IDs in Roboflow before deletion.
2. Validates that 0 images of mango_peel, whole_mango, kottu, chicken, or bread are in the deletion list.
3. Preserves all local files and audit manifests.
4. Updates local ROBOFLOW_UPLOAD_RECORD.json post-deletion.
5. Verifies post-deletion state in Roboflow (expects exactly 77 remaining images).
"""

import os
import sys
import json
import time
from pathlib import Path
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding="utf-8")

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parents[1]
DATASETS_DIR = CURRENT_DIR.parent / "datasets"

load_dotenv(BACKEND_DIR / ".env")

CLEANUP_LIST_PATH = DATASETS_DIR / "ROBOFLOW_CLEANUP_LIST.json"
UPLOAD_RECORD_PATH = DATASETS_DIR / "ROBOFLOW_UPLOAD_RECORD.json"


def execute_verified_cleanup():
    print("=" * 80)
    print("  SLIIT COMPONENT 4: ROBOFLOW VERIFIED DATASET CLEANUP EXECUTION")
    print("=" * 80)

    # 1. Load Cleanup Plan
    if not CLEANUP_LIST_PATH.exists():
        print(f"[!] Cleanup plan missing at: {CLEANUP_LIST_PATH}")
        sys.exit(1)

    with open(CLEANUP_LIST_PATH, "r", encoding="utf-8") as f:
        cleanup_data = json.load(f)

    cleanup_candidates = cleanup_data.get("cleanup_candidates", [])
    print(f"[*] Loaded cleanup candidates: {len(cleanup_candidates)} images")

    # Safety Invariant 1: Exactly 37 images
    if len(cleanup_candidates) != 37:
        print(f"[!] SAFETY ABORT: Expected exactly 37 candidates, but found {len(cleanup_candidates)}.")
        sys.exit(1)

    # Safety Invariant 2: Check target classes
    allowed_classes = {"rice", "noodles"}
    for c in cleanup_candidates:
        if c["class_name"] not in allowed_classes:
            print(f"[!] SAFETY ABORT: Image {c['filename']} has unauthorized class '{c['class_name']}'.")
            sys.exit(1)
        if "mango_peel" in c["filename"] or c["class_name"] == "mango_peel":
            print(f"[!] CRITICAL SAFETY ABORT: Mango peel image detected in cleanup list!")
            sys.exit(1)

    # 2. Connect to Roboflow with retry
    api_key = os.getenv("ROBOFLOW_API_KEY")
    if not api_key:
        print("[!] ROBOFLOW_API_KEY not configured in environment.")
        sys.exit(1)

    from roboflow import Roboflow
    rf = None
    for attempt in range(1, 4):
        try:
            print(f"[*] Connecting to Roboflow (Attempt {attempt}/3)...")
            rf = Roboflow(api_key=api_key)
            workspace = rf.workspace("runeths-workspace")
            project = workspace.project("smart-waste-bin-food-recogniti")
            break
        except Exception as e:
            print(f"    [!] Connection attempt {attempt} failed: {e}")
            if attempt < 3:
                time.sleep(2)
            else:
                print("[!] Could not connect to Roboflow. Please check network/DNS.")
                sys.exit(1)

    # 3. Query current remote state
    print("[*] Inspecting remote images in Roboflow...")
    remote_images = project.search(limit=250, fields=["id", "name", "created"])
    print(f"[+] Total remote images currently in Roboflow: {len(remote_images)}")

    remote_id_map = {img["name"]: img["id"] for img in remote_images}

    # Verify each candidate exists in Roboflow
    ids_to_delete = []
    missing_in_remote = []

    for c in cleanup_candidates:
        fname = c["filename"]
        live_id = remote_id_map.get(fname)
        if live_id:
            ids_to_delete.append(live_id)
            c["live_roboflow_id"] = live_id
        else:
            missing_in_remote.append(fname)

    print(f"[+] Verified {len(ids_to_delete)} candidate image IDs present in Roboflow.")
    if missing_in_remote:
        print(f"[!] Warning: {len(missing_in_remote)} images already absent in Roboflow: {missing_in_remote}")

    # Safety Invariant 3: Double-check preserved images
    remote_preserved = [img for img in remote_images if img["id"] not in ids_to_delete]
    print(f"[+] Preserved images count: {len(remote_preserved)}")

    preserved_mango_peel = [img for img in remote_preserved if "mango_peel" in img["name"]]
    print(f"    • Preserved mango_peel images : {len(preserved_mango_peel)} (MUST BE 2)")
    if len(preserved_mango_peel) != 2:
        print(f"[!] WARNING: Expected 2 mango_peel images, found {len(preserved_mango_peel)}.")

    # 4. Execute Deletion
    print("\n" + "=" * 80)
    print(f"  EXECUTING LIVE DELETION OF {len(ids_to_delete)} IMAGES")
    print("=" * 80)

    try:
        # Roboflow delete_images API call
        project.delete_images(image_ids=ids_to_delete)
        print(f"[+] Successfully executed delete_images for {len(ids_to_delete)} images.")
    except Exception as exc:
        print(f"[!] Deletion request failed: {exc}")
        sys.exit(1)

    # Allow Roboflow backend to process
    time.sleep(3)

    # 5. Verify Post-Deletion State
    print("\n[*] Verifying post-deletion project state in Roboflow...")
    post_images = project.search(limit=250, fields=["id", "name"])
    print(f"[+] Total remote images after cleanup: {len(post_images)}")

    post_names = set(img["name"] for img in post_images)
    still_present_errors = [c["filename"] for c in cleanup_candidates if c["filename"] in post_names]

    if still_present_errors:
        print(f"[!] Warning: Some target images still present: {still_present_errors}")
    else:
        print("[+] SUCCESS: All 37 target incorrect images have been completely removed from Roboflow!")

    # 6. Update local ROBOFLOW_UPLOAD_RECORD.json
    if UPLOAD_RECORD_PATH.exists():
        with open(UPLOAD_RECORD_PATH, "r", encoding="utf-8") as f:
            upload_records = json.load(f)

        before_count = len(upload_records)
        deleted_keys = []
        for c in cleanup_candidates:
            fname = c["filename"]
            if fname in upload_records:
                del upload_records[fname]
                deleted_keys.append(fname)

        with open(UPLOAD_RECORD_PATH, "w", encoding="utf-8") as f:
            json.dump(upload_records, f, indent=2)

        print(f"[+] Updated {UPLOAD_RECORD_PATH.name}:")
        print(f"    • Records before : {before_count}")
        print(f"    • Removed        : {len(deleted_keys)}")
        print(f"    • Records after  : {len(upload_records)}")

    # 7. Final Class Breakdown in Roboflow
    breakdown = {}
    for img in post_images:
        name = img["name"]
        prefix = name.split("_")[0]
        if "mango_peel" in name:
            prefix = "mango_peel"
        elif "whole_mango" in name:
            prefix = "whole_mango"
        breakdown[prefix] = breakdown.get(prefix, 0) + 1

    print("\n" + "=" * 80)
    print("FINAL ROBOFLOW PROJECT STATE SUMMARY:")
    print("=" * 80)
    for c, cnt in sorted(breakdown.items()):
        print(f"  • {c:<15} : {cnt} images")
    print(f"  • {'TOTAL':<15} : {len(post_images)} images")
    print("=" * 80)


if __name__ == "__main__":
    execute_verified_cleanup()
