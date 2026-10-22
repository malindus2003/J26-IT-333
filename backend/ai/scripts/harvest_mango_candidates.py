#!/usr/bin/env python3
"""
Targeted Image Harvesting Script for mango_flesh and mango_peel
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)
Component 4: AI & IoT-Based Smart Waste Bin
"""

import os
import sys
import json
import re
import io
import hashlib
import requests
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

USER_AGENT = "SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)"
API_URL = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": USER_AGENT}

CURRENT_DIR = Path(__file__).resolve().parent
DATASETS_DIR = CURRENT_DIR.parent / "datasets"
STAGING_DIR = DATASETS_DIR / "staging_open_images"
CAND_DIR = DATASETS_DIR / "candidates_additional"
CAND_DIR.mkdir(parents=True, exist_ok=True)

# Build hash index of all existing local images to prevent duplicate downloads
print("[*] Building hash index of existing local images...")
EXISTING_HASHES = set()
for p in STAGING_DIR.rglob("*.jpg"):
    try:
        EXISTING_HASHES.add(hashlib.md5(p.read_bytes()).hexdigest())
    except Exception:
        pass
for p in STAGING_DIR.rglob("*.png"):
    try:
        EXISTING_HASHES.add(hashlib.md5(p.read_bytes()).hexdigest())
    except Exception:
        pass

# Also check candidate_replacements
for p in (DATASETS_DIR / "candidate_replacements").rglob("*.jpg"):
    try:
        EXISTING_HASHES.add(hashlib.md5(p.read_bytes()).hexdigest())
    except Exception:
        pass

print(f"[+] Indexed {len(EXISTING_HASHES)} existing image hashes.")


def search_files(query: str, limit: int = 50) -> list:
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srnamespace": "6",  # File:
        "srlimit": str(limit),
        "format": "json"
    }
    try:
        r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15)
        r.raise_for_status()
        hits = r.json().get("query", {}).get("search", [])
        return [h["title"] for h in hits if h["title"].startswith("File:")]
    except Exception as e:
        print(f"[!] Search error for '{query}': {e}")
        return []


def get_category_files(cat_name: str, limit: int = 100) -> list:
    params = {
        "action": "query",
        "list": "categorymembers",
        "cmtitle": cat_name,
        "cmtype": "file",
        "cmlimit": str(limit),
        "format": "json"
    }
    try:
        r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15)
        r.raise_for_status()
        members = r.json().get("query", {}).get("categorymembers", [])
        return [m["title"] for m in members if m["title"].startswith("File:")]
    except Exception as e:
        print(f"[!] Category error for '{cat_name}': {e}")
        return []


def get_image_info(titles: list) -> dict:
    results = {}
    valid_exts = (".jpg", ".jpeg", ".png", ".webp")
    filtered_titles = [t for t in titles if t.lower().endswith(valid_exts)]

    for i in range(0, len(filtered_titles), 25):
        chunk = filtered_titles[i:i + 25]
        params = {
            "action": "query",
            "format": "json",
            "titles": "|".join(chunk),
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata"
        }
        try:
            r = requests.get(API_URL, params=params, headers=HEADERS, timeout=20)
            r.raise_for_status()
            pages = r.json().get("query", {}).get("pages", {})
            for pid, p in pages.items():
                title = p.get("title")
                if not title or "imageinfo" not in p:
                    continue
                ii = p["imageinfo"][0]
                meta = ii.get("extmetadata", {})

                desc = meta.get("ImageDescription", {}).get("value", "")
                desc_clean = re.sub(r"<[^>]+>", "", desc).strip()
                artist = meta.get("Artist", {}).get("value", "")
                artist_clean = re.sub(r"<[^>]+>", "", artist).strip() or "Wikimedia Contributor"

                lic = meta.get("LicenseShortName", {}).get("value", "")
                lic_url = meta.get("LicenseUrl", {}).get("value", "")
                url = ii.get("url")
                width = ii.get("width", 0)
                height = ii.get("height", 0)

                valid_license = any(l in lic.upper() for l in ["CC", "PUBLIC DOMAIN", "PD", "ATTRIBUTION", "ZERO", "GPL"])
                if url and valid_license and width >= 300 and height >= 300:
                    clean_url = url.split("?")[0]
                    results[title] = {
                        "title": title,
                        "url": url,
                        "clean_url": clean_url,
                        "license": lic,
                        "license_url": lic_url,
                        "artist": artist_clean,
                        "description": desc_clean,
                        "width": width,
                        "height": height
                    }
        except Exception as e:
            print(f"[!] Info error chunk: {e}")
    return results


