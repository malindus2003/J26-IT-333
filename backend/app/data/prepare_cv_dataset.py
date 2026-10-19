"""
Reproducible Dataset Preparation & Validation Pipeline
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

Ingests, validates, standardizes, and partitions the public benchmark dataset
(3,202 images, 7,087 bounding boxes) with Apache 2.0 attribution manifest.
"""

import os
import sys
import json
import time
import hashlib
import xml.etree.ElementTree as ET
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
import cv2
from sklearn.model_selection import train_test_split

# Standardized Produce Taxonomy
SUPPORTED_SPECIES = ["Apple", "Banana", "Orange"]
FALLBACK_SPECIES = "Unknown / Unsupported Produce"

SPECIES_LABEL_MAP = {
    "fresh_apple": "Apple",
    "normal_apple": "Apple",
    "rotten_apple": "Apple",
    "fresh_banana": "Banana",
    "normal_banana": "Banana",
    "rotten_banana": "Banana",
    "fresh_orange": "Orange",
    "normal_orange": "Orange",
    "rotten_orange": "Orange"
}

# Standardized Freshness / Spoilage Lifecycle Stages
# 0: Unripe / Firm
# 1: Ripe / Optimal
# 2: Overripe / Softening
# 3: Spoiled / Rotten
# Fallback: Uncertain
STAGE_NAME_MAP = {
    0: "Unripe / Firm",
    1: "Ripe / Optimal",
    2: "Overripe / Softening",
    3: "Spoiled / Rotten"
}

RAW_STAGE_MAP = {
    "fresh_apple": 0,    # Unripe / Firm harvest state
    "normal_apple": 1,   # Ripe / Optimal consumption state
    "rotten_apple": 3,   # Spoiled / Rotten
    "fresh_banana": 0,   # Greenish / Firm
    "normal_banana": 1,  # Ripe yellow
    "rotten_banana": 3,  # Senescent / Fungal Rotten
    "fresh_orange": 0,   # Firm citrus
    "normal_orange": 1,  # Juicy ripe citrus
    "rotten_orange": 3   # Mouldy / Rotten
}

