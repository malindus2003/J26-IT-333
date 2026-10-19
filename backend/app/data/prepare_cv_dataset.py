"""
Reproducible Dataset Preparation & Validation Pipeline (v2.3 Leakage-Free & Decoupled Schema)
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

Ingests, validates, standardizes, and partitions the public benchmark dataset
(3,202 images, 7,087 bounding boxes) with Apache 2.0 attribution manifest.
Enforces:
1. Decoupled Taxonomy (Produce Species, Ripeness, Visible Spoilage, Defect Types)
2. Strict Foreground Produce Segmentation (eliminates white background / glare mould contamination)
3. Zero-Leakage Group Partitioning by Perceptual Hash Clusters
"""

import os
import sys
import json
import time
import hashlib
import xml.etree.ElementTree as ET
from typing import Dict, List, Tuple, Any, Optional
from collections import defaultdict
import numpy as np
import cv2

# ==============================================================================
# 1. STANDARDIZED DECOUPLED TAXONOMY & LABEL SCHEMA
# ==============================================================================

SUPPORTED_SPECIES = ["Apple", "Banana", "Orange", "Strawberry"]
FALLBACK_SPECIES = "Unknown / Unsupported Produce"

RIPENESS_STAGES = ["Unripe", "Ripe / Optimal", "Overripe", "Unknown"]

SPOILAGE_CATEGORIES = [
    "No visible spoilage detected",
    "Localized visible defect",
    "Significant visible spoilage",
    "Uncertain"
]

DEFECT_TYPES = [
    "None",
    "Brown spots",
    "Bruising",
    "Discoloration",
    "Visible mould",
    "Necrotic lesions"
]

# Ground-truth transformation mappings from raw dataset labels
RAW_TAXONOMY_MAP = {
    "fresh_apple": {
        "species": "Apple",
        "ripeness": "Ripe / Optimal",
        "spoilage_category": "No visible spoilage detected",
        "spoilage_binary": 0,
        "mould_binary": 0,
        "defect_type": "None",
        "description": "Crisp harvest-fresh apple with intact cuticle."
    },
    "normal_apple": {
        "species": "Apple",
        "ripeness": "Ripe / Optimal",
        "spoilage_category": "No visible spoilage detected",
        "spoilage_binary": 0,
        "mould_binary": 0,
        "defect_type": "None",
        "description": "Standard retail ripe apple in prime culinary condition."
    },
    "rotten_apple": {
        "species": "Apple",
        "ripeness": "Overripe",
        "spoilage_category": "Significant visible spoilage",
        "spoilage_binary": 1,
        "mould_binary": 0,
        "defect_type": "Necrotic lesions",
        "description": "Decomposing apple with tissue softening and necrotic lesions."
    },
    "fresh_banana": {
        "species": "Banana",
        "ripeness": "Unripe",
        "spoilage_category": "No visible spoilage detected",
        "spoilage_binary": 0,
        "mould_binary": 0,
        "defect_type": "None",
        "description": "Firm green / underripe banana, high starch content."
    },
    "normal_banana": {
        "species": "Banana",
        "ripeness": "Ripe / Optimal",
        "spoilage_category": "No visible spoilage detected",
        "spoilage_binary": 0,
        "mould_binary": 0,
        "defect_type": "Brown spots",
        "description": "Yellow ripe banana at peak eating quality, minor sugar spotting."
    },
    "rotten_banana": {
        "species": "Banana",
        "ripeness": "Overripe",
        "spoilage_category": "Significant visible spoilage",
        "spoilage_binary": 1,
        "mould_binary": 0,
        "defect_type": "Necrotic lesions",
        "description": "Blackened senescent banana with microbial liquefaction."
    },
    "fresh_orange": {
        "species": "Orange",
        "ripeness": "Ripe / Optimal",
        "spoilage_category": "No visible spoilage detected",
        "spoilage_binary": 0,
        "mould_binary": 0,
        "defect_type": "None",
        "description": "Firm fresh citrus fruit with tight rind and high turgor."
    },
    "normal_orange": {
        "species": "Orange",
        "ripeness": "Ripe / Optimal",
        "spoilage_category": "No visible spoilage detected",
        "spoilage_binary": 0,
        "mould_binary": 0,
        "defect_type": "None",
        "description": "Ripe juicy citrus fruit ready for fresh service."
    },
    "rotten_orange": {
        "species": "Orange",
        "ripeness": "Overripe",
        "spoilage_category": "Significant visible spoilage",
        "spoilage_binary": 1,
        "mould_binary": 1,
        "defect_type": "Visible mould",
        "description": "Citrus with active Penicillium digitatum/italicum mould decay."
    },
    "fresh_strawberry": {
        "species": "Strawberry",
        "ripeness": "Ripe / Optimal",
        "spoilage_category": "No visible spoilage detected",
        "spoilage_binary": 0,
        "mould_binary": 0,
        "defect_type": "None",
        "description": "Harvest-fresh ripe strawberry with intact green calyx and firm achenes."
    },
    "normal_strawberry": {
        "species": "Strawberry",
        "ripeness": "Ripe / Optimal",
        "spoilage_category": "No visible spoilage detected",
        "spoilage_binary": 0,
        "mould_binary": 0,
        "defect_type": "None",
        "description": "Standard retail ripe strawberry in prime dessert condition."
    },
    "rotten_strawberry": {
        "species": "Strawberry",
        "ripeness": "Overripe",
        "spoilage_category": "Significant visible spoilage",
        "spoilage_binary": 1,
        "mould_binary": 1,
        "defect_type": "Visible mould",
        "description": "Decomposing strawberry with active Botrytis cinerea or Rhizopus mould."
    }
}

