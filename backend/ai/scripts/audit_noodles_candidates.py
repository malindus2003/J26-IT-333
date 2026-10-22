import sys, json
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

CAND_PATH = Path("Research-/backend/ai/datasets/candidate_replacements")
with open(CAND_PATH / "harvested_candidates.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx, item in enumerate(data["noodles"]):
    fn = item["saved_filename"]
    lic = item.get("license", "Unknown")
    author = item.get("artist", "Unknown")
    title = item.get("title", "")
    desc = item.get("description", "").replace("\n", " ")[:160]
    print(f"[{idx+1:02d}] {fn} | Lic: {lic}")
    print(f"     Title: {title}")
    print(f"     Author: {author}")
    print(f"     Desc: {desc}\n")
