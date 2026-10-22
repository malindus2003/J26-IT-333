#!/usr/bin/env python3
"""
Inspect mango_peel downloaded candidates
"""

import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

cand_dir = Path(r'd:\SLIIT\Research\Research-\backend\ai\datasets\candidates_additional')

with open(cand_dir / 'mango_peel' / 'candidates_metadata.json', 'r', encoding='utf-8') as f:
    peel_items = json.load(f)

print(f"Total peel candidates: {len(peel_items)}")
for it in peel_items:
    fn = it['local_filename']
    t = it['title']
    d = it['description'][:80].replace('\n', ' ')
    lic = it['license']
    w, h = it['actual_width'], it['actual_height']
    print(f"{fn:25s} | {t[:40]:40s} | {lic:10s} | {d}")
