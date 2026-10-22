#!/usr/bin/env python3
import sys
import hashlib
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

datasets_dir = Path("Research-/backend/ai/datasets")
flesh_cand_dir = datasets_dir / "candidates_additional" / "mango_flesh"

flesh_25_list = [
    'cand_mango_flesh_001.jpg',
    'cand_mango_flesh_002.jpg',
    'cand_mango_flesh_003.jpg',
    'cand_mango_flesh_004.jpg',
    'cand_mango_flesh_008.jpg',
    'cand_mango_flesh_018.jpg',
    'cand_mango_flesh_020.jpg',
    'cand_mango_flesh_023.jpg',
    'cand_mango_flesh_024.jpg',
    'cand_mango_flesh_026.jpg',
    'cand_mango_flesh_028.jpg',
    'cand_mango_flesh_030.jpg',
    'cand_mango_flesh_031.jpg',
    'cand_mango_flesh_035.jpg',
    'cand_mango_flesh_036.jpg',
    'cand_mango_flesh_038.jpg',
    'cand_mango_flesh_039.jpg',
    'cand_mango_flesh_040.jpg',
    'cand_mango_flesh_044.jpg',
    'cand_mango_flesh_045.jpg',
    'cand_mango_flesh_046.jpg',
    'cand_mango_flesh_047.jpg',
    'cand_mango_flesh_050.jpg',
    'cand_mango_flesh_051.jpg',
    'cand_mango_flesh_059.jpg'
]

# Check existing hashes in staging_open_images and candidate_replacements
existing_hashes = {}
for p in (datasets_dir / "staging_open_images").rglob("*.jpg"):
    h = hashlib.md5(p.read_bytes()).hexdigest()
    existing_hashes[h] = p
for p in (datasets_dir / "candidate_replacements").rglob("*.jpg"):
    h = hashlib.md5(p.read_bytes()).hexdigest()
    existing_hashes[h] = p

print(f"Total existing indexed hashes: {len(existing_hashes)}")

# Check selected 25
selected_hashes = set()
duplicates = 0
for fn in flesh_25_list:
    fp = flesh_cand_dir / fn
    if not fp.exists():
        print(f"[!] File not found: {fn}")
        continue
    h = hashlib.md5(fp.read_bytes()).hexdigest()
    if h in selected_hashes:
        print(f"[!] Internal duplicate among selected: {fn}")
        duplicates += 1
    selected_hashes.add(h)
    if h in existing_hashes:
        print(f"[!] Duplicate of existing dataset file: {fn} matches {existing_hashes[h]}")
        duplicates += 1

print(f"Selection duplicate check complete: {duplicates} duplicates found out of {len(flesh_25_list)}.")
