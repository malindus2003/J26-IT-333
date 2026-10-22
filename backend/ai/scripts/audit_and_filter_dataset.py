#!/usr/bin/env python3
"""
Audit & Validation Script for Food Waste Recognition Dataset
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)
Component 4: Smart Waste Bin Identification and Monitoring

Performs:
1. Manifest and file existence inspection.
2. Direct Wikimedia Commons API queries for live license, author, and description metadata.
3. Rigorous semantic filtering to flag miscategorized images (especially in mango_peel, whole_mango, kottu).
4. Generation of a clean, verified manifest of images approved for Roboflow upload.
"""

import sys
import os
import csv
import re
import json
from pathlib import Path
import requests
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATASETS_DIR = BACKEND_DIR / "ai" / "datasets"
STAGING_DIR = DATASETS_DIR / "staging_open_images"
MANIFEST_PATH = DATASETS_DIR / "DATASET_MANIFEST.csv"
AUDIT_LOG_PATH = DATASETS_DIR / "DATASET_AUDIT_LOG.json"

USER_AGENT = "SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)"


def fetch_wikimedia_metadata(titles: list) -> dict:
    """Queries Wikimedia Commons API for accurate license, artist, description, and categories."""
    api_url = "https://commons.wikimedia.org/w/api.php"
    headers = {"User-Agent": USER_AGENT}
    results = {}

    for i in range(0, len(titles), 20):
        chunk = titles[i:i + 20]
        params = {
            "action": "query",
            "format": "json",
            "titles": "|".join(chunk),
            "prop": "imageinfo|categories",
            "iiprop": "url|size|extmetadata"
        }
        try:
            r = requests.get(api_url, params=params, headers=headers, timeout=20)
            r.raise_for_status()
            pages = r.json().get("query", {}).get("pages", {})
            for pid, p in pages.items():
                title = p.get("title")
                ii = p.get("imageinfo", [{}])[0]
                meta = ii.get("extmetadata", {})
                cats = [c.get("title", "") for c in p.get("categories", [])]

                # Clean HTML
                desc = meta.get("ImageDescription", {}).get("value", "")
                desc_clean = re.sub(r"<[^>]+>", "", desc).strip()

                artist = meta.get("Artist", {}).get("value", "")
                artist_clean = re.sub(r"<[^>]+>", "", artist).strip() or "Wikimedia Contributor"

                lic = meta.get("LicenseShortName", {}).get("value", "")
                lic_url = meta.get("LicenseUrl", {}).get("value", "")

                results[title] = {
                    "url": ii.get("url"),
                    "license": lic,
                    "license_url": lic_url,
                    "artist": artist_clean,
                    "description": desc_clean,
                    "categories": cats,
                    "width": ii.get("width"),
                    "height": ii.get("height")
                }
        except Exception as e:
            print(f"[!] Error querying Wikimedia for chunk: {e}")

    return results


