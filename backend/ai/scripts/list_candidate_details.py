import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

cand_dir = Path(r'd:\SLIIT\Research\Research-\backend\ai\datasets\candidates_additional')

for cat in ['mango_flesh', 'mango_peel']:
    meta_p = cand_dir / cat / 'candidates_metadata.json'
    with open(meta_p, 'r', encoding='utf-8') as f:
        items = json.load(f)
    print(f'=== {cat.upper()} ({len(items)} items) ===')
    for idx, it in enumerate(items, 1):
        fn = it['local_filename']
        t = it['title']
        w = it['actual_width']
        h = it['actual_height']
        d = it['description'][:75].replace('\n', ' ')
        print(f"{fn} | {w}x{h} | {t} | {d}")
