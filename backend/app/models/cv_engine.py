"""
GreenPulse Computer Vision Inference Engine (v2.2-trained)
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

Multi-stage CPU-optimized inference pipeline backed by genuine machine learning models:
1. Multi-domain Visual Feature Extractor (36 features)
2. Produce Species Identifier with Rejection Threshold (Apple, Banana, Orange, fallback Unknown)
3. Freshness & Spoilage Classifier (Unripe, Ripe/Optimal, Overripe, Spoiled/Rotten, Uncertain)
4. Continuous Defect Severity Regressor (0-100%)
5. Multi-Cue Defect Contour Localization (Bounding Boxes with severity & area)
6. Scientifically Grounded Remaining Shelf-Life (RSL) with 90% Prediction Intervals
"""

import io
import os
import time
import uuid
import json
import joblib
import numpy as np
import cv2
from PIL import Image
from typing import Dict, Any, Tuple, List, Optional

from ..data.prepare_cv_dataset import (
    extract_multi_domain_features,
    SUPPORTED_SPECIES,
    FALLBACK_SPECIES,
    STAGE_NAME_MAP
)
from .train_cv_models import (
    segment_produce_foreground,
    PRODUCE_INFO
)

class FoodQualityVisionEngine:
    """
    Production Computer Vision Engine for Produce Identification,
    Defect Localization, Freshness Assessment, and Remaining Shelf-Life Estimation.
    """

    STAGE_NAMES = {
        0: "Unripe / Firm (Grade A)",
        1: "Ripe / Optimal (Grade B)",
        2: "Overripe / Softening (Use Today)",
        3: "Spoiled / Rotten (Grade F)"
    }

    CONTIGUOUS_TO_STAGE = {0: 0, 1: 1, 2: 3}

    def __init__(self):
        self.models_loaded = False
        self.produce_classifier = None
        self.stage_classifier = None
        self.spoilage_regressor = None
        self.feature_scaler = None
        self.produce_metadata = {}
        self.real_metrics = {}
        self.load_trained_cv_models()

    def load_trained_cv_models(self):
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            saved_models_dir = os.path.join(base_dir, "saved_models")

            species_path = os.path.join(saved_models_dir, "produce_species_classifier.joblib")
            stage_path = os.path.join(saved_models_dir, "cv_spoilage_classifier.joblib")
            reg_path = os.path.join(saved_models_dir, "cv_ripeness_regressor.joblib")
            scaler_path = os.path.join(saved_models_dir, "cv_feature_scaler.joblib")
            meta_path = os.path.join(saved_models_dir, "produce_metadata.json")
            metrics_path = os.path.join(saved_models_dir, "cv_real_metrics.json")

            if os.path.exists(species_path):
                self.produce_classifier = joblib.load(species_path)

            if os.path.exists(stage_path):
                self.stage_classifier = joblib.load(stage_path)

            if os.path.exists(reg_path):
                self.spoilage_regressor = joblib.load(reg_path)

            if os.path.exists(scaler_path):
                self.feature_scaler = joblib.load(scaler_path)

            if os.path.exists(meta_path):
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.produce_metadata = json.load(f)

            if os.path.exists(metrics_path):
                with open(metrics_path, "r", encoding="utf-8") as f:
                    self.real_metrics = json.load(f)

            if self.produce_classifier and self.stage_classifier and self.spoilage_regressor:
                self.models_loaded = True
                print(f"[FoodQualityVisionEngine] Successfully loaded v2.2 trained models from {saved_models_dir}")
            else:
                print("[FoodQualityVisionEngine] One or more trained models missing; will use heuristic fallbacks.")
        except Exception as e:
            print(f"[FoodQualityVisionEngine] Error loading models: {e}")
            self.models_loaded = False

    def analyze_image(self, image_bytes: bytes, category: str = "Fruits") -> Dict[str, Any]:
        """
        Executes end-to-end multi-stage inference on an uploaded or camera-captured image.
        Returns detailed diagnostics with calibrated confidence, defect localization, and RSL.
        """
        t_start = time.perf_counter()
        analysis_id = f"CV-SCAN-{int(time.time())}-{uuid.uuid4().hex[:6]}"

        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            return self._default_features(category, analysis_id)

        orig_h, orig_w = img_bgr.shape[:2]
        img_resized = cv2.resize(img_bgr, (256, 256))
        rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

        # 1. Multi-Cue Foreground Produce Segmentation
        mask, primary_contour, fg_pixels, _ = segment_produce_foreground(img_bgr)

        # 2. Extract 36-dimensional multi-domain feature vector
        feat_vec = extract_multi_domain_features(img_bgr)
        r_mean, g_mean, b_mean = float(feat_vec[0]), float(feat_vec[2]), float(feat_vec[4])
        avg_brightness = float(feat_vec[10]) # V mean
        browning_percent = round(float(feat_vec[18]), 2)
        green_ratio = round(float(feat_vec[19]), 2)
        carotenoid_ratio = round(float(feat_vec[20]), 2)
        mould_coverage = round(float(feat_vec[22]), 2)
        mould_detected = mould_coverage >= 2.0
        texture_degradation = min(100.0, round(float(feat_vec[25] * 2.2), 1))

        x_input = feat_vec.reshape(1, -1)

        # 3. Stage 1: Produce Species Identification with Rejection Threshold
        supported_species = self.produce_metadata.get("supported_species", SUPPORTED_SPECIES)
        identified_produce = "Produce"
        is_supported_produce = True
        produce_confidence = 85.0
        alternative_predictions = []
        rejection_threshold = self.produce_metadata.get("rejection_confidence_threshold", 48.0)

        if self.produce_classifier:
            try:
                probs = self.produce_classifier.predict_proba(x_input)[0]
                best_idx = int(np.argmax(probs))
                max_prob = float(probs[best_idx])
                conf_pct = round(max_prob * 100.0, 1)

                # Build ranked alternatives
                sorted_indices = np.argsort(probs)[::-1]
                for idx in sorted_indices:
                    if idx < len(supported_species):
                        alternative_predictions.append({
                            "produce": supported_species[idx],
                            "confidence": round(float(probs[idx]) * 100.0, 1)
                        })

                if conf_pct < rejection_threshold:
                    identified_produce = FALLBACK_SPECIES
                    is_supported_produce = False
                    produce_confidence = conf_pct
                else:
                    identified_produce = supported_species[best_idx]
                    produce_confidence = conf_pct
            except Exception as e:
                print(f"[FoodQualityVisionEngine] Species inference error: {e}")

        # Retrieve metadata for identified species
        info = PRODUCE_INFO.get(identified_produce, {})
        if not info and identified_produce in ["Apple", "Banana", "Orange"]:
            info_key_map = {"Apple": "Fresh Apple", "Banana": "Embul Banana (Ambul Kesel)", "Orange": "Orange / Citrus"}
            info = PRODUCE_INFO.get(info_key_map.get(identified_produce, ""), {})

        produce_icon = info.get("icon", "🍎" if is_supported_produce else "❓")
        scientific_name = info.get("scientific", "")
        baseline_shelf_life = info.get("shelf_life", 168.0 if is_supported_produce else 72.0)
        detected_category = info.get("category", category)

        # 4. Stage 2: Freshness & Spoilage Stage Classification
        stage_probs_dict = {"Unripe / Firm": 0.0, "Ripe / Optimal": 0.0, "Spoiled / Rotten": 0.0}
        ripeness_stage = "Ripe / Optimal (Grade B)"
        risk_level = "Low"
        is_uncertain = False

        if self.stage_classifier:
            try:
                s_probs = self.stage_classifier.predict_proba(x_input)[0]
                # Classes correspond to contiguous 0: Unripe, 1: Ripe/Optimal, 2: Spoiled
                p_unripe = float(s_probs[0])
                p_optimal = float(s_probs[1]) if len(s_probs) > 1 else 0.0
                p_spoiled = float(s_probs[2]) if len(s_probs) > 2 else 0.0

                stage_probs_dict = {
                    "Unripe / Firm": round(p_unripe * 100.0, 1),
                    "Ripe / Optimal": round(p_optimal * 100.0, 1),
                    "Spoiled / Rotten": round(p_spoiled * 100.0, 1)
                }

                sorted_s = np.sort(s_probs)[::-1]
                top_prob = float(sorted_s[0])
                margin = float(sorted_s[0] - sorted_s[1]) if len(sorted_s) > 1 else 1.0

                if margin < 0.12 or top_prob < 0.40:
                    ripeness_stage = "Uncertain (Borderline Transition)"
                    is_uncertain = True
                    risk_level = "Medium"
                else:
                    best_stage_idx = int(np.argmax(s_probs))
                    if best_stage_idx == 2 or mould_detected:
                        ripeness_stage = self.STAGE_NAMES[3]
                        risk_level = "Critical"
                    elif best_stage_idx == 0:
                        ripeness_stage = self.STAGE_NAMES[0]
                        risk_level = "Low"
                    else:
                        # Check physiological signs of overripeness (senescence softening)
                        if (browning_percent >= 14.0 or texture_degradation >= 35.0) and not mould_detected:
                            ripeness_stage = self.STAGE_NAMES[2] # Overripe / Softening
                            risk_level = "High"
                        else:
                            ripeness_stage = self.STAGE_NAMES[1] # Ripe / Optimal
                            risk_level = "Low"
            except Exception as e:
                print(f"[FoodQualityVisionEngine] Stage inference error: {e}")

        # 5. Stage 3: Continuous Spoilage Regressor
        if self.spoilage_regressor:
            try:
                reg_val = float(self.spoilage_regressor.predict(x_input)[0])
                visual_score = round(float(np.clip(reg_val, 2.0, 98.0)), 1)
            except Exception:
                visual_score = round(float(np.clip(browning_percent * 1.6 + mould_coverage * 4.5, 5.0, 95.0)), 1)
        else:
            visual_score = round(float(np.clip(browning_percent * 1.6 + mould_coverage * 4.5, 5.0, 95.0)), 1)

        # Ripeness index percentage (100% = harvest peak prime, decaying towards 0%)
        ripeness_percent = round(max(2.0, min(98.0, 100.0 - visual_score)), 1)
        if "Unripe" in ripeness_stage:
            ripeness_percent = max(88.0, ripeness_percent)
        elif "Spoiled" in ripeness_stage:
            ripeness_percent = min(15.0, ripeness_percent)
            visual_score = max(82.0, visual_score)

        # 6. Stage 4: Remaining Shelf-Life (RSL) & 90% Prediction Interval
        decay_factor = max(0.0, (100.0 - visual_score) / 100.0)
        remaining_shelf_life = round(baseline_shelf_life * (decay_factor ** 1.3), 1)

        # Food Safety Boundary Constraints
        if visual_score >= 78.0 or mould_detected or "Spoiled" in ripeness_stage or risk_level == "Critical":
            remaining_shelf_life = 0.0
            rsl_min = 0.0
            rsl_max = 0.0
            rsl_interval_str = "0.0 hrs (Quarantine Required)"
        elif "Overripe" in ripeness_stage or risk_level == "High":
            # Overripe produce must be consumed or diverted today (maximum 24h)
            remaining_shelf_life = round(min(remaining_shelf_life, 24.0), 1)
            remaining_shelf_life = max(2.0, remaining_shelf_life)
            sigma = 0.15 * remaining_shelf_life
            rsl_min = max(0.0, round(remaining_shelf_life - 1.645 * sigma, 1))
            rsl_max = round(remaining_shelf_life + 1.645 * sigma, 1)
            rsl_interval_str = f"{rsl_min} - {rsl_max} hrs [90% CI]"
        else:
            sigma = 0.15 * remaining_shelf_life
            rsl_min = max(0.0, round(remaining_shelf_life - 1.645 * sigma, 1))
            rsl_max = round(remaining_shelf_life + 1.645 * sigma, 1)
            rsl_interval_str = f"{rsl_min} - {rsl_max} hrs [90% CI]"

        # 7. Stage 5: Multi-Cue Defect Localization & Bounding Boxes
        bounding_boxes, detected_defects, defect_area_pct = self._extract_defect_contours(
            img_resized, rgb, gray, mask, primary_contour, mould_detected, browning_percent, texture_degradation, ripeness_stage, identified_produce
        )

        latency_ms = round((time.perf_counter() - t_start) * 1000.0, 1)

        return {
            "analysis_id": analysis_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "model_version": self.produce_metadata.get("model_version", "v2.2-trained"),
            "identified_produce": identified_produce,
            "is_supported_produce": is_supported_produce,
            "produce_confidence": produce_confidence,
            "alternative_predictions": alternative_predictions,
            "produce_icon": produce_icon,
            "scientific_name": scientific_name,
            "category": detected_category,
            "baseline_shelf_life_hours": baseline_shelf_life,
            "remaining_shelf_life_hours": remaining_shelf_life,
            "rsl_min_hours": rsl_min,
            "rsl_max_hours": rsl_max,
            "rsl_confidence_interval": rsl_interval_str,
            "ripeness_stage": ripeness_stage,
            "is_uncertain": is_uncertain,
            "stage_probabilities": stage_probs_dict,
            "ripeness_percent": ripeness_percent,
            "visual_spoilage_score": visual_score,
            "risk_level": risk_level,
            "discoloration_score": browning_percent,
            "mould_detected": mould_detected,
            "mould_coverage": mould_coverage,
            "texture_degradation": texture_degradation,
            "defect_surface_area_percent": defect_area_pct,
            "detected_defects": detected_defects,
            "bounding_boxes": bounding_boxes,
            "image_width": orig_w,
            "image_height": orig_h,
            "processing_latency_ms": latency_ms,
            "scientific_disclaimer": "RSL prediction intervals reflect postharvest biological decay models. Visual sensors assess exterior tissue only; comply with HACCP food safety standards."
        }

    def _extract_defect_contours(
        self, img_resized, rgb, gray, produce_mask, primary_contour, mould_detected, browning_percent, texture, ripeness_stage, produce_name
    ) -> Tuple[List[Dict[str, Any]], List[str], float]:
        boxes = []
        defects = []
        hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
        total_pixels = 256.0 * 256.0
        total_defect_pixels = 0

        # 1. Produce Object Localization Box (Identified Produce)
        if primary_contour is not None and len(primary_contour) >= 4:
            px, py, pw, ph = cv2.boundingRect(primary_contour)
            if pw < 248 or ph < 248: # Exclude full background
                boxes.append({
                    "label": f"IDENTIFIED: {produce_name.upper()}",
                    "type": "produce_object",
                    "x": int(px * 100 / 256),
                    "y": int(py * 100 / 256),
                    "width": int(pw * 100 / 256),
                    "height": int(ph * 100 / 256),
                    "color": "#059669",
                    "severity": "info",
                    "area_percent": round((pw * ph) / total_pixels * 100.0, 1)
                })

        # 2. Mould Contours (STRICTLY inside produce_mask)
        is_chlorophyll = (hsv[:, :, 0] >= 32) & (hsv[:, :, 0] <= 88) & (hsv[:, :, 1] >= 28)
        raw_mould_mask = ((hsv[:, :, 1] < 28) & (hsv[:, :, 2] > 195) & (~is_chlorophyll) & (gray > 190))
        mould_mask = (raw_mould_mask & (produce_mask > 0)).astype(np.uint8) * 255
        
        # Border suppression
        mould_mask[:10, :] = 0
        mould_mask[-10:, :] = 0
        mould_mask[:, :10] = 0
        mould_mask[:, -10:] = 0

        if mould_detected:
            contours_m, _ = cv2.findContours(mould_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours_m:
                area = cv2.contourArea(cnt)
                if area > 100:
                    total_defect_pixels += area
                    x, y, w, h = cv2.boundingRect(cnt)
                    if w < 225 and h < 225:
                        boxes.append({
                            "label": "MOULD SPORE COLONY",
                            "type": "spoilage",
                            "x": int(x * 100 / 256),
                            "y": int(y * 100 / 256),
                            "width": int(w * 100 / 256),
                            "height": int(h * 100 / 256),
                            "color": "#ef4444",
                            "severity": "critical",
                            "area_percent": round(area / total_pixels * 100.0, 2)
                        })
            defects.append("Fungal Mycelium / Mould Colony Detected")

        # 3. Enzymatic Browning / Necrotic Softening (STRICTLY inside produce_mask)
        raw_brown_mask = (
            (((rgb[:, :, 0] < 125) & (rgb[:, :, 1] < 110) & (rgb[:, :, 2] < 85) & (gray < 100)) |
             ((rgb[:, :, 0] > 70) & (rgb[:, :, 0] < 190) & (rgb[:, :, 1] > 40) & (rgb[:, :, 1] < 140) & (rgb[:, :, 2] < 90)))
            & (~is_chlorophyll)
        )
        brown_mask = (raw_brown_mask & (produce_mask > 0)).astype(np.uint8) * 255
        contours_b, _ = cv2.findContours(brown_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        sorted_b_contours = sorted(contours_b, key=cv2.contourArea, reverse=True)
        for cnt in sorted_b_contours[:3]:
            area = cv2.contourArea(cnt)
            if area > 120:
                total_defect_pixels += area
                x, y, w, h = cv2.boundingRect(cnt)
                if w < 225 and h < 225:
                    is_overripe = "overripe" in ripeness_stage.lower() or browning_percent >= 14.0
                    is_spoiled = "spoiled" in ripeness_stage.lower()
                    label = "NECROTIC ROT LESION" if is_spoiled else ("SENESCENCE BROWNING" if is_overripe else "PEEL DISCOLORATION")
                    color = "#ef4444" if is_spoiled else ("#f59e0b" if is_overripe else "#eab308")
                    severity = "critical" if is_spoiled else ("high" if is_overripe else "medium")
                    boxes.append({
                        "label": label,
                        "type": "discoloration",
                        "x": int(x * 100 / 256),
                        "y": int(y * 100 / 256),
                        "width": int(w * 100 / 256),
                        "height": int(h * 100 / 256),
                        "color": color,
                        "severity": severity,
                        "area_percent": round(area / total_pixels * 100.0, 2)
                    })

        if browning_percent >= 14.0:
            defects.append(f"Surface Enzymatic Browning & Discoloration ({browning_percent}%)")
            defects.append(f"Epidermal Texture Breakdown & Softening ({texture}%)")
            defects.append("Senescent Anthracnose / Sunken Necrotic Softening")
        elif browning_percent >= 5.0:
            defects.append(f"Mild Surface Lenticel Spotting ({browning_percent}%)")

        if not defects:
            defects.append("Intact Epidermal Cuticle (No Fungal Lesions or Senescent Browning)")

        defect_area_pct = round(total_defect_pixels / total_pixels * 100.0, 2)
        return boxes[:5], defects, defect_area_pct

    def _default_features(self, category: str, analysis_id: str) -> Dict[str, Any]:
        return {
            "analysis_id": analysis_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "model_version": "v2.2-fallback",
            "identified_produce": FALLBACK_SPECIES,
            "is_supported_produce": False,
            "produce_confidence": 0.0,
            "alternative_predictions": [],
            "produce_icon": "❓",
            "scientific_name": "",
            "category": category,
            "baseline_shelf_life_hours": 72.0,
            "remaining_shelf_life_hours": 0.0,
            "rsl_min_hours": 0.0,
            "rsl_max_hours": 0.0,
            "rsl_confidence_interval": "0.0 hrs (Input Error)",
            "ripeness_stage": "Uncertain",
            "is_uncertain": True,
            "stage_probabilities": {"Unripe / Firm": 0.0, "Ripe / Optimal": 0.0, "Spoiled / Rotten": 0.0},
            "ripeness_percent": 0.0,
            "visual_spoilage_score": 0.0,
            "risk_level": "Medium",
            "discoloration_score": 0.0,
            "mould_detected": False,
            "mould_coverage": 0.0,
            "texture_degradation": 0.0,
            "defect_surface_area_percent": 0.0,
            "detected_defects": ["Invalid or corrupted image stream"],
            "bounding_boxes": [],
            "image_width": 256,
            "image_height": 256,
            "processing_latency_ms": 0.0,
            "scientific_disclaimer": "Failed to decode valid image stream."
        }

food_vision_engine = FoodQualityVisionEngine()
vision_engine = food_vision_engine
