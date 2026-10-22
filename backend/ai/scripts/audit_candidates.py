#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

CANDIDATES_JSON = Path("Research-/backend/ai/datasets/candidate_replacements/harvested_candidates.json")

def main():
    with open(CANDIDATES_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    for cls in ["rice", "noodles", "mango_peel"]:
        print(f"\n{'='*30} {cls.upper()} ({len(data[cls])} candidates) {'='*30}")
        for idx, item in enumerate(data[cls]):
            fn = item["saved_filename"]
            lic = item["license"]
            t = item["title"].replace("File:", "")[:35]
            d = item.get("description", "").replace("\n", " ").replace("\r", " ")[:50]
            local_p = Path("Research-/backend/ai/datasets") / item["local_path"]
            exists = local_p.exists()
            size_kb = (local_p.stat().st_size / 1024) if exists else 0
            res = ""
            if exists:
                try:
                    with Image.open(local_p) as img:
                        res = f"{img.width}x{img.height}"
                except Exception as e:
                    res = "CORRUPT"
            print(f"[{idx+1:02d}] {fn} ({size_kb:.0f}KB, {res}) | Lic: {lic[:12]} | Title: {t} | Desc: {d}")

if __name__ == "__main__":
    main()
