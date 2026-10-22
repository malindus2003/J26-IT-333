#!/usr/bin/env python3
"""
Search candidates for mango_flesh and mango_peel on Wikimedia Commons
SLIIT Research Project 2026 - Component 4
"""

import sys
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

API_URL = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)'}

def search_files(query, limit=50):
    params = {
        'action': 'query',
        'list': 'search',
        'srsearch': query,
        'srnamespace': '6',
        'srlimit': str(limit),
        'format': 'json'
    }
    r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15)
    hits = r.json().get('query', {}).get('search', [])
    return [h['title'] for h in hits if h['title'].startswith('File:')]

def get_category_files(cat_name, limit=100):
    params = {
        'action': 'query',
        'list': 'categorymembers',
        'cmtitle': cat_name,
        'cmtype': 'file',
        'cmlimit': str(limit),
        'format': 'json'
    }
    r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15)
    members = r.json().get('query', {}).get('categorymembers', [])
    return [m['title'] for m in members if m['title'].startswith('File:')]

# 1. Search Mango Peel
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
    'mango waste peel'
]

peel_files = set()
for q in peel_queries:
    hits = search_files(q, limit=40)
    print(f"Peel query '{q}': {len(hits)} hits")
    peel_files.update(hits)

# Also check Category:Peeled mangoes and Category:Peeling
for cat in ['Category:Peeled mangoes', 'Category:Peel (fruit)', 'Category:Peeling']:
    cat_files = get_category_files(cat, limit=100)
    print(f"Cat '{cat}': {len(cat_files)} files")
    for f in cat_files:
        if 'mango' in f.lower() or 'mangga' in f.lower():
            peel_files.add(f)

print(f"\nTotal unique peel candidate files: {len(peel_files)}")
for f in sorted(list(peel_files))[:30]:
    print('  ', f)

# 2. Search Mango Flesh
flesh_cats = [
    'Category:Sliced mangoes',
    'Category:Sliced mangoes in India',
    'Category:Mango porcupines',
    'Category:Scored mangoes',
    'Category:Cross sections of mangos',
    'Category:Peeled mangoes'
]

flesh_files = set()
for cat in flesh_cats:
    files = get_category_files(cat, limit=100)
    print(f"Flesh Cat '{cat}': {len(files)} files")
    flesh_files.update(files)

flesh_queries = [
    'mango slices',
    'sliced mango',
    'cut mango',
    'mango cubes',
    'mango chunks',
    'mango wedges',
    'diced mango',
    'chopped mango',
    'peeled mango',
    'mango half',
    'rotten mango',
    'spoiled mango'
]

for q in flesh_queries:
    hits = search_files(q, limit=40)
    print(f"Flesh query '{q}': {len(hits)} hits")
    flesh_files.update(hits)

print(f"\nTotal unique flesh candidate files: {len(flesh_files)}")
