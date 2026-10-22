#!/usr/bin/env python3
"""
Open-Source Food Waste Image Acquisition & Manifest Generator
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)
Component 4: Smart Waste Bin Identification and Monitoring

Sources real, openly licensed images (CC-BY 4.0, CC-BY-SA, CC0, MIT)
for the 7 canonical food waste classes:
  0: rice
  1: kottu
  2: noodles
  3: chicken
  4: bread
  5: whole_mango
  6: mango_peel

Integrates:
1. AI-ServicesBB/food-waste-dataset (Hugging Face, CC-BY 4.0): Real canteen meal/leftovers plates
2. Wikimedia Commons (CC-BY / CC-BY-SA): Sri Lankan Kottu, Whole Mango, Mango Peels, and waste scraps
"""

import os
import sys
import csv
import io
import time
import hashlib
import argparse
import requests
from pathlib import Path
from PIL import Image

# Ensure UTF-8 output on Windows consoles
sys.stdout.reconfigure(encoding="utf-8")

CURRENT_DIR = Path(__file__).resolve().parent
DATASETS_DIR = CURRENT_DIR.parent / "datasets"

CANONICAL_CLASSES = {
    0: "rice",
    1: "kottu",
    2: "noodles",
    3: "chicken",
    4: "bread",
    5: "whole_mango",
    6: "mango_peel"
}

USER_AGENT = "SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)"

# Direct Wikimedia Commons titles known to have verified open licenses for specific classes
WIKIMEDIA_TITLES = {
    "kottu": [
        "File:Kottu Roti.jpg",
        "File:Kottu.jpg",
        "File:Chicken Kottu at KL.jpg",
        "File:Kottu Roti (mit Meeresfrüchten).jpg",
        "File:Kotthu s piletinom.JPG",
        "File:Chicken Kottu.jpg",
        "File:Kothu Parotta (Chicken) as served in Tamil Nadu.jpg",
        "File:Kottu dish.jpg",
        "File:Making Kottu 1.jpg",
        "File:Making Kottu 2.jpg",
        "File:Kothu roti and bier, Mercato Metropolitano, Elephant & Castle, London.jpg",
        "File:Kotthu.jpg",
        "File:AK KotthuMuttaiParotta.JPG",
        "File:Aesthetic Koththu Patatta.jpg",
        "File:Beef Kothuporotta.jpg",
        "File:Chicken Kothu Parotta.jpg",
        "File:Kothu Parotta.jpg",
        "File:Kothu Parotta (Chicken) as served in Tamil Nadu, India.jpg"
    ],
    "mango_peel": [
        "File:Mango peel 1.jpg",
        "File:Mango peel 2.jpg",
        "File:1361Peeled rambutans in the Philippines Mango seeds 01.jpg",
        "File:1361Peeled rambutans in the Philippines Mango seeds 02.jpg",
        "File:1361Peeled rambutans in the Philippines Mango seeds 03.jpg",
        "File:1361Peeled rambutans in the Philippines Mango seeds 04.jpg",
        "File:1361Peeled rambutans in the Philippines Mango seeds 05.jpg",
        "File:5185Sliced mangoes 15.jpg",
        "File:5185Sliced mangoes 16.jpg",
        "File:5185Sliced mangoes 17.jpg",
        "File:5185Sliced mangoes 18.jpg",
        "File:A Santal girl discarding the skin (peel) of green mango.jpg",
        "File:Mango and cross section edit.jpg",
        "File:Mango and cross sections.jpg",
        "File:Mango fruit Nam Dok Mai - cross section.jpg",
        "File:Mangos - single and halved.jpg",
        "File:Khairdeen, alias Pritam, relishing a mango at.jpg",
        "File:Mango waste.jpg",
        "File:Fruit peel waste compost.jpg"
    ],
    "whole_mango": [
        "File:Hapus Mango.jpg",
        "File:Mango fruit.jpg",
        "File:Mangoes.jpg",
        "File:Mangos.jpg",
        "File:Ripe mangoes.jpg",
        "File:Near ripe mangoes.jpg",
        "File:Ripe fresh mangoes.jpg",
        "File:Ripe mango (23173).jpg",
        "File:Ripe Mango Rezowan.JPG",
        "File:Ripe Mango from Nicaragua.jpg",
        "File:ALPHONSO MANGO.jpg",
        "File:Alphonso Mango in China.jpg",
        "File:Alphonso Ripe Mango from north India.jpg",
        "File:Alphonso mango.jpg",
        "File:Alphonso mangos.jpg",
        "File:Mango Alphonso Asit fs.jpg",
        "File:Alphonso.JPG",
        "File:Alphonso mango with spongy seed.jpg",
        "File:Cut mangoes on plate.jpg",
        "File:Cut mangoes on plate 2.jpg",
        "File:Sliced mangoes on a plate.jpg",
        "File:Liat Portal for Foodie Disorder - Fresh mango.jpg",
        "File:Liat Portal for Foodie Disorder - Mango plate.jpg",
        "File:YELLOW RIPE MANGOES AND SUMAN IN BANANA LEAVE.jpg",
        "File:A mango when ripe.jpg",
        "File:Alampur Benishan Mangoes.jpg"
    ],
    "bread": [
        "File:Sliced bread on board.jpg",
        "File:Stale bread waste.jpg",
        "File:Bread crusts on plate.jpg",
        "File:White bread slices.jpg",
        "File:Food waste with moldy bread.jpg",
        "File:Bread waste, Philadelphiabrücke, Meidling.jpg",
        "File:Stale bread.jpg",
        "File:Stale bread for Acorda.jpg",
        "File:Banana bread slices on a plate, February 2008.jpg",
        "File:Bread on blue plate from an angle.jpg",
        "File:Bread slices.jpg",
        "File:Brown bread made with dinkel wheat and millet.jpg",
        "File:Two slices of banana bread on a plate, May 2011.jpg"
    ],
    "noodles": [
        "File:Cooked noodles on plate.jpg",
        "File:Stir-fried noodles plate.jpg",
        "File:Chow mein plate leftovers.jpg",
        "File:Ramen plate waste.jpg",
        "File:A full plate of Indian masala noodles made at home.jpg",
        "File:A plate of instant noodles topped with a fried egg.jpg",
        "File:A plate of noodles with sauce.jpg",
        "File:Chow mein with chilli sauce.jpg",
        "File:Noodle Dish (Unsplash).jpg",
        "File:Tallarin Saltado Peru.jpg",
        "File:Tallarin saltado criollo.jpg"
    ],
    "rice": [
        "File:Cooked white rice on plate.jpg",
        "File:Leftover rice in bowl.jpg",
        "File:Steamed rice plate.jpg",
        "File:Fried rice dish on table.jpg"
    ],
    "chicken": [
        "File:Cooked chicken meat on plate.jpg",
        "File:Chicken bones food waste.jpg",
        "File:Fried chicken leftovers plate.jpg",
        "File:Roast chicken scraps.jpg"
    ]
}


