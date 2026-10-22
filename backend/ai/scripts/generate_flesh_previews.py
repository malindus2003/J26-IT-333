#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

cand_dir = Path("Research-/backend/ai/datasets/candidates_additional/mango_flesh")
preview_dir = cand_dir / "previews"
preview_dir.mkdir(parents=True, exist_ok=True)

with open(cand_dir / "candidates_metadata.json", "r", encoding="utf-8") as f:
    items = json.load(f)

# Rejection keywords
REJECT_KEYWORDS = [
    'sculpture', 'firewood', 'rambutan', 'carpenter', 'bajki', 'warboss', 'centsprent',
    'pakhala bhata', 'chatu dekchibasa', 'kesar variety.jpg', 'carrots and mangoes for sale',
    'stir-fry grated yellow corn', 'sinabawang patatas', 'pandemic lockdown', 'meycauayan city',
    'corn', 'cabbage', 'crabs', 'alimasag'
]

clean_items = []
for it in items:
    t = it['title'].lower()
    d = it['description'].lower()
    if any(k in t or k in d for k in REJECT_KEYWORDS):
        continue
    clean_items.append(it)

print(f"Generating thumbnails for {len(clean_items)} flesh candidates...")
for it in clean_items:
    fn = it["local_filename"]
    src = cand_dir / fn
    tgt = preview_dir / f"prev_{fn}"
    if src.exists() and not tgt.exists():
        with Image.open(src) as im:
            im.thumbnail((400, 400))
            im.save(tgt, "JPEG", quality=80)

print("Previews ready.")
