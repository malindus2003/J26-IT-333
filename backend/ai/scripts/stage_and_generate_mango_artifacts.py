#!/usr/bin/env python3
"""
Stage Accepted Additional Mango Images and Generate Manifest and Contact Sheets
SLIIT IT4010 Research Project 2026 (Group J26-IT-333) - Component 4
"""

import sys
import json
import shutil
import csv
import re
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parents[1]
DATASETS_DIR = CURRENT_DIR.parent / "datasets"
CAND_DIR = DATASETS_DIR / "candidates_additional"
STAGING_DIR = DATASETS_DIR / "staging_open_images"

FLESH_CAND_DIR = CAND_DIR / "mango_flesh"
PEEL_CAND_DIR = CAND_DIR / "mango_peel"
BULACAN_DIR = CAND_DIR / "bulacan_test"

FLESH_STAGING_DIR = STAGING_DIR / "mango_flesh"
PEEL_STAGING_DIR = STAGING_DIR / "mango_peel"

FLESH_STAGING_DIR.mkdir(parents=True, exist_ok=True)
PEEL_STAGING_DIR.mkdir(parents=True, exist_ok=True)

# 25 Verified flesh candidates
FLESH_SELECTION = [
    ('cand_mango_flesh_001.jpg', "Visually verified sliced mango flesh on floral plate; zero skin or stone."),
    ('cand_mango_flesh_002.jpg', "Visually verified mango slices and cut halves held in hand on plate."),
    ('cand_mango_flesh_003.jpg', "Visually verified scored/cubed mango half held in hand."),
    ('cand_mango_flesh_004.jpg', "Visually verified cut ripe mango halves held in hand."),
    ('cand_mango_flesh_008.jpg', "Visually verified bowl of diced mango chunks/cubes held in hand."),
    ('cand_mango_flesh_018.jpg', "Visually verified transversal cut cross-section of ripe mango flesh."),
    ('cand_mango_flesh_020.jpg', "Visually verified carved mango blossom on stick street food."),
    ('cand_mango_flesh_023.jpg', "Visually verified whole peeled ripe mangoes in blue basket."),
    ('cand_mango_flesh_024.jpg', "Visually verified hedgehog/scored mango half against dark background."),
    ('cand_mango_flesh_026.jpg', "Visually verified Dasheri sliced mango flesh arranged on white plate."),
    ('cand_mango_flesh_028.jpg', "Visually verified cut ripe mango half held in hand over garden."),
    ('cand_mango_flesh_030.jpg', "Visually verified three ripe cut mango pieces held in hand."),
    ('cand_mango_flesh_031.jpg', "Visually verified scored mango half over concrete patio surface."),
    ('cand_mango_flesh_035.jpg', "Visually verified ripe cut mango halves arranged on banana leaf."),
    ('cand_mango_flesh_036.jpg', "Visually verified juicy sliced mango half held in hand."),
    ('cand_mango_flesh_038.jpg', "Visually verified ripe cut mango halves in clear plastic packaging."),
    ('cand_mango_flesh_039.jpg', "Visually verified sliced mango pieces on white serving plate."),
    ('cand_mango_flesh_040.jpg', "Visually verified sliced mango pieces on plate against stone wall."),
    ('cand_mango_flesh_044.jpg', "Visually verified mango slices arranged in petal pattern on plate."),
    ('cand_mango_flesh_045.jpg', "Visually verified close-up view of fresh Himsagar mango slices."),
    ('cand_mango_flesh_046.jpg', "Visually verified fresh mango cut pieces at street vendor stall."),
    ('cand_mango_flesh_047.jpg', "Visually verified raw green mango slices on kitchen cutting surface."),
    ('cand_mango_flesh_050.jpg', "Visually verified cut green mango pieces with chili seasoning in pan."),
    ('cand_mango_flesh_051.jpg', "Visually verified two cut ripe mango halves on plate against greenery."),
    ('cand_mango_flesh_059.jpg', "Visually verified Alphonso mango cut half with spongy seed in metal pan.")
]