def download_candidates(class_name: str, info_dict: dict, max_to_download: int = 50) -> list:
    out_dir = CAND_DIR / class_name
    out_dir.mkdir(parents=True, exist_ok=True)
    downloaded = []

    print(f"\n[*] Downloading up to {max_to_download} candidate images for '{class_name}'...")
    for idx, (title, meta) in enumerate(info_dict.items(), 1):
        if len(downloaded) >= max_to_download:
            break
        url = meta["url"]
        fname = f"cand_{class_name}_{len(downloaded) + 1:03d}.jpg"
        dest = out_dir / fname

        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            r.raise_for_status()
            img_bytes = r.content

            # Verify image format and integrity
            pil = Image.open(io.BytesIO(img_bytes))
            pil.verify()
            pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")

            # Check duplicate hash
            img_hash = hashlib.md5(img_bytes).hexdigest()
            if img_hash in EXISTING_HASHES:
                print(f"    [-] Skipped exact duplicate hash: {title[:40]}")
                continue

            EXISTING_HASHES.add(img_hash)
            pil.save(dest, format="JPEG", quality=92)

            meta["local_filename"] = fname
            meta["local_path"] = str(dest.relative_to(DATASETS_DIR))
            meta["md5_hash"] = img_hash
            meta["intended_class"] = class_name
            meta["actual_width"] = pil.width
            meta["actual_height"] = pil.height
            downloaded.append(meta)
            print(f"    [+] [{len(downloaded)}/{max_to_download}] Saved {fname} ({pil.width}x{pil.height}) - {title[:50]}")

        except Exception as e:
            print(f"    [!] Download failed for {title}: {e}")

    # Save candidates metadata JSON
    meta_path = out_dir / "candidates_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(downloaded, f, indent=2)
    print(f"[+] Saved {len(downloaded)} candidate metadata records to {meta_path.name}")
    return downloaded


def main():
    # =========================================================================
    # 1. HARVEST MANGO FLESH
    # =========================================================================
    print("=" * 75)
    print("  STAGE 1: SEARCHING & HARVESTING MANGO_FLESH CANDIDATES")
    print("=" * 75)

    flesh_titles = set()
    flesh_cats = [
        "Category:Sliced mangoes",
        "Category:Sliced mangoes in India",
        "Category:Scored mangoes",
        "Category:Mango porcupines",
        "Category:Cross sections of mangos",
        "Category:Peeled mangoes"
    ]
    for cat in flesh_cats:
        cat_files = get_category_files(cat, limit=100)
        print(f"  • Category '{cat}': {len(cat_files)} files")
        flesh_titles.update(cat_files)

    flesh_queries = [
        "mango slices",
        "sliced mango",
        "cut mango",
        "mango cubes",
        "mango chunks",
        "mango wedges",
        "diced mango",
        "chopped mango",
        "peeled mango",
        "mango half cut",
        "mango on cutting board",
        "cutting a mango",
        "rotten mango",
        "spoiled mango"
    ]
    for q in flesh_queries:
        hits = search_files(q, limit=40)
        print(f"  • Query '{q}': {len(hits)} hits")
        flesh_titles.update(hits)

    print(f"[+] Total unique flesh candidate titles: {len(flesh_titles)}")
    flesh_info = get_image_info(list(flesh_titles))
    print(f"[+] Validated {len(flesh_info)} flesh candidate images with open licenses.")
    flesh_downloaded = download_candidates("mango_flesh", flesh_info, max_to_download=60)

    # =========================================================================
    # 2. HARVEST MANGO PEEL
    # =========================================================================
    print("\n" + "=" * 75)
    print("  STAGE 2: SEARCHING & HARVESTING MANGO_PEEL CANDIDATES")
    print("=" * 75)

    peel_titles = set()
    peel_queries = [
        "mango peel",
        "mango peels",
        "mango skin",
        "mango skins",
        "peeling mango",
        "peeling a mango",
        "peeling mangoes",
        "mango peeler",
        "mango peeling",
        "mango peelings",
        "peeled mango skin",
        "mango rind",
        "mango rinds",
        "mango skin waste",
        "mango peel waste",
        "mango waste peel",
        "peeling green mango",
        "mango scraps",
        "compost mango",
        "mango compost",
        "mango skins discarded",
        "mango skins peeling",
        "peeling mango skin with knife",
        "peeling mango skin with peeler"
    ]
    for q in peel_queries:
        hits = search_files(q, limit=50)
        print(f"  • Query '{q}': {len(hits)} hits")
        peel_titles.update(hits)

    peel_cats = [
        "Category:Peeled mangoes",
        "Category:Peel (fruit)",
        "Category:Peeling"
    ]
    for cat in peel_cats:
        cat_files = get_category_files(cat, limit=100)
        print(f"  • Category '{cat}': {len(cat_files)} files")
        for f in cat_files:
            if any(w in f.lower() for w in ["mango", "mangga", "peel", "skin", "rind"]):
                peel_titles.add(f)

    print(f"[+] Total unique peel candidate titles: {len(peel_titles)}")
    peel_info = get_image_info(list(peel_titles))
    print(f"[+] Validated {len(peel_info)} peel candidate images with open licenses.")
    peel_downloaded = download_candidates("mango_peel", peel_info, max_to_download=60)

    print("\n" + "=" * 75)
    print("  HARVEST SUMMARY")
    print("=" * 75)
    print(f"mango_flesh candidates downloaded : {len(flesh_downloaded)}")
    print(f"mango_peel candidates downloaded  : {len(peel_downloaded)}")
    print("=" * 75)


if __name__ == "__main__":
    main()
