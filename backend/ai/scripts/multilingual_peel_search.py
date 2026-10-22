#!/usr/bin/env python3
"""
Multilingual search for mango peel on Wikimedia Commons
"""

import sys
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

API_URL = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)'}

multilingual_queries = [
    'cascara de mango',
    'cascaras de mango',
    'cáscara de mango',
    'cáscaras de mango',
    'casca de manga',
    'cascas de manga',
    'peau de mangue',
    'peaux de mangue',
    'Mangoschale',
    'Mangoschalen',
    'buccia di mango',
    'buccia mango',
    'kulit mangga',
    'balat ng mangga',
    'pelando mango',
    'éplucher mangue',
    'Schälen Mango',
    'residuos mango',
    'déchets mangue',
    'resíduos manga',
    'lixo manga',
    'desperdicio mango'
]

results = set()
for q in multilingual_queries:
    params = {
        'action': 'query',
        'list': 'search',
        'srsearch': q,
        'srnamespace': '6',
        'srlimit': '30',
        'format': 'json'
    }
    r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
    hits = [h['title'] for h in r.get('query', {}).get('search', []) if h['title'].startswith('File:')]
    print(f"Query '{q}': {len(hits)} hits")
    for h in hits:
        if h.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            results.add(h)

print(f"\nTotal multilingual candidate files: {len(results)}")
for h in sorted(list(results)):
    print('  ', h)