# 5 Verified peel candidates
PEEL_SELECTION = [
    (
        PEEL_CAND_DIR / 'Mosca_en_una_cascara_de_mango.jpg',
        'File:Mosca en una cascara de mango.JPG',
        'https://upload.wikimedia.org/wikipedia/commons/f/f3/Mosca_en_una_cascara_de_mango.JPG',
        'https://commons.wikimedia.org/wiki/File:Mosca_en_una_cascara_de_mango.JPG',
        'CC BY-SA 4.0',
        'EEIM',
        'Visually verified authentic discarded mango peel lying on ground with fly; zero intact fruit.'
    ),
    (
        BULACAN_DIR / '775Cuisine_foods_of_Bulacan_20.jpg',
        'File:775Cuisine foods of Bulacan 20.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/8/89/775Cuisine_foods_of_Bulacan_20.jpg',
        'https://commons.wikimedia.org/wiki/File:775Cuisine_foods_of_Bulacan_20.jpg',
        'CC0',
        'Judgefloro',
        'Visually verified authentic discarded mango peel shavings/strips held in hand against greenery.'
    ),
    (
        BULACAN_DIR / '775Cuisine_foods_of_Bulacan_22.jpg',
        'File:775Cuisine foods of Bulacan 22.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/1/15/775Cuisine_foods_of_Bulacan_22.jpg',
        'https://commons.wikimedia.org/wiki/File:775Cuisine_foods_of_Bulacan_22.jpg',
        'CC0',
        'Judgefloro',
        'Visually verified authentic discarded mango peel shavings/strips held in hand against stone wall.'
    ),
    (
        BULACAN_DIR / '775Cuisine_foods_of_Bulacan_21.jpg',
        'File:775Cuisine foods of Bulacan 21.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/4/4b/775Cuisine_foods_of_Bulacan_21.jpg',
        'https://commons.wikimedia.org/wiki/File:775Cuisine_foods_of_Bulacan_21.jpg',
        'CC0',
        'Judgefloro',
        'Visually verified authentic discarded mango peel shavings/strips held in hand against greenery (alternate angle).'
    ),
    (
        BULACAN_DIR / '775Cuisine_foods_of_Bulacan_23.jpg',
        'File:775Cuisine foods of Bulacan 23.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/6/6f/775Cuisine_foods_of_Bulacan_23.jpg',
        'https://commons.wikimedia.org/wiki/File:775Cuisine_foods_of_Bulacan_23.jpg',
        'CC0',
        'Judgefloro',
        'Visually verified authentic discarded mango peel shavings/strips held in hand against stone wall (alternate angle).'
    )
]

def clean_html(text: str) -> str:
    if not text:
        return "Unknown"
    clean = re.sub(r'<[^>]+>', '', text).strip()
    return clean or "Unknown"

# Load flesh metadata
with open(FLESH_CAND_DIR / "candidates_metadata.json", "r", encoding="utf-8") as f:
    flesh_meta_items = json.load(f)
flesh_meta_map = {it["local_filename"]: it for it in flesh_meta_items}

manifest_rows = []

# Stage Flesh
print("=== STAGING MANGO FLESH (25 IMAGES) ===")
for idx, (orig_fn, outcome) in enumerate(FLESH_SELECTION, 1):
    src = FLESH_CAND_DIR / orig_fn
    staged_fn = f"mango_flesh_add_{idx:03d}.jpg"
    dest = FLESH_STAGING_DIR / staged_fn
    shutil.copy2(src, dest)

    meta = flesh_meta_map[orig_fn]
    with Image.open(dest) as im:
        w, h = im.size

    title_clean = meta["title"].replace("File:", "")
    source_page = f"https://commons.wikimedia.org/wiki/{meta['title'].replace(' ', '_')}"

    row = {
        "image_id": f"IMG-MANGO-FLESH-ADD-{idx:03d}",
        "filename": staged_fn,
        "intended_class": "mango_flesh",
        "class_id": 7,
        "local_path": f"staging_open_images/mango_flesh/{staged_fn}",
        "source": "Wikimedia Commons",
        "title": meta["title"],
        "source_page_url": source_page,
        "image_url": meta["clean_url"],
        "creator": clean_html(meta.get("artist", "Unknown")),
        "attribution": f"{clean_html(meta.get('artist', 'Unknown'))} via Wikimedia Commons ({meta['license']})",
        "license": meta["license"],
        "width": w,
        "height": h,
        "visual_review_outcome": f"CONFIRMED_ACCEPTED: {outcome}",
        "batch_name": "additional-mango_flesh"
    }
    manifest_rows.append(row)
    print(f"  [+] Staged #{idx:02d}: {staged_fn} ({w}x{h}) <- {orig_fn}")

