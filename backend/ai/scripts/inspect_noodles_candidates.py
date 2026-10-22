#!/usr/bin/env python3
import sys, json
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")

with open("Research-/backend/ai/datasets/candidate_replacements/harvested_candidates.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx, item in enumerate(data["noodles"]):
    fn = item["saved_filename"]
    lic = item["license"]
    t = item["title"].replace("File:", "")
    d = item.get("description", "").replace("\n", " ").replace("\r", " ")
    print(f"NOODLES [{idx+1:02d}] {fn} | Lic: {lic:12} | Title: {t:40} | Desc: {d}")
