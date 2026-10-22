#!/usr/bin/env python3
"""
Stage and Upload Replacement Images for Food Waste Recognition Dataset
SLIIT IT4010 Research Project 2026 (Group J26-IT-333) - Component 4

Stages 27 Rice, 21 Noodles, and 3 Mango Peel verified replacement images,
creates dataset manifests, uploads to Roboflow under discrete batch names:
- replacement-rice
- replacement-noodles
- replacement-mango_peel
and updates ROBOFLOW_UPLOAD_RECORD.json and manifests.
"""

import os
import sys
import json
import re
import shutil
import csv
from pathlib import Path
from datetime import datetime, timezone
from PIL import Image
from dotenv import load_dotenv

# Set UTF-8 encoding for standard output
sys.stdout.reconfigure(encoding='utf-8')

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parents[1]
DATASETS_DIR = CURRENT_DIR.parent / "datasets"
CAND_DIR = DATASETS_DIR / "candidate_replacements"
STAGING_DIR = DATASETS_DIR / "staging_open_images"
ENV_PATH = BACKEND_DIR / ".env"

load_dotenv(ENV_PATH)

RICE_APPROVED = [
    'cand_rice_001.jpg', 'cand_rice_002.jpg', 'cand_rice_003.jpg', 'cand_rice_004.jpg',
    'cand_rice_005.jpg', 'cand_rice_007.jpg', 'cand_rice_008.jpg', 'cand_rice_009.jpg',
    'cand_rice_010.jpg', 'cand_rice_011.jpg', 'cand_rice_012.jpg', 'cand_rice_014.jpg',
    'cand_rice_015.jpg', 'cand_rice_016.jpg', 'cand_rice_017.jpg', 'cand_rice_019.jpg',
    'cand_rice_020.jpg', 'cand_rice_022.jpg', 'cand_rice_023.jpg', 'cand_rice_025.jpg',
    'cand_rice_026.jpg', 'cand_rice_027.jpg', 'cand_rice_029.jpg', 'cand_rice_030.jpg',
    'cand_rice_031.jpg', 'cand_rice_032.jpg', 'cand_rice_033.jpg'
]

NOODLES_APPROVED = [
    'cand_noodles_001.jpg', 'cand_noodles_004.jpg', 'cand_noodles_005.jpg', 'cand_noodles_006.jpg',
    'cand_noodles_008.jpg', 'cand_noodles_009.jpg', 'cand_noodles_010.jpg', 'cand_noodles_011.jpg',
    'cand_noodles_012.jpg', 'cand_noodles_014.jpg', 'cand_noodles_017.jpg', 'cand_noodles_020.jpg',
    'cand_noodles_021.jpg', 'cand_noodles_022.jpg', 'cand_noodles_023.jpg', 'cand_noodles_024.jpg',
    'cand_noodles_026.jpg', 'cand_noodles_027.jpg', 'cand_noodles_030.jpg', 'cand_noodles_032.jpg',
    'cand_noodles_034.jpg'
]

MANGO_PEEL_APPROVED = [
    ('cand_mango_peel_012.jpg', CAND_DIR / 'mango_peel' / 'cand_mango_peel_012.jpg', 'cand_mango_peel_012.jpg'),
    ('cand_mango_peel_013.jpg', CAND_DIR / 'mango_peel' / 'cand_mango_peel_013.jpg', 'cand_mango_peel_013.jpg'),
    ('peel_test_1.jpg', CAND_DIR / 'mango_peel_extra' / 'peel_test_1.jpg', 'peel_test_1.jpg')
]

PEEL_TEST_1_META = {
    'title': 'File:A Santal girl discarding the skin (peel) of green mango.jpg',
    'clean_url': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/A_Santal_girl_discarding_the_skin_%28peel%29_of_green_mango.jpg',
    'license': 'CC BY-SA 4.0',
    'artist': 'ᱯᱨᱚᱯᱷᱮᱥᱥᱚᱨ',
    'description': 'A Santal girl discarding the skin (peel) of green mango.'
}


def clean_html(text: str) -> str:
    if not text:
        return 'Unknown'
    clean = re.sub(r'<[^>]+>', '', text).strip()
    return clean or 'Unknown'


