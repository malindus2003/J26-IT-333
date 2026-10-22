#!/usr/bin/env python3
import sys
import requests
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
API_URL = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)"}

out_dir = Path("Research-/backend/ai/datasets/candidates_additional/test_thumbs")
out_dir.mkdir(parents=True, exist_ok=True)

titles = [
    "File:Peeling a mangoe 1.jpg",
    "File:Peeling a mangoe 2.jpg",
    "File:Peeling a mangoe.jpg",
    "File:Mangos peeled Peddler.jpg"
]

params = {
    "action": "query",
    "titles": "|".join(titles),
    "prop": "imageinfo",
    "iiprop": "url|size|extmetadata",
    "iiurlwidth": "640",
    "format": "json"
}

r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
pages = r.get("query", {}).get("pages", {})
for p in pages.values():
    t = p.get("title", "")
    ii = p.get("imageinfo", [{}])[0]
    meta = ii.get("extmetadata", {})
    desc = meta.get("ImageDescription", {}).get("value", "")
    lic = meta.get("LicenseShortName", {}).get("value", "")
    artist = meta.get("Artist", {}).get("value", "")
    thumb_url = ii.get("thumburl", ii.get("url", ""))
    print(f"Title: {t}")
    print(f"  Size: {ii.get('width')}x{ii.get('height')} | Lic: {lic} | Artist: {artist}")
    print(f"  Desc: {desc}")
    print(f"  Thumb: {thumb_url}\n")
    safe_name = t.replace("File:", "").replace(" ", "_").replace(",", "")[:40] + ".jpg"
    dest = out_dir / safe_name
    if not dest.exists() and thumb_url:
        img_bytes = requests.get(thumb_url, headers=HEADERS, timeout=20).content
        dest.write_bytes(img_bytes)