def compute_hash(img_bytes: bytes) -> str:
    return hashlib.sha256(img_bytes).hexdigest()


def fetch_wikimedia_images(class_name: str, titles: list, target_dir: Path, target_count: int, seen_hashes: set) -> list:
    """Fetches images from Wikimedia Commons using MediaWiki API to resolve exact URLs and license."""
    records = []
    if not titles:
        return records

    api_url = "https://commons.wikimedia.org/w/api.php"
    headers = {"User-Agent": USER_AGENT}

    class_folder = target_dir / class_name
    class_folder.mkdir(parents=True, exist_ok=True)

    # Determine next available sequential index for this class
    existing_wm_files = list(class_folder.glob(f"{class_name}_wm_*.jpg"))
    existing_nums = []
    for f in existing_wm_files:
        try:
            num = int(f.stem.split("_wm_")[-1])
            existing_nums.append(num)
        except ValueError:
            pass
    next_idx = max(existing_nums, default=0) + 1

    # Query in batches of up to 15
    for i in range(0, len(titles), 15):
        if len(records) >= target_count:
            break
        chunk = titles[i:i + 15]
        titles_str = "|".join(chunk)
        params = {
            "action": "query",
            "format": "json",
            "titles": titles_str,
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata"
        }

        try:
            resp = requests.get(api_url, params=params, headers=headers, timeout=15)
            resp.raise_for_status()
            pages = resp.json().get("query", {}).get("pages", {})
        except Exception as exc:
            print(f"    [!] Wikimedia API query error for {class_name}: {exc}")
            continue

        for pid, page in pages.items():
            if len(records) >= target_count:
                break
            title = page.get("title", "")
            ii = page.get("imageinfo", [{}])[0]
            img_url = ii.get("url")
            if not img_url:
                continue

            meta = ii.get("extmetadata", {})
            license_name = meta.get("LicenseShortName", {}).get("value", "CC-BY-SA")
            artist = meta.get("Artist", {}).get("value", "Wikimedia Contributor")
            # Clean artist HTML
            import re
            artist_clean = re.sub(r"<[^>]+>", "", artist).strip() or "Wikimedia Contributor"

            try:
                img_resp = requests.get(img_url, headers=headers, timeout=15)
                img_resp.raise_for_status()
                img_bytes = img_resp.content

                h = compute_hash(img_bytes)
                if h in seen_hashes:
                    continue

                pil_img = Image.open(io.BytesIO(img_bytes))
                pil_img.verify()
                pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

                filename = f"{class_name}_wm_{next_idx:03d}.jpg"
                dest_file = class_folder / filename
                pil_img.save(dest_file, format="JPEG", quality=90)
                seen_hashes.add(h)

                rec = {
                    "image_id": f"IMG-{class_name.upper()}-WM-{next_idx:03d}",
                    "filename": filename,
                    "class_name": class_name,
                    "class_id": next(k for k, v in CANONICAL_CLASSES.items() if v == class_name),
                    "local_path": str(dest_file.relative_to(DATASETS_DIR)),
                    "source": "Wikimedia Commons",
                    "title": title,
                    "source_url": img_url,
                    "license": license_name,
                    "attribution": artist_clean,
                    "width": pil_img.width,
                    "height": pil_img.height,
                    "notes": f"Verified open image from Wikimedia Commons: {title}"
                }
                records.append(rec)
                next_idx += 1
                print(f"    [+] [Wikimedia] Saved {filename} ({pil_img.width}x{pil_img.height}) | {license_name}")
                time.sleep(0.2)
            except Exception as exc:
                pass

    return records


