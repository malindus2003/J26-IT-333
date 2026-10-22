#!/usr/bin/env python3
import sys
import json
import hashlib
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

peel_cand_dir = Path("Research-/backend/ai/datasets/candidates_additional/mango_peel")
with open(peel_cand_dir / "candidates_metadata.json", "r", encoding="utf-8") as f:
    items = json.load(f)

print(f"Total candidates in mango_peel: {len(items)}")

# Check each item
for idx, it in enumerate(items, 1):
    fn = it["local_filename"]
    p = peel_cand_dir / fn
    title = it["title"]
    lic = it["license"]
    sz = f"{it['actual_width']}x{it['actual_height']}"
    desc = it.get("description", "")
    print(f"[{idx:02d}] {fn} | {sz} | {lic} | {title}")
