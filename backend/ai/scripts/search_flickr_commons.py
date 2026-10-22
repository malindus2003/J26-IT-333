#!/usr/bin/env python3
import sys
import requests
import json

sys.stdout.reconfigure(encoding="utf-8")
API_URL = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)"}

params = {
    "action": "query",
    "list": "search",
    "srsearch": '("mango peel" OR "mango peels" OR "mango skin" OR "mango skins" OR "mango peeling") insource:Flickr',
    "srnamespace": "6",
    "srlimit": "50",
    "format": "json"
}
r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
hits = [h["title"] for h in r.get("query", {}).get("search", [])]
print(f"Flickr-sourced mango peel hits: {len(hits)}")
for h in hits:
    print(" ", h)
