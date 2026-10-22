#!/usr/bin/env python3
"""
Candidate Search and Fetcher for Food Waste Replacements
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)
Component 4: AI & IoT-Based Smart Waste Bin

Searches Wikimedia Commons API for openly licensed images of:
- rice (cooked white rice, fried rice, steamed rice on plates/bowls)
- noodles (fried noodles, chow mein, ramen, stir fry noodles on plates/bowls)
- mango_peel (genuine discarded mango skins and peels)
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


def search_wikimedia(query: str, limit: int = 40) -> list:
    """Searches Wikimedia Commons for bitmap files matching query."""
    params = {
        "action": "query",
        "list": "search",
        "srsearch": f"{query} filetype:bitmap",
        "srlimit": limit,
        "format": "json"
    }
    try:
        r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15)
        r.raise_for_status()
        hits = r.json().get("query", {}).get("search", [])
        return [h["title"] for h in hits if h["title"].startswith("File:")]
    except Exception as e:
        print(f"[!] Error searching Wikimedia for '{query}': {e}")
        return []


def get_image_info_batch(titles: list) -> dict:
    """Retrieves URL, dimensions, licenses, and descriptions for Wikimedia titles."""
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

                # Clean strings
                desc = meta.get("ImageDescription", {}).get("value", "")
                desc_clean = re.sub(r"<[^>]+>", "", desc).strip()
                artist = meta.get("Artist", {}).get("value", "")
                artist_clean = re.sub(r"<[^>]+>", "", artist).strip() or "Wikimedia Contributor"
                license_short = meta.get("LicenseShortName", {}).get("value", "")
                license_url = meta.get("LicenseUrl", {}).get("value", "")

                url = ii.get("url")
                width = ii.get("width", 0)
                height = ii.get("height", 0)

                # Filter valid licenses and bitmap formats
                valid_license = any(lic in license_short.upper() for lic in ["CC", "PUBLIC DOMAIN", "PD", "ATTRIBUTION", "ZERO"])
                if url and valid_license and (url.lower().endswith(".jpg") or url.lower().endswith(".jpeg") or url.lower().endswith(".png")):
                    results[title] = {
                        "title": title,
                        "url": url,
                        "license": license_short,
                        "license_url": license_url,
                        "artist": artist_clean,
                        "description": desc_clean,
                        "width": width,
                        "height": height
                    }
        except Exception as e:
            print(f"[!] Error querying image info: {e}")
    return results


def download_candidates(class_name: str, candidate_metadata: list, max_count: int = 30) -> list:
    """Downloads candidate images to candidate_replacements/{class_name}."""
    class_folder = CANDIDATES_DIR / class_name
    class_folder.mkdir(parents=True, exist_ok=True)
    downloaded = []

    print(f"[*] Downloading up to {max_count} candidate images for '{class_name}'...")

    for idx, item in enumerate(candidate_metadata):
        if len(downloaded) >= max_count:
            break
        url = item["url"]
        fname = f"cand_{class_name}_{len(downloaded)+1:03d}.jpg"
        dest_path = class_folder / fname

        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            img_bytes = resp.content

            # Verify image integrity
            pil_img = Image.open(io.BytesIO(img_bytes))
            pil_img.verify()
            pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

            # Min resolution check
            w, h = pil_img.size
            if w < 250 or h < 250:
                continue

            pil_img.save(dest_path, format="JPEG", quality=90)
            item["local_path"] = str(dest_path.relative_to(DATASETS_DIR))
            item["saved_filename"] = fname
            item["width"] = w
            item["height"] = h
            downloaded.append(item)
            print(f"    [+] [{len(downloaded)}/{max_count}] Saved {fname} ({w}x{h}) | {item['title'][:45]}")
        except Exception as e:
            print(f"    [!] Failed to download {url[:40]}: {e}")

    return downloaded


def main():
    queries = {
        "rice": [
            "\"cooked rice\" plate",
            "\"fried rice\" dish",
            "\"steamed rice\" bowl",
            "\"white rice\" plate",
            "leftover rice plate"
        ],
        "noodles": [
            "\"fried noodles\" plate",
            "\"chow mein\" plate",
            "\"noodle dish\" plate",
            "\"stir fried noodles\"",
            "cooked noodles bowl",
            "instant noodles plate"
        ],
        "mango_peel": [
            "\"mango peel\"",
            "\"mango peels\"",
            "peeling mango",
            "mango skin",
            "mango waste"
        ]
    }

    manifest = {}

    for cname, qlist in queries.items():
        print(f"\n{'='*70}\n  Searching candidates for: {cname.upper()}\n{'='*70}")
        all_titles = []
        for q in qlist:
            titles = search_wikimedia(q, limit=25)
            for t in titles:
                if t not in all_titles:
                    all_titles.append(t)
            print(f"  Query: '{q}' -> found {len(titles)} titles (Total unique: {len(all_titles)})")

        info_dict = get_image_info_batch(all_titles)
        print(f"[+] Retrieved metadata for {len(info_dict)} validly licensed images.")

        target_max = 35 if cname != "mango_peel" else 20
        downloaded = download_candidates(cname, list(info_dict.values()), max_count=target_max)
        manifest[cname] = downloaded

    out_file = CANDIDATES_DIR / "candidates_metadata.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[+] Candidates metadata saved to: {out_file}")


if __name__ == "__main__":
    main()
