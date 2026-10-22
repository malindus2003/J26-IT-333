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
    "File:204Photos taken during the 2020 coronavirus pandemic in Meycauayan, Bulacan 23.jpg",
    "File:204Photos taken during the 2020 coronavirus pandemic in Meycauayan, Bulacan 24.jpg",
    "File:204Photos taken during the 2020 coronavirus pandemic in Meycauayan, Bulacan 25.jpg",
    "File:204Photos taken during the 2020 coronavirus pandemic in Meycauayan, Bulacan 26.jpg",
    "File:204Photos taken during the 2020 coronavirus pandemic in Meycauayan, Bulacan 27.jpg",
    "File:204Photos taken during the 2020 coronavirus pandemic in Meycauayan, Bulacan 28.jpg",
    "File:9783Photos taken during 2020 coronavirus pandemic Meycauayan City 24.jpg",
    "File:9783Photos taken during 2020 coronavirus pandemic Meycauayan City 25.jpg",
    "File:9783Photos taken during 2020 coronavirus pandemic Meycauayan City 31.jpg",
    "File:9783Photos taken during 2020 coronavirus pandemic Meycauayan City 32.jpg",
    "File:Peeling off Mango.jpg",
    "File:Mosca en una cascara de mango.JPG",
    "File:Peeling the mangoes with the help of vegetable peeler.jpg",
    "File:Slicing the peeled mangoes into long thin slices.jpg"
]

params = {
    "action": "query",
    "titles": "|".join(titles),
    "prop": "imageinfo",
    "iiprop": "url",
    "iiurlwidth": "640",
    "format": "json"
}

r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
pages = r.get("query", {}).get("pages", {})
for p in pages.values():
    t = p.get("title", "")
    ii = p.get("imageinfo", [{}])[0]
    thumb_url = ii.get("thumburl", ii.get("url", ""))
    safe_name = t.replace("File:", "").replace(" ", "_").replace(",", "")[:40] + ".jpg"
    dest = out_dir / safe_name
    if not dest.exists() and thumb_url:
        print(f"Downloading {safe_name} from {thumb_url}...")
        img_bytes = requests.get(thumb_url, headers=HEADERS, timeout=20).content
        dest.write_bytes(img_bytes)

print("Done downloading test thumbnails.")
