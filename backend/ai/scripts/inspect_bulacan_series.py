#!/usr/bin/env python3
"""
Inspect 775Cuisine foods of Bulacan and related Bulacan mango series
"""

import sys
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

API_URL = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'SmartRestaurantResearch/1.0 (it23324060@my.sliit.lk; SLIIT Research Project 2026)'}

params = {
    'action': 'query',
    'list': 'search',
    'srsearch': '\"775Cuisine foods of Bulacan\"',
    'srnamespace': '6',
    'srlimit': '60',
    'format': 'json'
}

r = requests.get(API_URL, params=params, headers=HEADERS, timeout=15).json()
hits = [h['title'] for h in r.get('query', {}).get('search', [])]
print(f"Total 775Cuisine files: {len(hits)}")
for h in sorted(hits):
    print('  ', h)
