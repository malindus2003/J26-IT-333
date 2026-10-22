#!/usr/bin/env python3
"""
Filter and curate mango_flesh candidates
"""

import sys
import json
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

cand_dir = Path(r'd:\SLIIT\Research\Research-\backend\ai\datasets\candidates_additional\mango_flesh')
with open(cand_dir / 'candidates_metadata.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# Rejection keywords in title or description
REJECT_KEYWORDS = [
    'sculpture', 'firewood', 'rambutan', 'carpenter', 'bajki', 'warboss', 'centsprent',
    'pakhala bhata', 'chatu dekchibasa', 'kesar variety.jpg', 'carrots and mangoes for sale',
    'stir-fry grated yellow corn', 'sinabawang patatas', 'pandemic lockdown', 'meycauayan city',
    'corn', 'cabbage', 'crabs', 'alimasag'
]

flesh_clean = []
for it in items:
    t = it['title'].lower()
    d = it['description'].lower()
    if any(k in t or k in d for k in REJECT_KEYWORDS):
        continue
    flesh_clean.append(it)

print(f"Total initial flesh candidates: {len(items)}")
print(f"Filtered clean flesh candidates: {len(flesh_clean)}")

for idx, it in enumerate(flesh_clean, 1):
    print(f"[{idx:02d}] {it['local_filename']} | {it['actual_width']}x{it['actual_height']} | {it['title']} | {it['license']}")
