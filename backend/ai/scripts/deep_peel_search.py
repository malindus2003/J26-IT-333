#!/usr/bin/env python3
"""
Deep search on Wikimedia Commons for mango peels / skins
"""

import sys
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

API_URL = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)'}

queries = [
    'intitle:"mango peel"',
    'intitle:"mango peels"',
    'intitle:"mango skin"',
    'intitle:"mango skins"',
    'intitle:"peeled mango"',
    'intitle:"peeling mango"',
    'intitle:"mango" "peel"',
    'intitle:"mango" "skin"',
    'intitle:"mangoes" "peel"',
    'intitle:"mangoes" "skin"',
    'intitle:"mangga" "peel"',
    'intitle:"mangga" "skin"',
    '"mango peel" -intitle:pdf',
    '"mango peels" -intitle:pdf',
    '"mango skin" -intitle:pdf',
    '"mango skins" -intitle:pdf',
    '"peeling mango" -intitle:pdf',
    '"peeled mango" -intitle:pdf',
    '"mango peelings" -intitle:pdf',
    '"mango rinds" -intitle:pdf',
    '"mango rind" -intitle:pdf',
    'incategory:"Peel (fruit)" mango',
    'incategory:"Food waste" mango',
    'incategory:"Organic waste" mango',
    'incategory:"Compost" mango'
]

found_titles = set()
for q in queries:
    params = {
        'action': 'query',
        'list': 'search',
        'srsearch': q,
        'srnamespace': '6',
        'srlimit': '50',
        'format': 'json'
    }
    try:
        r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
        hits = [h['title'] for h in r.get('query', {}).get('search', []) if h['title'].startswith('File:')]
        print(f"Query '{q}': {len(hits)} hits")
        for h in hits:
            if h.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                found_titles.add(h)
    except Exception as e:
        print(f"Error {q}: {e}")

print(f"\nTotal unique bitmap files found: {len(found_titles)}")
for h in sorted(list(found_titles)):
    print('  ', h)
