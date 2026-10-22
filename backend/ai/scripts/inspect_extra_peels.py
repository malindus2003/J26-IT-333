#!/usr/bin/env python3
import sys
import requests
import json

sys.stdout.reconfigure(encoding="utf-8")
API_URL = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)"}

check_titles = [
    "File:Peeling off Mango.jpg",
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
    "File:Fresh Peeled Mango.jpg",
    "File:Peeled Mango.jpg"
]

params = {
    "action": "query",
    "titles": "|".join(check_titles),
    "prop": "imageinfo",
    "iiprop": "url|size|extmetadata",
    "format": "json"
}

r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
pages = r.get("query", {}).get("pages", {})
for pid, page in sorted(pages.items(), key=lambda x: x[1].get("title", "")):
    t = page.get("title")
    ii = page.get("imageinfo", [{}])[0]
    meta = ii.get("extmetadata", {})
    desc = meta.get("ImageDescription", {}).get("value", "")
    lic = meta.get("LicenseShortName", {}).get("value", "")
    artist = meta.get("Artist", {}).get("value", "")
    url = ii.get("url", "")
    print(f"Title: {t}")
    print(f"  Size: {ii.get('width')}x{ii.get('height')} | Lic: {lic} | Artist: {artist}")
    print(f"  Desc: {desc[:100]}")
    print(f"  URL: {url}\n")
