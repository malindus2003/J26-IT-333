#!/usr/bin/env python3
import sys
import requests
import json

sys.stdout.reconfigure(encoding="utf-8")
API_URL = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)"}

queries = [
    'mango compost',
    'mango waste',
    'mango scraps',
    'mango garbage',
    'mango peels',
    'mango peeling',
    'peeling mango',
    'peeled mango',
    'mango skin',
    'cascara mango',
    'peau mangue',
    'balat mangga',
    'kulit mangga',
    'mango organic waste',
    'mango food waste'
]

results = set()
for q in queries:
    params = {
        "action": "query",
        "list": "search",
        "srsearch": q,
        "srnamespace": "6",
        "srlimit": "40",
        "format": "json"
    }
    r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
    hits = [h["title"] for h in r.get("query", {}).get("search", []) if h["title"].startswith("File:")]
    for h in hits:
        if h.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            results.add(h)

print(f"Total results: {len(results)}")
for r in sorted(results):
    print("  ", r)