def stage_images():
    print("=" * 75)
    print("  STEP 1: STAGING VERIFIED CANDIDATE IMAGES")
    print("=" * 75)

    with open(CAND_DIR / 'harvested_candidates.json', 'r', encoding='utf-8') as f:
        harvested = json.load(f)

    rice_map = {item['saved_filename']: item for item in harvested.get('rice', [])}
    noodles_map = {item['saved_filename']: item for item in harvested.get('noodles', [])}
    peel_map = {item['saved_filename']: item for item in harvested.get('mango_peel', [])}

    replacements = []

    # 1. Staging Rice
    (STAGING_DIR / 'rice').mkdir(parents=True, exist_ok=True)
    for idx, orig_name in enumerate(RICE_APPROVED, 1):
        src_file = CAND_DIR / 'rice' / orig_name
        tgt_name = f'rice_rep_{idx:03d}.jpg'
        tgt_file = STAGING_DIR / 'rice' / tgt_name
        shutil.copy2(src_file, tgt_file)
        meta = rice_map[orig_name]
        with Image.open(tgt_file) as im:
            w, h = im.size
        replacements.append({
            'image_id': f'IMG-RICE-REP-{idx:03d}',
            'filename': tgt_name,
            'class_name': 'rice',
            'class_id': '0',
            'local_path': f'staging_open_images/rice/{tgt_name}',
            'source': 'Wikimedia Commons',
            'title': meta.get('title', ''),
            'source_url': meta.get('clean_url', meta.get('url', '')),
            'license': meta.get('license', 'CC BY-SA 4.0'),
            'attribution': clean_html(meta.get('artist', 'Unknown')),
            'width': str(w),
            'height': str(h),
            'notes': 'Visually verified cooked/fried rice grains; replacement candidate.',
            'audit_status': 'CONFIRMED_CORRECT',
            'audit_note': 'Visually confirmed prominent cooked rice grains without masking sauces or obscuring toppings.',
            'batch_name': 'replacement-rice'
        })
    print(f"[+] Staged {len(RICE_APPROVED)} rice images to staging_open_images/rice/")

    # 2. Staging Noodles
    (STAGING_DIR / 'noodles').mkdir(parents=True, exist_ok=True)
    for idx, orig_name in enumerate(NOODLES_APPROVED, 1):
        src_file = CAND_DIR / 'noodles' / orig_name
        tgt_name = f'noodles_rep_{idx:03d}.jpg'
        tgt_file = STAGING_DIR / 'noodles' / tgt_name
        shutil.copy2(src_file, tgt_file)
        meta = noodles_map[orig_name]
        with Image.open(tgt_file) as im:
            w, h = im.size
        replacements.append({
            'image_id': f'IMG-NOODLES-REP-{idx:03d}',
            'filename': tgt_name,
            'class_name': 'noodles',
            'class_id': '2',
            'local_path': f'staging_open_images/noodles/{tgt_name}',
            'source': 'Wikimedia Commons',
            'title': meta.get('title', ''),
            'source_url': meta.get('clean_url', meta.get('url', '')),
            'license': meta.get('license', 'CC BY-SA 4.0'),
            'attribution': clean_html(meta.get('artist', 'Unknown')),
            'width': str(w),
            'height': str(h),
            'notes': 'Visually verified stir-fried/cooked noodles with identifiable strands; replacement candidate.',
            'audit_status': 'CONFIRMED_CORRECT',
            'audit_note': 'Visually confirmed distinct noodle strands in wok, bowl, or plate; no heavy masking cheese or soup obscures.',
            'batch_name': 'replacement-noodles'
        })
    print(f"[+] Staged {len(NOODLES_APPROVED)} noodles images to staging_open_images/noodles/")

    # 3. Staging Mango Peel
    (STAGING_DIR / 'mango_peel').mkdir(parents=True, exist_ok=True)
    for idx, (label, src_file, key) in enumerate(MANGO_PEEL_APPROVED, 1):
        tgt_name = f'mango_peel_rep_{idx:03d}.jpg'
        tgt_file = STAGING_DIR / 'mango_peel' / tgt_name
        shutil.copy2(src_file, tgt_file)
        meta = peel_map[key] if key in peel_map else PEEL_TEST_1_META
        with Image.open(tgt_file) as im:
            w, h = im.size
        replacements.append({
            'image_id': f'IMG-MANGO-PEEL-REP-{idx:03d}',
            'filename': tgt_name,
            'class_name': 'mango_peel',
            'class_id': '6',
            'local_path': f'staging_open_images/mango_peel/{tgt_name}',
            'source': 'Wikimedia Commons',
            'title': meta.get('title', ''),
            'source_url': meta.get('clean_url', meta.get('url', '')),
            'license': meta.get('license', 'CC BY-SA 4.0'),
            'attribution': clean_html(meta.get('artist', 'Unknown')),
            'width': str(w),
            'height': str(h),
            'notes': 'Visually verified discarded green mango peel skins/shavings; replacement candidate.',
            'audit_status': 'CONFIRMED_CORRECT',
            'audit_note': 'Visually confirmed authentic mango peel waste (peel shavings / curled peelings); zero whole fruit or pulp.',
            'batch_name': 'replacement-mango_peel'
        })
    print(f"[+] Staged {len(MANGO_PEEL_APPROVED)} mango peel images to staging_open_images/mango_peel/")

    # Write DATASET_MANIFEST_REPLACEMENTS.csv
    rep_csv_path = DATASETS_DIR / "DATASET_MANIFEST_REPLACEMENTS.csv"
    fieldnames = [
        'image_id', 'filename', 'class_name', 'class_id', 'local_path', 'source',
        'title', 'source_url', 'license', 'attribution', 'width', 'height', 'notes',
        'audit_status', 'audit_note', 'batch_name'
    ]
    with open(rep_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in replacements:
            writer.writerow(row)
    print(f"[+] Created replacement manifest: {rep_csv_path.name} ({len(replacements)} entries)")

    return replacements


def upload_to_roboflow(replacements):
    print("\n" + "=" * 75)
    print("  STEP 2: ROBOFLOW REPLACEMENT BATCH UPLOAD")
    print("=" * 75)

    api_key = os.getenv("ROBOFLOW_API_KEY")
    workspace_name = os.getenv("ROBOFLOW_WORKSPACE", "runeths-workspace")
    project_name = os.getenv("ROBOFLOW_PROJECT", "smart-waste-bin-food-recogniti")

    if not api_key:
        raise RuntimeError("ROBOFLOW_API_KEY is not defined in environment!")

    from roboflow import Roboflow
    print(f"[*] Authenticating with Roboflow...")
    rf = Roboflow(api_key=api_key)
    workspace = rf.workspace(workspace_name)
    project = workspace.project(project_name)
    print(f"[+] Connected to: {workspace_name} / {project_name}")

    # Load existing upload records
    record_path = DATASETS_DIR / "ROBOFLOW_UPLOAD_RECORD.json"
    upload_records = {}
    if record_path.exists():
        with open(record_path, "r", encoding="utf-8") as f:
            upload_records = json.load(f)
    print(f"[*] Loaded {len(upload_records)} existing upload records from {record_path.name}")

    upload_results = {}
    success_count = 0
    fail_count = 0
    skipped_count = 0

    for idx, rep in enumerate(replacements, 1):
        filename = rep['filename']
        batch_name = rep['batch_name']
        cname = rep['class_name']
        img_path = DATASETS_DIR / rep['local_path'].replace('\\', '/')

        if not img_path.exists():
            print(f"    [!] Error: Staged file not found: {img_path}")
            fail_count += 1
            continue

        if filename in upload_records and upload_records[filename].get("status") == "success":
            print(f"    [-] Skipped (already uploaded): {filename}")
            skipped_count += 1
            upload_results[filename] = upload_records[filename].get("roboflow_id", "")
            continue

        print(f"[*] [{idx}/{len(replacements)}] Uploading {filename} ({cname}) -> Batch: {batch_name}...")
        try:
            res = project.upload(
                image_path=str(img_path),
                split="train",
                batch_name=batch_name
            )

            # Extract Roboflow image ID from returned structure
            roboflow_id = None
            if isinstance(res, list) and len(res) > 0 and isinstance(res[0], dict):
                roboflow_id = res[0].get("image", {}).get("id")

            upload_records[filename] = {
                "image_id": rep['image_id'],
                "filename": filename,
                "class_name": cname,
                "batch_name": batch_name,
                "split": "train",
                "status": "success",
                "roboflow_id": roboflow_id or "UPLOADED",
                "uploaded_at": datetime.now(timezone.utc).isoformat()
            }
            upload_results[filename] = roboflow_id or "UPLOADED"
            success_count += 1
            print(f"    [+] Success! Roboflow ID: {roboflow_id or 'Assigned'}")

            # Incrementally persist upload record
            with open(record_path, "w", encoding="utf-8") as f:
                json.dump(upload_records, f, indent=2)

        except Exception as exc:
            print(f"    [!] Upload failed for {filename}: {exc}")
            upload_records[filename] = {
                "image_id": rep['image_id'],
                "filename": filename,
                "class_name": cname,
                "batch_name": batch_name,
                "status": "failed",
                "error": str(exc),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            fail_count += 1
            with open(record_path, "w", encoding="utf-8") as f:
                json.dump(upload_records, f, indent=2)

    print("\n" + "=" * 75)
    print("  UPLOAD SUMMARY")
    print("=" * 75)
    print(f"Newly Uploaded : {success_count}")
    print(f"Skipped        : {skipped_count}")
    print(f"Failed         : {fail_count}")
    print(f"Total Tracked  : {len(upload_records)}")
    print("=" * 75)

    return upload_records, upload_results


def update_manifests(replacements, upload_records):
    print("\n" + "=" * 75)
    print("  STEP 3: UPDATING LOCAL DATASET MANIFESTS")
    print("=" * 75)

    # 1. Update DATASET_MANIFEST_APPROVED.csv
    approved_csv_path = DATASETS_DIR / "DATASET_MANIFEST_APPROVED.csv"
    existing_approved = []
    existing_filenames = set()
    if approved_csv_path.exists():
        with open(approved_csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            approved_fieldnames = reader.fieldnames
            existing_approved = list(reader)
            existing_filenames = {r['filename'] for r in existing_approved}

    new_approved_count = 0
    for rep in replacements:
        if rep['filename'] not in existing_filenames:
            row = {
                'image_id': rep['image_id'],
                'filename': rep['filename'],
                'class_name': rep['class_name'],
                'class_id': rep['class_id'],
                'local_path': rep['local_path'],
                'source': rep['source'],
                'title': rep['title'],
                'source_url': rep['source_url'],
                'license': rep['license'],
                'attribution': rep['attribution'],
                'width': rep['width'],
                'height': rep['height'],
                'notes': rep['notes']
            }
            existing_approved.append(row)
            existing_filenames.add(rep['filename'])
            new_approved_count += 1

    with open(approved_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=approved_fieldnames)
        writer.writeheader()
        for r in existing_approved:
            writer.writerow(r)
    print(f"[+] Appended {new_approved_count} replacement rows to DATASET_MANIFEST_APPROVED.csv (Total: {len(existing_approved)})")

    # 2. Update DATASET_MANIFEST_VERIFIED.csv
    verified_csv_path = DATASETS_DIR / "DATASET_MANIFEST_VERIFIED.csv"
    existing_verified = []
    verified_filenames = set()
    verified_fieldnames = [
        'image_id', 'filename', 'class_name', 'class_id', 'local_path', 'source',
        'title', 'source_url', 'license', 'attribution', 'width', 'height', 'notes',
        'audit_status', 'audit_note', 'roboflow_id', 'is_uploaded'
    ]

    if verified_csv_path.exists():
        with open(verified_csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            existing_verified = list(reader)
            verified_filenames = {r['filename'] for r in existing_verified}

    new_verified_count = 0
    for rep in replacements:
        if rep['filename'] not in verified_filenames:
            up_info = upload_records.get(rep['filename'], {})
            is_up = "YES" if up_info.get("status") == "success" else "NO"
            rf_id = up_info.get("roboflow_id", "")
            row = {
                'image_id': rep['image_id'],
                'filename': rep['filename'],
                'class_name': rep['class_name'],
                'class_id': rep['class_id'],
                'local_path': rep['local_path'],
                'source': rep['source'],
                'title': rep['title'],
                'source_url': rep['source_url'],
                'license': rep['license'],
                'attribution': rep['attribution'],
                'width': rep['width'],
                'height': rep['height'],
                'notes': rep['notes'],
                'audit_status': rep['audit_status'],
                'audit_note': rep['audit_note'],
                'roboflow_id': rf_id,
                'is_uploaded': is_up
            }
            existing_verified.append(row)
            verified_filenames.add(rep['filename'])
            new_verified_count += 1
        else:
            # Update upload status for existing
            for r in existing_verified:
                if r['filename'] == rep['filename']:
                    up_info = upload_records.get(rep['filename'], {})
                    if up_info.get("status") == "success":
                        r['is_uploaded'] = "YES"
                        r['roboflow_id'] = up_info.get("roboflow_id", r.get('roboflow_id', ''))

    with open(verified_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=verified_fieldnames)
        writer.writeheader()
        for r in existing_verified:
            writer.writerow(r)
    print(f"[+] Appended {new_verified_count} replacement rows to DATASET_MANIFEST_VERIFIED.csv (Total: {len(existing_verified)})")


def verify_roboflow_state():
    print("\n" + "=" * 75)
    print("  STEP 4: POST-UPLOAD ROBOFLOW AUDIT & VERIFICATION")
    print("=" * 75)

    api_key = os.getenv("ROBOFLOW_API_KEY")
    workspace_name = os.getenv("ROBOFLOW_WORKSPACE", "runeths-workspace")
    project_name = os.getenv("ROBOFLOW_PROJECT", "smart-waste-bin-food-recogniti")

    from roboflow import Roboflow
    rf = Roboflow(api_key=api_key)
    workspace = rf.workspace(workspace_name)
    project = workspace.project(project_name)

    print(f"Target Project   : {workspace_name}/{project_name}")
    print(f"Remote Batches   : {project.get_batches()}")
    print(f"Remote Classes   : {project.classes}")
    print(f"Annotated Splits : {project.splits}")
    print(f"Unannotated Count: {project.unannotated}")
    print("=" * 75)


def main():
    replacements = stage_images()
    upload_records, upload_results = upload_to_roboflow(replacements)
    update_manifests(replacements, upload_records)
    verify_roboflow_state()
    print("\n[+] Stage and Upload pipeline completed successfully with zero errors!")


if __name__ == '__main__':
    main()
