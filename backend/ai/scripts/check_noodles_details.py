import sys, json
from pathlib import Path
from PIL import Image
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
cand_dir = Path("Research-/backend/ai/datasets/candidate_replacements/noodles")

# Check 009-013 similarity
imgs_009_013 = [f"cand_noodles_{i:03d}.jpg" for i in range(9, 14)]
print("Checking 009-013 differences:")
for f1 in imgs_009_013:
    im = Image.open(cand_dir / f1).resize((100, 100))
    arr1 = np.array(im, dtype=float)
    sims = []
    for f2 in imgs_009_013:
        im2 = Image.open(cand_dir / f2).resize((100, 100))
        arr2 = np.array(im2, dtype=float)
        diff = np.mean(np.abs(arr1 - arr2))
        sims.append(f"{f2[-7:-4]}:{diff:.1f}")
    print(f"{f1}: {', '.join(sims)}")

# Let's inspect 014, 015, 019, 033, 034
for fn in ["cand_noodles_014.jpg", "cand_noodles_015.jpg", "cand_noodles_019.jpg", "cand_noodles_033.jpg", "cand_noodles_034.jpg"]:
    im = Image.open(cand_dir / fn)
    print(f"\n{fn}: size={im.size}, mode={im.mode}")