def compute_image_hash(img_bgr: np.ndarray) -> str:
    """Compute 8x8 average hash to detect duplicates."""
    small = cv2.resize(img_bgr, (8, 8), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    avg = gray.mean()
    diff = gray > avg
    return hashlib.md5(diff.tobytes()).hexdigest()

def extract_multi_domain_features(img_bgr: np.ndarray) -> np.ndarray:
    """
    Extracts a 35-dimensional multi-domain visual feature vector:
    - Color moments in RGB, HSV, LAB
    - Physiological pigment indices (Browning, Chlorophyll Green, Carotenoid Yellow, Anthocyanin Red, Mould/Necrosis)
    - Surface texture & gradient descriptors (Sobel, Canny edge density, Laplacian variance)
    - Scale/rotation-invariant Hu Moments
    - Defect contour statistics
    """
    img_resized = cv2.resize(img_bgr, (160, 160))
    rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(img_resized, cv2.COLOR_BGR2LAB)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    total_pixels = 160.0 * 160.0

    # 1. Color channel moments (RGB, HSV, LAB) -> 18 features
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    l_c, a_c, b_c = lab[:, :, 0], lab[:, :, 1], lab[:, :, 2]

    color_moments = [
        float(np.mean(r)), float(np.std(r)),
        float(np.mean(g)), float(np.std(g)),
        float(np.mean(b)), float(np.std(b)),
        float(np.mean(h)), float(np.std(h)),
        float(np.mean(s)), float(np.std(s)),
        float(np.mean(v)), float(np.std(v)),
        float(np.mean(l_c)), float(np.std(l_c)),
        float(np.mean(a_c)), float(np.std(a_c)),
        float(np.mean(b_c)), float(np.std(b_c))
    ]

    # 2. Physiological pigment indices -> 5 features
    # Browning (enzymatic melanin accumulation)
    browning_mask = (r > 70) & (r < 195) & (g > 35) & (g < 140) & (b < 95)
    browning_ratio = float(np.sum(browning_mask) / total_pixels * 100.0)

    # Chlorophyll Green ratio
    green_mask = (g > r * 1.08) & (g > b * 1.08) & (g > 40)
    green_ratio = float(np.sum(green_mask) / total_pixels * 100.0)

    # Carotenoid Yellow ratio
    yellow_mask = (r > 140) & (g > 120) & (b < 90)
    yellow_ratio = float(np.sum(yellow_mask) / total_pixels * 100.0)

    # Anthocyanin Red ratio
    red_mask = (r > 130) & (r > g * 1.25) & (r > b * 1.25)
    red_ratio = float(np.sum(red_mask) / total_pixels * 100.0)

    # Mould / Necrosis spore mask
    mould_mask = (
        ((g > r * 1.15) & (g > 65) & (r < 135)) |
        ((np.abs(r.astype(int) - g.astype(int)) < 15) & (v > 190) & (s < 40)) |
        ((v < 40) & (np.abs(r.astype(int) - g.astype(int)) < 12))
    )
    mould_coverage = float(np.sum(mould_mask) / total_pixels * 100.0)

    pigment_features = [browning_ratio, green_ratio, yellow_ratio, red_ratio, mould_coverage]

    # 3. Surface texture & edge descriptors -> 4 features
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(sobelx**2 + sobely**2)
    gradient_mean = float(np.mean(grad_mag))
    gradient_std = float(np.std(grad_mag))

    edges = cv2.Canny(gray, 40, 130)
    edge_density = float(np.sum(edges > 0) / total_pixels * 100.0)

    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    texture_features = [gradient_mean, gradient_std, edge_density, laplacian_var]

    # 4. Hu Moments (scale, rotation & reflection invariants) -> 7 features
    moments = cv2.moments(gray)
    hu = cv2.HuMoments(moments).flatten()
    log_hu = [-np.sign(h_val) * np.log10(np.abs(h_val) + 1e-10) for h_val in hu]

    # 5. Defect contour statistics -> 2 features
    defect_binary = (browning_mask | mould_mask).astype(np.uint8) * 255
    contours, _ = cv2.findContours(defect_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    defect_count = float(len([c for c in contours if cv2.contourArea(c) > 15]))
    defect_area_pct = float(np.sum(defect_binary > 0) / total_pixels * 100.0)

    defect_features = [defect_count, defect_area_pct]

    feature_vector = np.array(
        color_moments + pigment_features + texture_features + list(log_hu) + defect_features,
        dtype=np.float32
    )
    return feature_vector

def parse_voc_xml(xml_path: str) -> Dict[str, Any]:
    """Parse Pascal VOC XML annotation."""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    size_el = root.find("size")
    width = int(size_el.find("width").text) if size_el is not None and size_el.find("width") is not None else 0
    height = int(size_el.find("height").text) if size_el is not None and size_el.find("height") is not None else 0

    boxes = []
    classes = []
    for obj in root.findall("object"):
        name = obj.find("name").text
        bnd = obj.find("bndbox")
        if bnd is not None:
            xmin = float(bnd.find("xmin").text)
            ymin = float(bnd.find("ymin").text)
            xmax = float(bnd.find("xmax").text)
            ymax = float(bnd.find("ymax").text)
            boxes.append({"name": name, "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax})
            classes.append(name)
    return {
        "width": width,
        "height": height,
        "boxes": boxes,
        "classes": classes
    }

def prepare_pipeline(base_data_dir: str, output_manifest_path: str, output_features_dir: str) -> Dict[str, Any]:
    print("=" * 80)
    print(" GREENPULSE REPRODUCIBLE DATASET PREPARATION PIPELINE ")
    print("=" * 80)
    print(f"Base Directory: {base_data_dir}")

    bench_dir = os.path.join(base_data_dir, "public_benchmarks", "fruit_freshness_images")
    annot_dir = os.path.join(bench_dir, "Annotations")
    img_dir = os.path.join(bench_dir, "JPEGImages")

    if not os.path.exists(annot_dir) or not os.path.exists(img_dir):
        raise FileNotFoundError(f"Annotations or JPEGImages directory not found in {bench_dir}")

    xml_files = sorted([f for f in os.listdir(annot_dir) if f.endswith(".xml")])
    print(f"Found {len(xml_files)} Pascal VOC XML annotation files.")

    records = []
    seen_hashes = {}
    corrupted_count = 0
    duplicate_count = 0
    missing_annot_count = 0

    t0 = time.time()
    for idx, xf in enumerate(xml_files):
        img_name = xf.replace(".xml", ".jpg")
        img_path = os.path.join(img_dir, img_name)
        xml_path = os.path.join(annot_dir, xf)

        if not os.path.exists(img_path):
            corrupted_count += 1
            continue

        try:
            parsed = parse_voc_xml(xml_path)
            if not parsed["classes"]:
                missing_annot_count += 1
                continue

            primary_raw_label = parsed["classes"][0]
            if primary_raw_label not in RAW_STAGE_MAP:
                continue

            # Load image
            img = cv2.imread(img_path)
            if img is None:
                corrupted_count += 1
                continue

            h, w = img.shape[:2]
            if h < 20 or w < 20:
                corrupted_count += 1
                continue

            # Duplicate detection via perceptual hash
            im_hash = compute_image_hash(img)
            if im_hash in seen_hashes:
                duplicate_count += 1
            else:
                seen_hashes[im_hash] = img_name

            species = SPECIES_LABEL_MAP[primary_raw_label]
            stage_idx = RAW_STAGE_MAP[primary_raw_label]
            stage_name = STAGE_NAME_MAP[stage_idx]

            # Bounding box coordinates normalized
            norm_boxes = []
            for b in parsed["boxes"]:
                norm_boxes.append({
                    "class": b["name"],
                    "xmin": round(b["xmin"] / max(w, 1), 4),
                    "ymin": round(b["ymin"] / max(h, 1), 4),
                    "xmax": round(b["xmax"] / max(w, 1), 4),
                    "ymax": round(b["ymax"] / max(h, 1), 4),
                    "box_width": round((b["xmax"] - b["xmin"]) / max(w, 1), 4),
                    "box_height": round((b["ymax"] - b["ymin"]) / max(h, 1), 4)
                })

            records.append({
                "image_id": f"IMG-{idx+1:05d}",
                "filename": img_name,
                "relative_path": os.path.join("JPEGImages", img_name).replace("\\", "/"),
                "raw_label": primary_raw_label,
                "standardized_species": species,
                "standardized_stage_idx": stage_idx,
                "standardized_stage_name": stage_name,
                "width": w,
                "height": h,
                "perceptual_hash": im_hash,
                "bounding_boxes": norm_boxes,
                "bounding_box_count": len(norm_boxes),
                "license": "Apache-2.0",
                "source_benchmark": "Fruit Freshness Detection Dataset"
            })

            if (idx + 1) % 500 == 0:
                print(f"  Validated {idx + 1}/{len(xml_files)} files...")
        except Exception as e:
            corrupted_count += 1
            continue

    total_valid = len(records)
    print(f"\n[Validation Complete in {time.time() - t0:.2f}s]")
    print(f"  Total verified valid images: {total_valid}")
    print(f"  Corrupted or missing files: {corrupted_count}")
    print(f"  Duplicate perceptual hashes detected: {duplicate_count}")

    # Stratified Split: 80% Train, 10% Validation, 10% Test
    indices = np.arange(total_valid)
    raw_labels = [r["raw_label"] for r in records]

    train_idx, temp_idx = train_test_split(
        indices, test_size=0.20, random_state=42, stratify=raw_labels
    )
    temp_labels = [raw_labels[i] for i in temp_idx]
    val_idx, test_idx = train_test_split(
        temp_idx, test_size=0.50, random_state=42, stratify=temp_labels
    )

    for i in train_idx:
        records[i]["split"] = "train"
    for i in val_idx:
        records[i]["split"] = "val"
    for i in test_idx:
        records[i]["split"] = "test"

    print(f"  Partition split: Train={len(train_idx)} (80%) | Val={len(val_idx)} (10%) | Test={len(test_idx)} (10%)")

    # Extract Visual Features for all splits
    print("\nExtracting 36-dimensional multi-domain visual feature vectors...")
    X_features = np.zeros((total_valid, 36), dtype=np.float32)
    t_feat_start = time.time()
    for i, rec in enumerate(records):
        img_full_path = os.path.join(img_dir, rec["filename"])
        img = cv2.imread(img_full_path)
        feat = extract_multi_domain_features(img)
        X_features[i] = feat
        if (i + 1) % 500 == 0:
            print(f"  Extracted features for {i + 1}/{total_valid} images...")
    print(f"Feature extraction finished in {time.time() - t_feat_start:.2f}s.")

    # Save Cached Features per Split
    os.makedirs(output_features_dir, exist_ok=True)
    features_cache_path = os.path.join(output_features_dir, "cv_dataset_features.npz")
    np.savez_compressed(
        features_cache_path,
        X_train=X_features[train_idx],
        X_val=X_features[val_idx],
        X_test=X_features[test_idx],
        y_species_train=np.array([SUPPORTED_SPECIES.index(records[i]["standardized_species"]) for i in train_idx]),
        y_species_val=np.array([SUPPORTED_SPECIES.index(records[i]["standardized_species"]) for i in val_idx]),
        y_species_test=np.array([SUPPORTED_SPECIES.index(records[i]["standardized_species"]) for i in test_idx]),
        y_stage_train=np.array([records[i]["standardized_stage_idx"] for i in train_idx]),
        y_stage_val=np.array([records[i]["standardized_stage_idx"] for i in val_idx]),
        y_stage_test=np.array([records[i]["standardized_stage_idx"] for i in test_idx]),
        y_raw_train=np.array([records[i]["raw_label"] for i in train_idx]),
        y_raw_val=np.array([records[i]["raw_label"] for i in val_idx]),
        y_raw_test=np.array([records[i]["raw_label"] for i in test_idx])
    )
    print(f"Saved pre-computed compressed feature matrices to: {features_cache_path}")

    # Build Class Distribution Summary
    species_dist = {}
    stage_dist = {}
    raw_dist = {}
    for r in records:
        sp = r["standardized_species"]
        species_dist[sp] = species_dist.get(sp, 0) + 1
        st = r["standardized_stage_name"]
        stage_dist[st] = stage_dist.get(st, 0) + 1
        rw = r["raw_label"]
        raw_dist[rw] = raw_dist.get(rw, 0) + 1

    manifest = {
        "metadata": {
            "dataset_name": "Fruit Freshness Benchmark - Standardized Multi-Modal Ingestion",
            "version": "2.2-reproducible",
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "license": "Apache-2.0",
            "supported_species": SUPPORTED_SPECIES,
            "fallback_species": FALLBACK_SPECIES,
            "stage_labels": STAGE_NAME_MAP,
            "total_samples": total_valid,
            "train_samples": len(train_idx),
            "val_samples": len(val_idx),
            "test_samples": len(test_idx),
            "feature_dimension": 36,
            "features_cache_file": os.path.basename(features_cache_path),
            "corrupted_images": corrupted_count,
            "perceptual_duplicates": duplicate_count,
            "class_distribution_raw": raw_dist,
            "species_distribution": species_dist,
            "stage_distribution": stage_dist
        },
        "records": records
    }

    os.makedirs(os.path.dirname(output_manifest_path), exist_ok=True)
    with open(output_manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Saved complete reproducible manifest ({total_valid} records) to: {output_manifest_path}")

    return manifest["metadata"]

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manifest_out = os.path.join(base_dir, "data", "cv_dataset_manifest.json")
    features_out = os.path.join(base_dir, "data")
    meta = prepare_pipeline(os.path.join(base_dir, "data"), manifest_out, features_out)
    print("\nDataset preparation pipeline succeeded:")
    print(json.dumps(meta, indent=2))
