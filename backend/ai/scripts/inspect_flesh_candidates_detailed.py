#!/usr/bin/env python3
"""
Inspect all mango_flesh candidates with their metadata, descriptions, dimensions, and MD5 hashes
"""
import sys
import json
import hashlib
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

cand_dir = Path("Research-/backend/ai/datasets/candidates_additional/mango_flesh")
meta_file = cand_dir / "candidates_metadata.json"

with open(meta_file, "r", encoding="utf-8") as f:
    items = json.load(f)

print(f"Total candidates loaded: {len(items)}\n")

for idx, it in enumerate(items, 1):
    fn = it["local_filename"]
    fp = cand_dir / fn
    md5 = hashlib.md5(fp.read_bytes()).hexdigest() if fp.exists() else "MISSING"
    print(f"[{idx:02d}] {fn} ({it['actual_width']}x{it['actual_height']})")
    print(f"     Title: {it['title']}")
    print(f"     License: {it['license']} | Artist: {it.get('artist', 'Unknown')}")
    print(f"     URL: {it['clean_url']}")
    print(f"     Desc: {it.get('description', '')[:100]}...")
    print(f"     MD5: {md5}\n")
