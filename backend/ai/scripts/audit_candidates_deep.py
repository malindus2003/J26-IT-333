#!/usr/bin/env python3
"""
Deep inspection of downloaded candidates for mango_flesh and mango_peel
"""

import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

cand_dir = Path(r'd:\SLIIT\Research\Research-\backend\ai\datasets\candidates_additional')

with open(cand_dir / 'mango_flesh' / 'candidates_metadata.json', 'r', encoding='utf-8') as f:
    flesh_items = json.load(f)

print(f"Total flesh candidates: {len(flesh_items)}")
for it in flesh_items:
    fn = it['local_filename']
    t = it['title']
    d = it['description'][:80].replace('\n', ' ')
    lic = it['license']
    w, h = it['actual_width'], it['actual_height']
    print(f"{fn:25s} | {t[:40]:40s} | {lic:10s} | {d}")
