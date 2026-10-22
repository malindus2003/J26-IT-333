#!/usr/bin/env python3
"""
Targeted Image Harvesting Script for Food Waste Replacements
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)
Component 4: AI & IoT-Based Smart Waste Bin

Harvests candidate images for:
- Priority 1: rice (cooked white rice, fried rice, steamed rice, leftover rice)
- Priority 2: noodles (fried noodles, chow mein, ramen, instant noodles, spaghetti)
- Priority 3: mango_peel (discarded mango skin, mango peel, fruit peel waste)
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
CANDIDATES_DIR = DATASETS_DIR / "candidate_replacements"


def search_titles(query: str, limit: int = 40) -> list:
    """Searches Wikimedia File namespace for query."""
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srnamespace": "6",  # File:
        "srlimit": limit,
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


def get_image_info(titles: list) -> dict:
    """Retrieves URL and licensing metadata for files."""
    results = {}
    for i in range(0, len(titles), 20):
        chunk = titles[i:i + 20]
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
                license_short = meta.get("LicenseShortName", {}).get("value", "")
                license_url = meta.get("LicenseUrl", {}).get("value", "")

                url = ii.get("url")
                width = ii.get("width", 0)
                height = ii.get("height", 0)

                valid_license = any(lic in license_short.upper() for lic in ["CC", "PUBLIC DOMAIN", "PD", "ATTRIBUTION", "ZERO", "GPL"])
                clean_url = url.split("?")[0] if url else ""
                ext = clean_url.split(".")[-1].lower() if clean_url else ""
                if url and valid_license and ext in ["jpg", "jpeg", "png"]:
                    results[title] = {
                        "title": title,
                        "url": url,
                        "clean_url": clean_url,
                        "license": license_short,
                        "license_url": license_url,
                        "artist": artist_clean,
                        "description": desc_clean,
                        "width": width,
                        "height": height
                    }
        except Exception as e:
            print(f"[!] Info error: {e}")
    return results


def harvest_for_class(class_name: str, queries: list, max_images: int = 30) -> list:
    print(f"\n{'='*75}\n  HARVESTING CANDIDATES FOR: {class_name.upper()}\n{'='*75}")
    all_titles = []
    for q in queries:
        titles = search_titles(q, limit=30)
        for t in titles:
            if t not in all_titles:
                all_titles.append(t)
        print(f"  • Query: '{q}' -> found {len(titles)} titles (Total unique: {len(all_titles)})")

    info_dict = get_image_info(all_titles)
    print(f"[+] Found {len(info_dict)} validly licensed bitmap files.")

    out_folder = CANDIDATES_DIR / class_name
    out_folder.mkdir(parents=True, exist_ok=True)

    saved_items = []
    for idx, (title, meta) in enumerate(info_dict.items(), 1):
        if len(saved_items) >= max_images:
            break
        url = meta["url"]
        fname = f"cand_{class_name}_{len(saved_items)+1:03d}.jpg"
        dest_path = out_folder / fname

        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            img_bytes = resp.content

            pil = Image.open(io.BytesIO(img_bytes))
            pil.verify()
            pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")

            w, h = pil.size
            if w < 300 or h < 300:
                continue

            pil.save(dest_path, format="JPEG", quality=90)
            meta["local_path"] = str(dest_path.relative_to(DATASETS_DIR))
            meta["saved_filename"] = fname
            meta["class_name"] = class_name
            saved_items.append(meta)
            print(f"    [+] [{len(saved_items)}/{max_images}] Saved {fname} ({w}x{h}) | {title[:50]}")
        except Exception as e:
            print(f"    [!] Error downloading {title[:35]}: {e}")

    return saved_items


def main():
    queries_map = {
        "rice": [
            "cooked rice plate",
            "steamed rice bowl",
            "fried rice plate",
            "boiled rice plate",
            "jasmine rice bowl",
            "basmati rice plate"
        ],
        "noodles": [
            "fried noodles plate",
            "chow mein plate",
            "instant noodles bowl",
            "ramen noodles bowl",
            "cooked noodles plate",
            "spaghetti plate"
        ],
        "mango_peel": [
            "mango peel",
            "mango peels",
            "peeling mango",
            "mango skin",
            "fruit peel compost",
            "organic peel waste"
        ]
    }

    results = {}
    for cname, qlist in queries_map.items():
        limit = 35 if cname != "mango_peel" else 20
        results[cname] = harvest_for_class(cname, qlist, max_images=limit)

    summary_file = CANDIDATES_DIR / "harvested_candidates.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\n[+] Harvest complete. Summary saved to: {summary_file}")


if __name__ == "__main__":
    main()