# Stage Peel
print("\n=== STAGING MANGO PEEL (5 IMAGES) ===")
for idx, (src_path, title, img_url, page_url, lic, artist, outcome) in enumerate(PEEL_SELECTION, 1):
    staged_fn = f"mango_peel_add_{idx:03d}.jpg"
    dest = PEEL_STAGING_DIR / staged_fn
    shutil.copy2(src_path, dest)

    with Image.open(dest) as im:
        w, h = im.size

    row = {
        "image_id": f"IMG-MANGO-PEEL-ADD-{idx:03d}",
        "filename": staged_fn,
        "intended_class": "mango_peel",
        "class_id": 6,
        "local_path": f"staging_open_images/mango_peel/{staged_fn}",
        "source": "Wikimedia Commons",
        "title": title,
        "source_page_url": page_url,
        "image_url": img_url,
        "creator": clean_html(artist),
        "attribution": f"{clean_html(artist)} via Wikimedia Commons ({lic})",
        "license": lic,
        "width": w,
        "height": h,
        "visual_review_outcome": f"CONFIRMED_ACCEPTED: {outcome}",
        "batch_name": "additional-mango_peel"
    }
    manifest_rows.append(row)
    print(f"  [+] Staged #{idx:02d}: {staged_fn} ({w}x{h}) <- {src_path.name}")

# Write Manifest CSV
manifest_path = DATASETS_DIR / "DATASET_MANIFEST_ADDITIONAL_MANGO.csv"
fieldnames = [
    "image_id", "filename", "intended_class", "class_id", "local_path",
    "source", "title", "source_page_url", "image_url", "creator",
    "attribution", "license", "width", "height", "visual_review_outcome", "batch_name"
]

with open(manifest_path, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(manifest_rows)

print(f"\n[+] Wrote {len(manifest_rows)} rows to {manifest_path}")

# Generate Contact Sheets
print("\n=== GENERATING CONTACT SHEETS ===")

def create_contact_sheet(image_rows, out_file, title_text, cols=5, thumb_size=320, label_h=55):
    rows = math.ceil(len(image_rows) / cols)
    header_h = 60
    total_w = cols * thumb_size
    total_h = header_h + rows * (thumb_size + label_h)

    sheet = Image.new("RGB", (total_w, total_h), (25, 25, 30))
    draw = ImageDraw.Draw(sheet)

    # Title header
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(40, 45, 60))
    draw.text((20, 18), title_text, fill=(255, 255, 255))

    for idx, r in enumerate(image_rows):
        c = idx % cols
        row_idx = idx // cols
        x = c * thumb_size
        y = header_h + row_idx * (thumb_size + label_h)

        img_p = DATASETS_DIR / r["local_path"]
        if img_p.exists():
            with Image.open(img_p) as im:
                im = im.convert("RGB")
                im.thumbnail((thumb_size - 10, thumb_size - 10))
                ox = (thumb_size - im.width) // 2
                oy = (thumb_size - 10 - im.height) // 2
                sheet.paste(im, (x + ox, y + 5 + oy))

        # Card border
        draw.rectangle([(x + 2, y + 2), (x + thumb_size - 2, y + thumb_size + label_h - 2)], outline=(60, 65, 80), width=1)

        # Label area
        draw.rectangle([(x + 2, y + thumb_size), (x + thumb_size - 2, y + thumb_size + label_h - 2)], fill=(35, 38, 48))
        draw.text((x + 8, y + thumb_size + 4), f"{r['filename']} ({r['width']}x{r['height']})", fill=(240, 240, 240))
        draw.text((x + 8, y + thumb_size + 20), f"Lic: {r['license']} | {r['creator'][:18]}", fill=(180, 210, 255))
        draw.text((x + 8, y + thumb_size + 36), r['title'].replace('File:', '')[:26], fill=(160, 160, 160))

    sheet.save(out_file, "JPEG", quality=90)
    print(f"[+] Saved contact sheet: {out_file} ({sheet.width}x{sheet.height})")

# Contact sheet for flesh
flesh_rows = [r for r in manifest_rows if r["intended_class"] == "mango_flesh"]
flesh_sheet_path = DATASETS_DIR / "contact_sheet_mango_flesh.jpg"
create_contact_sheet(
    flesh_rows,
    flesh_sheet_path,
    f"Roboflow Class: mango_flesh (Target: 25 | Accepted: 25 | Visual Verified & Open Licensed)",
    cols=5,
    thumb_size=320
)

# Contact sheet for peel
peel_rows = [r for r in manifest_rows if r["intended_class"] == "mango_peel"]
peel_sheet_path = DATASETS_DIR / "contact_sheet_mango_peel.jpg"
create_contact_sheet(
    peel_rows,
    peel_sheet_path,
    f"Roboflow Class: mango_peel (Target: 25 | Accepted: 5 | Shortage: 20 | Open Data Scarcity Documented)",
    cols=3,
    thumb_size=360,
    label_h=55
)

print("\n=== STEP 1-3 COMPLETE ===")
