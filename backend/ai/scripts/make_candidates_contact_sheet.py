#!/usr/bin/env python3
import sys
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")

cand_dir = Path("Research-/backend/ai/datasets/candidates_additional/mango_flesh")
preview_dir = cand_dir / "previews"
out_sheet = cand_dir / "flesh_candidates_sheet.jpg"

with open(cand_dir / "candidates_metadata.json", "r", encoding="utf-8") as f:
    items = json.load(f)

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

thumb_size = 250
label_height = 40
cols = 6
rows = math.ceil(len(clean_items) / cols)

sheet = Image.new("RGB", (cols * thumb_size, rows * (thumb_size + label_height)), (30, 30, 30))
draw = ImageDraw.Draw(sheet)

for idx, it in enumerate(clean_items):
    c = idx % cols
    r = idx // cols
    x = c * thumb_size
    y = r * (thumb_size + label_height)

    prev_p = preview_dir / f"prev_{it['local_filename']}"
    if prev_p.exists():
        with Image.open(prev_p) as im:
            im = im.convert("RGB")
            # Fit inside thumb_size x thumb_size
            im.thumbnail((thumb_size, thumb_size))
            # Center on tile
            ox = (thumb_size - im.width) // 2
            oy = (thumb_size - im.height) // 2
            sheet.paste(im, (x + ox, y + oy))

    fn = it["local_filename"]
    # Draw text
    draw.text((x + 5, y + thumb_size + 5), f"#{idx+1}: {fn}", fill=(255, 255, 255))
    short_title = it['title'].replace('File:', '')[:25]
    draw.text((x + 5, y + thumb_size + 20), short_title, fill=(200, 200, 200))

sheet.save(out_sheet, "JPEG", quality=85)
print(f"Saved contact sheet: {out_sheet} ({sheet.width}x{sheet.height})")