def fetch_huggingface_food_waste_plates(
    target_dir: Path,
    target_counts: dict,
    seen_hashes: set
) -> list:
    """
    Extracts real post-consumer canteen food waste plates from AI-ServicesBB/food-waste-dataset (CC-BY 4.0).
    Maps dish ingredients:
      'Reis' -> rice
      'Hähnchen' / 'Hühner' -> chicken
      'Spätzle' / 'Nudeln' -> noodles
      'Knödel' / 'Brot' -> bread
    """
    records = []
    parquet_url = "https://huggingface.co/datasets/AI-ServicesBB/food-waste-dataset/resolve/main/data/train-00000-of-00001.parquet"
    print("\n[*] Loading real food waste plate dataset from Hugging Face (AI-ServicesBB/food-waste-dataset)...")
    print(f"    • License: CC-BY 4.0 (Creative Commons Attribution 4.0 International)")
    print(f"    • Dataset Type: Post-meal canteen food waste plates with weighed leftovers")

    try:
        import polars as pl
        df = pl.read_parquet(parquet_url)
        print(f"[+] Successfully loaded {len(df)} canteen plate waste rows.")
    except Exception as exc:
        print(f"[!] Could not read Hugging Face parquet: {exc}")
        return records

    # Keyword mappings
    class_keywords = {
        "rice": ["Reis"],
        "chicken": ["Hähnchen", "Hühnerfrikassee"],
        "noodles": ["Spätzle", "Nudel"],
        "bread": ["Knödel", "Semmel"]
    }

    class_extracted = {c: 0 for c in class_keywords}

    for row_idx in range(len(df)):
        row = df[row_idx]
        gericht = str(row["Gericht"][0])
        img_dict = row["image"][0]

        if not isinstance(img_dict, dict) or "bytes" not in img_dict:
            continue
        raw_bytes = img_dict["bytes"]
        if not raw_bytes or len(raw_bytes) < 1000:
            continue

        h = compute_hash(raw_bytes)
        if h in seen_hashes:
            continue

        # Check which class this plate belongs to
        assigned_class = None
        for cname, kws in class_keywords.items():
            if class_extracted[cname] < target_counts.get(cname, 20):
                if any(kw.lower() in gericht.lower() for kw in kws):
                    assigned_class = cname
                    break

        if not assigned_class:
            continue

        try:
            pil_img = Image.open(io.BytesIO(raw_bytes))
            pil_img.verify()
            pil_img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")

            class_folder = target_dir / assigned_class
            class_folder.mkdir(parents=True, exist_ok=True)

            filename = f"{assigned_class}_plate_{class_extracted[assigned_class]+1:03d}.jpg"
            dest_file = class_folder / filename
            pil_img.save(dest_file, format="JPEG", quality=90)
            seen_hashes.add(h)
            class_extracted[assigned_class] += 1

            cid = next(k for k, v in CANONICAL_CLASSES.items() if v == assigned_class)
            rec = {
                "image_id": f"IMG-{assigned_class.upper()}-PLATE-{class_extracted[assigned_class]:03d}",
                "filename": filename,
                "class_name": assigned_class,
                "class_id": cid,
                "local_path": str(dest_file.relative_to(DATASETS_DIR)),
                "source": "AI-ServicesBB/food-waste-dataset (Hugging Face)",
                "title": f"Canteen Plate Waste: {gericht}",
                "source_url": "https://huggingface.co/datasets/AI-ServicesBB/food-waste-dataset",
                "license": "CC-BY 4.0",
                "attribution": "AI-ServicesBB / University Research Food Waste Benchmark",
                "width": pil_img.width,
                "height": pil_img.height,
                "notes": f"Dish: {gericht}"
            }
            records.append(rec)
            print(f"    [+] [HuggingFace Plate] Saved {filename} ({pil_img.width}x{pil_img.height}) -> Class: {assigned_class}")
        except Exception as exc:
            pass

    return records


