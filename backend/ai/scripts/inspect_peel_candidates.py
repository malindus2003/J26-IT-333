#!/usr/bin/env python3
"""
Inspect all peel candidate files on Wikimedia Commons
SLIIT Research Project 2026 - Component 4
"""

import sys
import json
import re
import requests

sys.stdout.reconfigure(encoding='utf-8')

API_URL = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)'}

with open('Research-/backend/ai/scripts/search_candidates.py', 'r', encoding='utf-8') as f:
    pass

from search_candidates import search_files, get_category_files

peel_queries = [
    'mango peel',
    'mango peels',
    'mango skin',
    'mango skins',
    'peeling mango',
    'peeling a mango',
    'peeling mangoes',
    'mango peeler',
    'mango peeling',
    'mango peelings',
    'peeled mango skin',
    'mango skin waste',
    'mango peel waste',
    'mango waste peel',
    'peeling green mango',
    'mango rind',
    'mango rinds'
]

peel_files = set()
for q in peel_queries:
    hits = search_files(q, limit=40)
    peel_files.update(hits)

for cat in ['Category:Peeled mangoes', 'Category:Peel (fruit)', 'Category:Peeling']:
    cat_files = get_category_files(cat, limit=100)
    for f in cat_files:
        if any(w in f.lower() for w in ['mango', 'mangga', 'peel', 'skin', 'rind']):
            peel_files.add(f)

# Filter out non-images (pdf, etc.)
img_files = [f for f in peel_files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
print(f"Total image files found: {len(img_files)}")

# Fetch imageinfo in chunks of 25
meta_results = {}
for i in range(0, len(img_files), 25):
    chunk = img_files[i:i+25]
    params = {
        'action': 'query',
        'format': 'json',
        'titles': '|'.join(chunk),
        'prop': 'imageinfo',
        'iiprop': 'url|size|extmetadata'
    }
    r = requests.get(API_URL, params=params, headers=HEADERS, timeout=20).json()
    pages = r.get('query', {}).get('pages', {})
    for pid, p in pages.items():
        title = p.get('title')
        if not title or 'imageinfo' not in p:
            continue
        ii = p['imageinfo'][0]
        meta = ii.get('extmetadata', {})
        desc = re.sub(r'<[^>]+>', '', meta.get('ImageDescription', {}).get('value', '')).strip()
        artist = re.sub(r'<[^>]+>', '', meta.get('Artist', {}).get('value', '')).strip()
        lic = meta.get('LicenseShortName', {}).get('value', '')
        url = ii.get('url', '')
        w = ii.get('width', 0)
        h = ii.get('height', 0)
        meta_results[title] = {
            'title': title,
            'url': url,
            'desc': desc[:120],
            'artist': artist,
            'license': lic,
            'width': w,
            'height': h
        }

print(f"Fetched metadata for {len(meta_results)} images.")

# Print candidates that mention peel, skin, peeling in title or desc
print("\n--- Highly Relevant Peel Candidates ---")
peel_likely = []
for title, m in sorted(meta_results.items()):
    t_lower = title.lower()
    d_lower = m['desc'].lower()
    if any(w in t_lower or w in d_lower for w in ['peel', 'skin', 'rind', 'waste', 'scrap']):
        peel_likely.append(m)
        print(f"• {title}")
        print(f"   Desc: {m['desc']}")
        print(f"   Lic: {m['license']} | Size: {m['width']}x{m['height']}")

print(f"\nTotal highly likely peel candidates: {len(peel_likely)}")
