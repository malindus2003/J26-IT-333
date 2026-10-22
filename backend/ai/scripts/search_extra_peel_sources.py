#!/usr/bin/env python3
import sys
import requests
import json

sys.stdout.reconfigure(encoding="utf-8")
API_URL = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)"}

queries = [
    'intitle:"mango" "peeling"',
    'intitle:"mango" "peeler"',
    '"peeling the mangoes"',
    '"peeled mangoes"',
    '"peeled mango"',
    'intitle:"mangga" "balat"',
    '"cascara" "mango"',
    '"casca" "manga"',
    '"peau" "mangue"',
    '"kulit mangga"'
]

seen = set()
for q in queries:
    params = {
        "action": "query",
        "list": "search",
        "srsearch": q,
        "srnamespace": "6",
        "srlimit": "50",
        "format": "json"
    }
    r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
    hits = [h["title"] for h in r.get("query", {}).get("search", []) if h["title"].startswith("File:")]
    print(f"Query '{q}': {len(hits)} hits")
    for h in hits:
        if h.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            seen.add(h)

print(f"\nTotal unique bitmap files: {len(seen)}")
for s in sorted(seen):
    print("  ", s)