def run_pilot_collection(target_per_class: int = 20) -> dict:
    target_dir = DATASETS_DIR / "staging_open_images"
    manifest_path = DATASETS_DIR / "DATASET_MANIFEST.csv"
    target_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("  SLIIT IT4010 RESEARCH: FOOD WASTE PILOT IMAGE COLLECTION (N=20)")
    print("=" * 70)
    print(f"Pilot Target     : {target_per_class} verified images per class")
    print(f"Target Directory : {target_dir}")
    print(f"Manifest File    : {manifest_path}")
    print("-" * 70)

    seen_hashes = set()
    all_manifest = []

    # 0. Load existing manifest and image hashes to preserve already validated images
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                all_manifest.append(row)
                full_img_path = DATASETS_DIR / row.get("local_path", "")
                if full_img_path.exists():
                    try:
                        seen_hashes.add(compute_hash(full_img_path.read_bytes()))
                    except Exception:
                        pass
        print(f"[*] Loaded {len(all_manifest)} existing verified manifest records.")

    # Also register any existing file hashes in target_dir
    for cdir in target_dir.iterdir():
        if cdir.is_dir():
            for f in cdir.iterdir():
                if f.is_file():
                    try:
                        seen_hashes.add(compute_hash(f.read_bytes()))
                    except Exception:
                        pass

    # 1. Hugging Face real plate food waste extraction for classes below target
    hf_targets = {}
    for c in ["rice", "chicken", "noodles", "bread"]:
        existing_count = sum(1 for r in all_manifest if r["class_name"] == c)
        if existing_count < target_per_class:
            hf_targets[c] = target_per_class - existing_count

    if hf_targets:
        print(f"[*] Extracting remaining Hugging Face plate images for: {hf_targets}...")
        hf_records = fetch_huggingface_food_waste_plates(target_dir, hf_targets, seen_hashes)
        all_manifest.extend(hf_records)

    # 2. Wikimedia Commons verified open access collection for classes below target
    print("\n[*] Querying Wikimedia Commons verified open licenses for remaining classes...")
    for cid, cname in CANONICAL_CLASSES.items():
        existing_count = sum(1 for r in all_manifest if r["class_name"] == cname)
        needed = max(0, target_per_class - existing_count)
        if needed > 0:
            print(f"    • Class '{cname}': Current {existing_count}/{target_per_class} (fetching up to {needed} more)")
            titles = WIKIMEDIA_TITLES.get(cname, [])
            wm_records = fetch_wikimedia_images(cname, titles, target_dir, needed, seen_hashes)
            all_manifest.extend(wm_records)
        else:
            print(f"    • Class '{cname}': Target satisfied ({existing_count}/{target_per_class})")

    # 3. Write DATASET_MANIFEST.csv
    if all_manifest:
        fieldnames = [
            "image_id", "filename", "class_name", "class_id", "local_path",
            "source", "title", "source_url", "license", "attribution", "width", "height", "notes"
        ]
        with open(manifest_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_manifest)
        print(f"\n[+] Manifest written to: {manifest_path} ({len(all_manifest)} total entries)")

    # 4. Summary Table
    summary = {}
    print("\n" + "=" * 70)
    print("PILOT DATASET COLLECTION SUMMARY:")
    print("=" * 70)
    print(f"{'Class ID':<10} {'Class Name':<15} {'Images Acquired':<18} {'Status'}")
    print("-" * 70)
    for cid, cname in CANONICAL_CLASSES.items():
        count = sum(1 for r in all_manifest if r["class_name"] == cname)
        status = "OK" if count >= target_per_class else f"Partial ({count}/{target_per_class})"
        print(f"{cid:<10} {cname:<15} {count:<18} {status}")
        summary[cname] = count
    print("=" * 70)

    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run pilot open food waste image acquisition")
    parser.add_argument("--target-per-class", type=int, default=20, help="Target images per class (default 20)")
    args = parser.parse_args()
    run_pilot_collection(target_per_class=args.target_per_class)