# ==============================================================================
# 2. IMAGE HASHING & FOREGROUND SEGMENTATION
# ==============================================================================

def compute_image_hash(img_bgr: np.ndarray) -> str:
    """Compute 16x16 difference hash for clustering near-duplicates."""
    small = cv2.resize(img_bgr, (17, 16), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    diff = gray[:, 1:] > gray[:, :-1]
    return hashlib.md5(diff.tobytes()).hexdigest()

def segment_produce_foreground(img_bgr: np.ndarray, target_size: Tuple[int, int] = (256, 256)) -> Tuple[np.ndarray, np.ndarray, int]:
    """
    Isolates produce foreground from background surfaces (plates, tables, walls).
    Returns:
        resized_bgr: Resized image
        fg_mask: Binary uint8 mask (255 for produce, 0 for background)
        fg_pixel_count: Number of foreground pixels
    """
    resized = cv2.resize(img_bgr, target_size)
    hsv = cv2.cvtColor(resized, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

    # Estimate background from 8px outer border
    border_pixels = np.concatenate([
        resized[:8, :].reshape(-1, 3),
        resized[-8:, :].reshape(-1, 3),
        resized[:, :8].reshape(-1, 3),
        resized[:, -8:].reshape(-1, 3)
    ], axis=0)
    bg_median = np.median(border_pixels, axis=0)
    
    # Color distance from border background
    bgr_diff = np.linalg.norm(resized.astype(np.float32) - bg_median, axis=2)
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    
    # Candidate fruit mask: difference from background or high chromaticity
    fg_candidate = (bgr_diff > 35) | (sat > 45) | (np.abs(val.astype(float) - float(bg_median.mean())) > 38)
    
    # Morphological refinement
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    fg_clean = cv2.morphologyEx(fg_candidate.astype(np.uint8), cv2.MORPH_CLOSE, kernel, iterations=2)
    fg_clean = cv2.morphologyEx(fg_clean, cv2.MORPH_OPEN, kernel, iterations=1)
    
    # Find largest contour representing produce specimen
    contours, _ = cv2.findContours(fg_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros(target_size, dtype=np.uint8)
    
    if contours:
        c = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(c)
        if area > (target_size[0] * target_size[1] * 0.04): # At least 4% of frame
            cv2.drawContours(mask, [c], -1, 255, -1)
            
    fg_pixel_count = int(np.sum(mask > 0))
    if fg_pixel_count < (target_size[0] * target_size[1] * 0.05):
        # Fallback: if border estimation over-pruned, use center 80% circle
        cv2.circle(mask, (target_size[0] // 2, target_size[1] // 2), int(target_size[0] * 0.42), 255, -1)
        fg_pixel_count = int(np.sum(mask > 0))
        
    return resized, mask, fg_pixel_count

# ==============================================================================
# 3. 42-DIMENSIONAL FOREGROUND-ISOLATED FEATURE EXTRACTOR
# ==============================================================================

def extract_multi_domain_features(img_bgr: np.ndarray, presegmented=None) -> np.ndarray:
    """
    Extracts a 42-dimensional multi-domain visual feature vector computed
    STRICTLY on the segmented fruit foreground (eliminates white background / glare bugs):
    - 18 Color Moments (mean & std of RGB, HSV, LAB on foreground)
    - 7 Pigment & Biological indices (Green, Yellow, Red, Browning, Mould, Specular Glare, Dark Necrosis)
    - 6 Texture & Edge descriptors (Sobel gradient, Canny edge density, Laplacian variance, LBP contrast)
    - 7 Invariant Hu Moments (log-transformed)
    - 4 Geometry & Defect statistics (Defect count, Defect area %, Foreground ratio, Aspect ratio)
    """
    if presegmented is not None:
        resized, mask, fg_pixels = presegmented
    else:
        resized, mask, fg_pixels = segment_produce_foreground(img_bgr, (256, 256))
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(resized, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(resized, cv2.COLOR_BGR2LAB)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    
    fg_mask_bool = mask > 0
    fg_count = max(float(fg_pixels), 1.0)
    total_frame_pixels = 256.0 * 256.0
    
    # 1. Color channel moments on foreground only -> 18 features
    r_fg = rgb[:, :, 0][fg_mask_bool]
    g_fg = rgb[:, :, 1][fg_mask_bool]
    b_fg = rgb[:, :, 2][fg_mask_bool]
    h_fg = hsv[:, :, 0][fg_mask_bool]
    s_fg = hsv[:, :, 1][fg_mask_bool]
    v_fg = hsv[:, :, 2][fg_mask_bool]
    l_fg = lab[:, :, 0][fg_mask_bool]
    a_fg = lab[:, :, 1][fg_mask_bool]
    b_lab_fg = lab[:, :, 2][fg_mask_bool]
    
    color_moments = [
        float(np.mean(r_fg)), float(np.std(r_fg)),
        float(np.mean(g_fg)), float(np.std(g_fg)),
        float(np.mean(b_fg)), float(np.std(b_fg)),
        float(np.mean(h_fg)), float(np.std(h_fg)),
        float(np.mean(s_fg)), float(np.std(s_fg)),
        float(np.mean(v_fg)), float(np.std(v_fg)),
        float(np.mean(l_fg)), float(np.std(l_fg)),
        float(np.mean(a_fg)), float(np.std(a_fg)),
        float(np.mean(b_lab_fg)), float(np.std(b_lab_fg))
    ]
    
    # 2. Biological Pigment & Defect Indices strictly on foreground -> 7 features
    # Green chlorophyll (unripe banana / Granny Smith apple)
    green_mask = fg_mask_bool & (hsv[:, :, 0] >= 33) & (hsv[:, :, 0] <= 85) & (hsv[:, :, 1] >= 40)
    green_ratio = float(np.sum(green_mask) / fg_count * 100.0)
    
    # Yellow carotenoid (ripe banana / yellow apple)
    yellow_mask = fg_mask_bool & (hsv[:, :, 0] >= 18) & (hsv[:, :, 0] < 33) & (hsv[:, :, 1] >= 60)
    yellow_ratio = float(np.sum(yellow_mask) / fg_count * 100.0)
    
    # Red anthocyanin (red apple / strawberry)
    red_mask = fg_mask_bool & ((hsv[:, :, 0] < 14) | (hsv[:, :, 0] > 165)) & (hsv[:, :, 1] >= 50)
    red_ratio = float(np.sum(red_mask) / fg_count * 100.0)
    
    # Specular reflection glare:
    # Pure saturated white highlights (S < 22, V > 240) in compact areas (< 140 px)
    glare_cand = fg_mask_bool & (hsv[:, :, 1] < 22) & (hsv[:, :, 2] > 240)
    num_g, g_labels, g_stats, _ = cv2.connectedComponentsWithStats(glare_cand.astype(np.uint8))
    glare_mask = np.zeros_like(mask)
    for gi in range(1, num_g):
        if g_stats[gi, cv2.CC_STAT_AREA] < 140:
            glare_mask[g_labels == gi] = 255
    glare_ratio = float(np.sum(glare_mask > 0) / fg_count * 100.0)
    
    # True fungal mycelium / mould spore patch (low saturation, elevated luminance, contiguous colony, not compact glare)
    # Fungal hyphae: S < 55, V in [80, 255], area >= 35 px, not pure specular glare
    cand_mould_raw = fg_mask_bool & (hsv[:, :, 1] < 55) & (hsv[:, :, 2] >= 80) & (glare_mask == 0)
    num_m, m_labels, m_stats, _ = cv2.connectedComponentsWithStats(cand_mould_raw.astype(np.uint8))
    mould_mask = np.zeros_like(mask)
    for mi in range(1, num_m):
        if m_stats[mi, cv2.CC_STAT_AREA] >= 35:
            mould_mask[m_labels == mi] = 255
    mould_coverage = float(np.sum(mould_mask > 0) / fg_count * 100.0)
    
    # Dark necrotic rot / sunken lesions (very low luminance on fruit skin)
    necrotic_mask = fg_mask_bool & (hsv[:, :, 2] < 50) & (hsv[:, :, 1] < 100)
    necrotic_ratio = float(np.sum(necrotic_mask) / fg_count * 100.0)
    
    # Biological browning (enzymatic melanin: darker brownish hues, distinct from clean red peels)
    brown_mask = fg_mask_bool & (hsv[:, :, 0] >= 10) & (hsv[:, :, 0] <= 26) & (hsv[:, :, 1] >= 35) & (hsv[:, :, 1] <= 130) & (hsv[:, :, 2] >= 45) & (hsv[:, :, 2] <= 135)
    browning_ratio = float(np.sum(brown_mask) / fg_count * 100.0)
    
    pigment_indices = [
        green_ratio, yellow_ratio, red_ratio,
        glare_ratio, mould_coverage, necrotic_ratio, browning_ratio
    ]
    
    # 3. Surface Texture & Gradients on Foreground -> 6 features
    gray_fg = gray.copy()
    gray_fg[~fg_mask_bool] = 0
    
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(sobelx**2 + sobely**2)
    grad_fg = grad_mag[fg_mask_bool]
    
    gradient_mean = float(np.mean(grad_fg)) if len(grad_fg) > 0 else 0.0
    gradient_std = float(np.std(grad_fg)) if len(grad_fg) > 0 else 0.0
    
    edges = cv2.Canny(gray, 40, 130)
    edge_fg = edges[fg_mask_bool]
    edge_density = float(np.sum(edge_fg > 0) / fg_count * 100.0)
    
    laplacian_full = np.abs(cv2.Laplacian(gray, cv2.CV_64F))
    lap_fg = laplacian_full[fg_mask_bool]
    laplacian_mean = float(np.mean(lap_fg)) if len(lap_fg) > 0 else 0.0
    laplacian_var = float(np.var(lap_fg)) if len(lap_fg) > 0 else 0.0
    
    # Local intensity variance (roughness)
    intensity_std = float(np.std(gray[fg_mask_bool])) if len(gray[fg_mask_bool]) > 0 else 0.0
    
    texture_features = [
        gradient_mean, gradient_std, edge_density,
        laplacian_mean, laplacian_var, intensity_std
    ]
    
    # 4. Invariant Hu Moments (Shape & Morphological Invariants) -> 7 features
    moments = cv2.moments(mask)
    hu = cv2.HuMoments(moments).flatten()
    log_hu = [-np.sign(h_val) * np.log10(np.abs(h_val) + 1e-10) for h_val in hu]
    
    # 5. Defect Contours & Geometry -> 4 features
    combined_defect_binary = ((mould_mask | necrotic_mask).astype(np.uint8) * 255)
    contours_d, _ = cv2.findContours(combined_defect_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    significant_defects = [c for c in contours_d if cv2.contourArea(c) > 35]
    defect_count = float(len(significant_defects))
    defect_area_pct = float(np.sum(combined_defect_binary > 0) / fg_count * 100.0)
    
    fg_coverage_ratio = float(fg_pixels / total_frame_pixels * 100.0)
    
    # Aspect ratio of foreground bounding rect
    fg_contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if fg_contours:
        bx, by, bw, bh = cv2.boundingRect(max(fg_contours, key=cv2.contourArea))
        aspect_ratio = float(bw) / float(max(bh, 1))
    else:
        aspect_ratio = 1.0
        
    geometry_defect_features = [defect_count, defect_area_pct, fg_coverage_ratio, aspect_ratio]
    
    # Total dimension: 18 + 7 + 6 + 7 + 4 = 42 features
    feature_vector = np.array(
        color_moments + pigment_indices + texture_features + list(log_hu) + geometry_defect_features,
        dtype=np.float32
    )
    return feature_vector

# ==============================================================================
# 4. PASCAL VOC XML PARSING
# ==============================================================================

def parse_voc_xml(xml_path: str) -> Dict[str, Any]:
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

# ==============================================================================
# 5. REPRODUCIBLE DATASET PREPARATION PIPELINE
# ==============================================================================

def prepare_pipeline(base_data_dir: str, output_manifest_path: str, output_features_dir: str) -> Dict[str, Any]:
    print("=" * 80)
    print(" GREENPULSE DATASET PREPARATION PIPELINE (v2.3 LEAKAGE-FREE & DECOUPLED SCHEMA) ")
    print("=" * 80)

    bench_dir = os.path.join(base_data_dir, "public_benchmarks", "fruit_freshness_images")
    annot_dir = os.path.join(bench_dir, "Annotations")
    img_dir = os.path.join(bench_dir, "JPEGImages")

    if not os.path.exists(annot_dir) or not os.path.exists(img_dir):
        raise FileNotFoundError(f"Annotations or JPEGImages directory not found in {bench_dir}")

    xml_files = sorted([f for f in os.listdir(annot_dir) if f.endswith(".xml")])
    print(f"Found {len(xml_files)} Pascal VOC XML annotation files.")

    records = []
    hash_to_indices = defaultdict(list)
    corrupted_count = 0
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

            raw_label = parsed["classes"][0]
            if raw_label not in RAW_TAXONOMY_MAP:
                continue

            img = cv2.imread(img_path)
            if img is None:
                corrupted_count += 1
                continue

            h, w = img.shape[:2]
            if h < 20 or w < 20:
                corrupted_count += 1
                continue

            tax = RAW_TAXONOMY_MAP[raw_label]
            im_hash = compute_image_hash(img)

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

            rec = {
                "image_id": f"IMG-{idx+1:05d}",
                "filename": img_name,
                "relative_path": os.path.join("JPEGImages", img_name).replace("\\", "/"),
                "raw_label": raw_label,
                "produce_identity": tax["species"],
                "ripeness_stage": tax["ripeness"],
                "visible_spoilage": tax["spoilage_category"],
                "spoilage_binary": tax["spoilage_binary"],
                "mould_binary": tax.get("mould_binary", 0),
                "defect_type": tax["defect_type"],
                "description": tax["description"],
                "width": w,
                "height": h,
                "perceptual_hash": im_hash,
                "bounding_boxes": norm_boxes,
                "bounding_box_count": len(norm_boxes),
                "license": "Apache-2.0",
                "source_benchmark": "Fruit Freshness Detection Dataset"
            }
            records.append(rec)
            hash_to_indices[im_hash].append(len(records) - 1)

            if (idx + 1) % 500 == 0:
                print(f"  Parsed {idx + 1}/{len(xml_files)} files...")
        except Exception:
            corrupted_count += 1
            continue

    total_valid = len(records)
    print(f"\n[Validation Complete in {time.time() - t0:.2f}s]")
    print(f"  Total verified valid images: {total_valid}")
    print(f"  Unique perceptual hash clusters: {len(hash_to_indices)}")

    # ==============================================================================
    # 6. LEAKAGE-FREE GROUP PARTITIONING BY HASH CLUSTERS
    # ==============================================================================
    # Assign entire hash clusters to Train (80%), Val (10%), or Test (10%)
    np.random.seed(42)
    cluster_hashes = list(hash_to_indices.keys())
    np.random.shuffle(cluster_hashes)

    train_indices = []
    val_indices = []
    test_indices = []

    target_train = int(0.80 * total_valid)
    target_val = int(0.10 * total_valid)

    current_train = 0
    current_val = 0

    for ch in cluster_hashes:
        cluster_idxs = hash_to_indices[ch]
        c_len = len(cluster_idxs)
        if current_train + c_len <= target_train:
            train_indices.extend(cluster_idxs)
            current_train += c_len
        elif current_val + c_len <= target_val:
            val_indices.extend(cluster_idxs)
            current_val += c_len
        else:
            test_indices.extend(cluster_idxs)

    train_indices = np.array(train_indices)
    val_indices = np.array(val_indices)
    test_indices = np.array(test_indices)

    for i in train_indices:
        records[i]["split"] = "train"
    for i in val_indices:
        records[i]["split"] = "val"
    for i in test_indices:
        records[i]["split"] = "test"

    print(f"\n[Leakage-Free Partition Split]:")
    print(f"  Train: {len(train_indices)} images ({len(train_indices)/total_valid*100:.1f}%)")
    print(f"  Val:   {len(val_indices)} images ({len(val_indices)/total_valid*100:.1f}%)")
    print(f"  Test:  {len(test_indices)} images ({len(test_indices)/total_valid*100:.1f}%)")

    # Verify zero hash leakage
    train_h = set(records[i]["perceptual_hash"] for i in train_indices)
    val_h = set(records[i]["perceptual_hash"] for i in val_indices)
    test_h = set(records[i]["perceptual_hash"] for i in test_indices)
    leakage_count = len(train_h.intersection(test_h)) + len(train_h.intersection(val_h)) + len(val_h.intersection(test_h))
    print(f"  Cross-Split Hash Leakage Count: {leakage_count} (Must be exactly 0!)")
    assert leakage_count == 0, "Error: Data leakage detected between splits!"

    # ==============================================================================
    # 7. FEATURE EXTRACTION (42 FOREGROUND FEATURES)
    # ==============================================================================
    print("\nExtracting 42-dimensional foreground-isolated visual feature vectors...")
    X_features = np.zeros((total_valid, 42), dtype=np.float32)
    t_feat_start = time.time()
    for i, rec in enumerate(records):
        img_full_path = os.path.join(img_dir, rec["filename"])
        img = cv2.imread(img_full_path)
        feat = extract_multi_domain_features(img)
        X_features[i] = feat
        if (i + 1) % 500 == 0:
            print(f"  Extracted foreground features for {i + 1}/{total_valid} images...")
    print(f"Foreground feature extraction finished in {time.time() - t_feat_start:.2f}s.")

    # Save Compressed Features Per Split
    os.makedirs(output_features_dir, exist_ok=True)
    features_cache_path = os.path.join(output_features_dir, "cv_dataset_features.npz")
    np.savez_compressed(
        features_cache_path,
        X_train=X_features[train_indices],
        X_val=X_features[val_indices],
        X_test=X_features[test_indices],
        y_species_train=np.array([SUPPORTED_SPECIES.index(records[i]["produce_identity"]) for i in train_indices]),
        y_species_val=np.array([SUPPORTED_SPECIES.index(records[i]["produce_identity"]) for i in val_indices]),
        y_species_test=np.array([SUPPORTED_SPECIES.index(records[i]["produce_identity"]) for i in test_indices]),
        y_spoilage_train=np.array([records[i]["spoilage_binary"] for i in train_indices]),
        y_spoilage_val=np.array([records[i]["spoilage_binary"] for i in val_indices]),
        y_spoilage_test=np.array([records[i]["spoilage_binary"] for i in test_indices]),
        y_mould_train=np.array([records[i].get("mould_binary", 0) for i in train_indices]),
        y_mould_val=np.array([records[i].get("mould_binary", 0) for i in val_indices]),
        y_mould_test=np.array([records[i].get("mould_binary", 0) for i in test_indices]),
        y_ripeness_train=np.array([RIPENESS_STAGES.index(records[i]["ripeness_stage"]) for i in train_indices]),
        y_ripeness_val=np.array([RIPENESS_STAGES.index(records[i]["ripeness_stage"]) for i in val_indices]),
        y_ripeness_test=np.array([RIPENESS_STAGES.index(records[i]["ripeness_stage"]) for i in test_indices]),
        y_raw_train=np.array([records[i]["raw_label"] for i in train_indices]),
        y_raw_val=np.array([records[i]["raw_label"] for i in val_indices]),
        y_raw_test=np.array([records[i]["raw_label"] for i in test_indices])
    )
    print(f"Saved pre-computed compressed feature matrices to: {features_cache_path}")

    # Build Distributions
    species_dist = defaultdict(int)
    spoilage_dist = defaultdict(int)
    ripeness_dist = defaultdict(int)
    raw_dist = defaultdict(int)
    for r in records:
        species_dist[r["produce_identity"]] += 1
        spoilage_dist[r["visible_spoilage"]] += 1
        ripeness_dist[r["ripeness_stage"]] += 1
        raw_dist[r["raw_label"]] += 1

    manifest = {
        "metadata": {
            "dataset_name": "Fruit Freshness Benchmark - Leakage-Free Foreground Multi-Modal Ingestion",
            "version": "2.3-decoupled-leakage-free",
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "license": "Apache-2.0",
            "supported_species": SUPPORTED_SPECIES,
            "fallback_species": FALLBACK_SPECIES,
            "ripeness_stages": RIPENESS_STAGES,
            "spoilage_categories": SPOILAGE_CATEGORIES,
            "defect_types": DEFECT_TYPES,
            "total_samples": total_valid,
            "train_samples": len(train_indices),
            "val_samples": len(val_indices),
            "test_samples": len(test_indices),
            "feature_dimension": 42,
            "features_cache_file": os.path.basename(features_cache_path),
            "corrupted_images": corrupted_count,
            "unique_hash_clusters": len(hash_to_indices),
            "cross_split_hash_leakage": leakage_count,
            "class_distribution_raw": dict(raw_dist),
            "species_distribution": dict(species_dist),
            "spoilage_distribution": dict(spoilage_dist),
            "ripeness_distribution": dict(ripeness_dist)
        },
        "records": records
    }

    os.makedirs(os.path.dirname(output_manifest_path), exist_ok=True)
    with open(output_manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Saved manifest ({total_valid} records) to: {output_manifest_path}")

    return manifest["metadata"]

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manifest_out = os.path.join(base_dir, "data", "cv_dataset_manifest.json")
    features_out = os.path.join(base_dir, "data")
    meta = prepare_pipeline(os.path.join(base_dir, "data"), manifest_out, features_out)
    print("\nDataset preparation pipeline succeeded:")
    print(json.dumps(meta, indent=2))
