import csv
from collections import defaultdict
from pathlib import Path

classes = ['rice', 'kottu', 'noodles', 'chicken', 'whole_mango', 'mango_flesh', 'mango_peel']
img_counts = {s: defaultdict(int) for s in ['train', 'val', 'test']}
box_counts = {s: defaultdict(int) for s in ['train', 'val', 'test']}
total_imgs = {s: 0 for s in ['train', 'val', 'test']}

pilot_dir = Path('Research-/backend/ai/datasets/food_waste_pilot_v2')

for split in ['train', 'val', 'test']:
    lbl_dir = pilot_dir / 'labels' / split
    img_dir = pilot_dir / 'images' / split
    total_imgs[split] = len(list(img_dir.glob('*.*')))
    for lf in lbl_dir.glob('*.txt'):
        lines = [line.strip().split() for line in lf.read_text().splitlines() if line.strip()]
        classes_in_file = set()
        for parts in lines:
            cid = int(parts[0])
            cname = classes[cid]
            box_counts[split][cname] += 1
            classes_in_file.add(cname)
        for cname in classes_in_file:
            img_counts[split][cname] += 1

print(f"{'Class':14s} | {'Train Img':9s} | {'Train Box':9s} | {'Val Img':7s} | {'Val Box':7s} | {'Test Img':8s} | {'Test Box':8s} | {'Total Box':9s}")
print('-' * 88)
for c in classes:
    t_i, t_b = img_counts['train'][c], box_counts['train'][c]
    v_i, v_b = img_counts['val'][c], box_counts['val'][c]
    te_i, te_b = img_counts['test'][c], box_counts['test'][c]
    tot = t_b + v_b + te_b
    print(f"{c:14s} | {t_i:9d} | {t_b:9d} | {v_i:7d} | {v_b:7d} | {te_i:8d} | {te_b:8d} | {tot:9d}")

print('-' * 88)
tot_train_box = sum(box_counts['train'].values())
tot_val_box = sum(box_counts['val'].values())
tot_test_box = sum(box_counts['test'].values())
t_tr_img = total_imgs['train']
t_va_img = total_imgs['val']
t_te_img = total_imgs['test']
print(f"{'Total Images':14s} | {t_tr_img:9d} | {'':9s} | {t_va_img:7d} | {'':7s} | {t_te_img:8d} | {'':8s} | {t_tr_img+t_va_img+t_te_img:9d}")
print(f"{'Total Boxes':14s} | {'':9s} | {tot_train_box:9d} | {'':7s} | {tot_val_box:7d} | {'':8s} | {tot_test_box:8d} | {tot_train_box+tot_val_box+tot_test_box:9d}")