def run_audit():
    print("=" * 80)
    print("  SLIIT COMPONENT 4: COMPREHENSIVE DATASET & METADATA AUDIT")
    print("=" * 80)

    if not MANIFEST_PATH.exists():
        print(f"[!] Manifest not found at: {MANIFEST_PATH}")
        return

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest_rows = list(csv.DictReader(f))

    print(f"[*] Loaded {len(manifest_rows)} manifest records from {MANIFEST_PATH.name}")

    # Identify Wikimedia titles to query
    wm_titles = []
    for r in manifest_rows:
        title = r["title"]
        if title.startswith("File:"):
            wm_titles.append(title)

    print(f"[*] Querying live Wikimedia metadata for {len(wm_titles)} files...")
    wm_meta = fetch_wikimedia_metadata(wm_titles)
    print(f"[+] Retrieved live metadata for {len(wm_meta)} files.")

    approved_images = []
    flagged_images = []

    for r in manifest_rows:
        cname = r["class_name"]
        fname = r["filename"]
        local_rel = r["local_path"]
        full_local_path = DATASETS_DIR / local_rel
        source = r["source"]
        title = r["title"]

        # Check local file
        if not full_local_path.exists():
            flagged_images.append({
                "record": r,
                "reason": "Missing local image file on disk",
                "severity": "CRITICAL"
            })
            continue

        try:
            pil_img = Image.open(full_local_path)
            pil_img.verify()
            pil_img = Image.open(full_local_path)
            w, h = pil_img.size
        except Exception as e:
            flagged_images.append({
                "record": r,
                "reason": f"Corrupt image file: {e}",
                "severity": "CRITICAL"
            })
            continue

        # Live metadata verification for Wikimedia files
        live_lic = r["license"]
        live_artist = r["attribution"]
        live_desc = ""
        live_cats = []
        if title in wm_meta:
            m = wm_meta[title]
            if m.get("license"):
                live_lic = m["license"]
            if m.get("artist"):
                live_artist = m["artist"]
            live_desc = m.get("description", "")
            live_cats = m.get("categories", [])
            r["source_url"] = m.get("url") or r["source_url"]
            r["license"] = live_lic
            r["attribution"] = live_artist

        # Rigorous Semantic Class Relevance Check
        rejection_reason = None

        if cname == "mango_peel":
            lower_title = title.lower()
            lower_desc = live_desc.lower()

            # Case 1: Rambutan & Mango seeds
            if "rambutan" in lower_title or "mango seeds" in lower_title:
                rejection_reason = "Depicts rambutan fruit and mango seeds/pits rather than mango peel."
            # Case 2: Sliced mango flesh
            elif "sliced mango" in lower_title:
                rejection_reason = "Depicts sliced edible mango fruit pulp, not mango peel skin waste."
            # Case 3: Whole mango cross sections
            elif "cross section" in lower_title or "single and halved" in lower_title:
                rejection_reason = "Depicts cut/halved whole mango fruit, not discarded peel waste."
            # Case 4: Santal girl discarding skin
            elif "santal girl" in lower_title:
                rejection_reason = "Depicts a person portrait preparing mango rather than focused food waste on a tray/bin."

        elif cname == "whole_mango":
            lower_title = title.lower()
            if fname == "whole_mango_wm_007.jpg" or "cut mango" in lower_title or "sliced mango" in lower_title or "cross section" in lower_title:
                rejection_reason = "Depicts cut/sliced mango pieces on a plate (File:Cut mangoes on plate.jpg), conflicting with class definition 'whole_mango'."

        elif cname == "kottu":
            lower_title = title.lower()
            lower_desc = live_desc.lower()
            if "making kottu 1" in lower_title or "making kottu 2" in lower_title:
                rejection_reason = "Wide environmental shot of cooks preparing dish on large street griddle; insufficient waste/plate crop clarity."

        if rejection_reason:
            flagged_images.append({
                "record": r,
                "reason": rejection_reason,
                "severity": "REJECTED_RELEVANCE"
            })
            print(f"  [X] FLAGGED {cname:12s} | {fname:22s} -> {rejection_reason}")
        else:
            approved_images.append(r)

    print("\n" + "=" * 80)
    print("AUDIT RESULTS SUMMARY:")
    print("=" * 80)
    print(f"Total Images Inspected : {len(manifest_rows)}")
    print(f"Approved for Upload    : {len(approved_images)}")
    print(f"Flagged / Rejected     : {len(flagged_images)}")
    print("-" * 80)
    print(f"{'Class Name':<15} {'Inspected':<12} {'Approved':<12} {'Flagged'}")
    print("-" * 80)

    classes = ["rice", "kottu", "noodles", "chicken", "bread", "whole_mango", "mango_peel"]
    approved_by_class = {c: 0 for c in classes}
    flagged_by_class = {c: 0 for c in classes}
    inspected_by_class = {c: 0 for c in classes}

    for r in approved_images:
        approved_by_class[r["class_name"]] += 1
    for f in flagged_images:
        flagged_by_class[f["record"]["class_name"]] += 1
    for r in manifest_rows:
        inspected_by_class[r["class_name"]] += 1

    for c in classes:
        print(f"{c:<15} {inspected_by_class[c]:<12} {approved_by_class[c]:<12} {flagged_by_class[c]}")
    print("=" * 80)

    # Save detailed audit log
    audit_data = {
        "total_inspected": len(manifest_rows),
        "total_approved": len(approved_images),
        "total_flagged": len(flagged_images),
        "approved_by_class": approved_by_class,
        "flagged_by_class": flagged_by_class,
        "flagged_details": [
            {
                "class_name": f["record"]["class_name"],
                "filename": f["record"]["filename"],
                "title": f["record"]["title"],
                "reason": f["reason"],
                "license": f["record"]["license"]
            }
            for f in flagged_images
        ]
    }
    with open(AUDIT_LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(audit_data, f, indent=2)
    print(f"[+] Audit log saved to: {AUDIT_LOG_PATH}")

    # Write cleaned approved manifest
    approved_manifest_path = DATASETS_DIR / "DATASET_MANIFEST_APPROVED.csv"
    if approved_images:
        fieldnames = list(approved_images[0].keys())
        with open(approved_manifest_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(approved_images)
        print(f"[+] Approved manifest saved to: {approved_manifest_path} ({len(approved_images)} rows)")

    return approved_images, flagged_images


if __name__ == "__main__":
    run_audit()
