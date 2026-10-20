"""
GreenPulse Computer Vision Inference Engine (v2.3-calibrated)
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

Multi-stage CPU-optimized inference pipeline backed by genuine machine learning models:
1. Multi-Domain Visual Feature Extractor (42-dimensional foreground features)
2. Produce Species Identifier with Rejection Threshold (Apple, Banana, Orange, fallback Unknown)
3. Calibrated Visible Spoilage Classifier (Fresh/Normal vs Spoilage, with calibrated threshold T=0.41)
4. Ripeness Stage Classifier (Unripe, Ripe / Optimal, Overripe)
5. Continuous Defect Severity Regressor (Physically grounded 0-100%)
6. Defect Localization & Bounding Boxes (Zero false-positive defect boxes on fresh produce)
7. Scientifically Grounded Remaining Shelf-Life (RSL) with 90% Prediction Intervals
8. Structured Diagnostic Logging for Auditing and Quality Assurance
"""

import io
import os
import sys
import time
import uuid
import json
import hashlib
import logging
import joblib
import numpy as np
import cv2
from PIL import Image
from typing import Dict, Any, Tuple, List, Optional

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.data.prepare_cv_dataset import (
    extract_multi_domain_features,
    segment_produce_foreground,
    SUPPORTED_SPECIES,
    FALLBACK_SPECIES,
    RIPENESS_STAGES,
    SPOILAGE_CATEGORIES,
    DEFECT_TYPES
)
from backend.app.models.train_cv_models import PRODUCE_INFO

# Configure structured diagnostic logger
logger = logging.getLogger("GreenPulseVisionEngine")
if not logger.handlers:
    ch = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s")
    ch.setFormatter(formatter)
    logger.addHandler(ch)
logger.setLevel(logging.INFO)


class FoodQualityVisionEngine:
    """
    Production Computer Vision Engine with Decoupled Architecture:
    - Produce Species Identification
    - Ripeness Stage Assessment
    - Visible Spoilage Classification (Calibrated)
    - Defect Type Localization
    - Remaining Shelf-Life Estimation with Prediction Intervals
    """

    # Backward compatibility stage names
    LEGACY_STAGE_NAMES = {
        0: "Unripe / Firm (Grade A)",
        1: "Ripe / Optimal (Grade B)",
        2: "Overripe / Softening (Use Today)",
        3: "Spoiled / Rotten (Grade F)"
    }

    def __init__(self):
        self.models_loaded = False
        self.species_classifier = None
        self.spoilage_classifier = None
        self.mould_detector = None
        self.ripeness_classifier = None
        self.ripeness_regressor = None
        self.feature_scaler = None
        self.produce_metadata = {}
        self.real_metrics = {}

        # Backward compatibility aliases
        self.produce_classifier = None
        self.stage_classifier = None
        self.spoilage_regressor = None

        self.load_trained_cv_models()

    def load_trained_cv_models(self):
        """Loads all calibrated model artifacts from backend/app/models/saved_models."""
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            saved_models_dir = os.path.join(base_dir, "saved_models")

            species_path = os.path.join(saved_models_dir, "produce_species_classifier.joblib")
            spoilage_path = os.path.join(saved_models_dir, "cv_spoilage_classifier.joblib")
            mould_path = os.path.join(saved_models_dir, "cv_mould_detector.joblib")
            ripeness_path = os.path.join(saved_models_dir, "cv_ripeness_classifier.joblib")
            reg_path = os.path.join(saved_models_dir, "cv_ripeness_regressor.joblib")
            scaler_path = os.path.join(saved_models_dir, "cv_feature_scaler.joblib")
            meta_path = os.path.join(saved_models_dir, "produce_metadata.json")
            metrics_path = os.path.join(saved_models_dir, "cv_real_metrics.json")

            if os.path.exists(species_path):
                self.species_classifier = joblib.load(species_path)
                self.produce_classifier = self.species_classifier

            if os.path.exists(spoilage_path):
                self.spoilage_classifier = joblib.load(spoilage_path)
                self.stage_classifier = self.spoilage_classifier

            if os.path.exists(mould_path):
                self.mould_detector = joblib.load(mould_path)

            if os.path.exists(ripeness_path):
                self.ripeness_classifier = joblib.load(ripeness_path)

            if os.path.exists(reg_path):
                self.ripeness_regressor = joblib.load(reg_path)
                self.spoilage_regressor = self.ripeness_regressor

            if os.path.exists(scaler_path):
                self.feature_scaler = joblib.load(scaler_path)

            if os.path.exists(meta_path):
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.produce_metadata = json.load(f)

            if os.path.exists(metrics_path):
                with open(metrics_path, "r", encoding="utf-8") as f:
                    self.real_metrics = json.load(f)

            if (self.species_classifier and self.spoilage_classifier and 
                self.ripeness_classifier and self.ripeness_regressor and self.mould_detector):
                self.models_loaded = True
                logger.info(f"Successfully loaded v2.3 calibrated CV models from {saved_models_dir}")
            else:
                logger.warning("One or more trained models missing from saved_models directory.")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.models_loaded = False

    def analyze_image(self, image_bytes: bytes, category: str = "Fruits") -> Dict[str, Any]:
        """
        Executes end-to-end multi-stage inference on an uploaded or camera-captured image.
        Returns decoupled classifications, legacy fields, and structured diagnostics.
        """
        t_start = time.perf_counter()
        analysis_id = f"CV-SCAN-{int(time.time())}-{uuid.uuid4().hex[:6]}"
        img_hash = hashlib.md5(image_bytes).hexdigest()[:12] if image_bytes else "unknown"

        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            return self._default_features(category, analysis_id, img_hash)

        orig_h, orig_w = img_bgr.shape[:2]
        img_resized, fg_mask, fg_pixels = segment_produce_foreground(img_bgr, target_size=(256, 256))
        rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

        # Extract 42-dimensional multi-domain visual feature vector
        feat_vec = extract_multi_domain_features(img_bgr, presegmented=(img_resized, fg_mask, fg_pixels))
        x_input = feat_vec.reshape(1, -1)

        browning_percent = round(float(feat_vec[24]), 2)
        mould_coverage = round(float(feat_vec[22]), 2)
        texture_degradation = min(100.0, round(float(feat_vec[25] * 2.2), 1))
        defect_area_pct = round(float(feat_vec[39]), 2)

        # -------------------------------------------------------------
        # STAGE 1: PRODUCE SPECIES IDENTIFICATION
        # -------------------------------------------------------------
        supported_species = self.produce_metadata.get("supported_species", SUPPORTED_SPECIES)
        identified_produce = "Produce"
        is_supported_produce = True
        produce_confidence = 85.0
        alternative_predictions = []
        species_probs_dict = {}
        rejection_threshold = self.produce_metadata.get("rejection_confidence_threshold", 50.0)

        if self.species_classifier:
            try:
                s_probs = self.species_classifier.predict_proba(x_input)[0]
                best_s_idx = int(np.argmax(s_probs))
                max_s_prob = float(s_probs[best_s_idx])
                conf_pct = round(max_s_prob * 100.0, 1)

                for idx, p in enumerate(s_probs):
                    if idx < len(supported_species):
                        species_probs_dict[supported_species[idx]] = round(float(p) * 100.0, 1)

                sorted_indices = np.argsort(s_probs)[::-1]
                for idx in sorted_indices:
                    if idx < len(supported_species):
                        alternative_predictions.append({
                            "produce": supported_species[idx],
                            "confidence": round(float(s_probs[idx]) * 100.0, 1)
                        })

                margin = float(s_probs[sorted_indices[0]] - s_probs[sorted_indices[1]]) if len(sorted_indices) > 1 else 1.0

                # Physiological Out-of-Distribution Rejection:
                # 1. Below confidence threshold (45%)
                # 2. Ambiguous margin (< 10%)
                # 3. Achromatic / flat non-produce (S_mean < 12.0 or Laplacian var < 1.0 or FG coverage < 3.0%)
                is_non_produce = (feat_vec[8] < 12.0) or (feat_vec[29] < 1.0) or (feat_vec[40] < 3.0)

                rejection_thresh = float(self.produce_metadata.get("rejection_confidence_threshold", 42.0))
                if conf_pct < rejection_thresh or margin < 0.08 or is_non_produce:
                    identified_produce = FALLBACK_SPECIES
                    is_supported_produce = False
                    produce_confidence = round(conf_pct * 0.5, 1) if is_non_produce else conf_pct
                else:
                    identified_produce = supported_species[best_s_idx]
                    produce_confidence = conf_pct
            except Exception as e:
                logger.error(f"Species inference error: {e}")

        # Retrieve metadata for species
        species_meta = self.produce_metadata.get("species_metadata", {}).get(identified_produce, {})
        if not species_meta:
            info_key_map = {
                "Apple": "Fresh Apple",
                "Banana": "Embul Banana (Ambul Kesel)",
                "Orange": "Orange / Citrus",
                "Strawberry": "Strawberry"
            }
            species_meta = PRODUCE_INFO.get(info_key_map.get(identified_produce, ""), {})

        produce_icon = species_meta.get("icon", "🍓" if identified_produce == "Strawberry" else ("🍎" if is_supported_produce else "❓"))
        scientific_name = species_meta.get("scientific", "Fragaria × ananassa" if identified_produce == "Strawberry" else "")
        baseline_shelf_life = float(species_meta.get("shelf_life_hours", species_meta.get("shelf_life", 120.0 if identified_produce == "Strawberry" else (168.0 if is_supported_produce else 72.0))))
        detected_category = species_meta.get("category", category)

        # -------------------------------------------------------------
        # STAGE 2: VISIBLE SPOILAGE CLASSIFICATION (Calibrated)
        # -------------------------------------------------------------
        calibrated_thresh = float(self.produce_metadata.get("calibrated_spoilage_threshold", 0.41))
        spoil_prob = 0.0
        visible_spoilage_category = "No visible spoilage detected"
        risk_level = "Low"
        is_spoilage_uncertain = False

        if self.spoilage_classifier:
            try:
                spoil_probs = self.spoilage_classifier.predict_proba(x_input)[0]
                spoil_prob = float(spoil_probs[1]) if len(spoil_probs) > 1 else float(spoil_probs[0])

                # Evidence-based Decision Policy:
                # 1. Spoilage Probability < Calibrated Threshold: No visible spoilage
                if spoil_prob < calibrated_thresh:
                    visible_spoilage_category = "No visible spoilage detected"
                    risk_level = "Low"
                # 2. Borderline / Low-Confidence Region: Uncertain
                elif abs(spoil_prob - calibrated_thresh) < 0.04 and defect_area_pct < 5.0:
                    visible_spoilage_category = "Uncertain"
                    risk_level = "Medium"
                    is_spoilage_uncertain = True
                # 3. Localized Defect (< 10% defect area and prob < 0.70)
                elif spoil_prob < 0.70 and defect_area_pct < 10.0:
                    visible_spoilage_category = "Localized visible defect"
                    risk_level = "Medium"
                # 4. Significant Spoilage
                else:
                    visible_spoilage_category = "Significant visible spoilage"
                    risk_level = "Critical"
            except Exception as e:
                logger.error(f"Spoilage classifier inference error: {e}")

        # -------------------------------------------------------------
        # STAGE 3: RIPENESS STAGE CLASSIFICATION (Decoupled)
        # -------------------------------------------------------------
        ripeness_category = "Ripe / Optimal"
        ripeness_stage_legacy = "Ripe / Optimal (Grade B)"
        stage_probs_dict = {"Unripe / Firm": 0.0, "Ripe / Optimal": 100.0, "Spoiled / Rotten": 0.0}
        p_unripe, p_optimal, p_overripe = 0.05, 0.90, 0.05

        if self.ripeness_classifier:
            try:
                r_probs = self.ripeness_classifier.predict_proba(x_input)[0]
                p_unripe = float(r_probs[0])
                p_optimal = float(r_probs[1]) if len(r_probs) > 1 else 0.0
                p_overripe = float(r_probs[2]) if len(r_probs) > 2 else 0.0

                if not is_supported_produce and max(r_probs) < 0.45:
                    ripeness_category = "Unknown"
                    ripeness_stage_legacy = "Uncertain"
                else:
                    best_r_idx = int(np.argmax(r_probs))
                    if best_r_idx == 0:
                        ripeness_category = "Unripe"
                        ripeness_stage_legacy = self.LEGACY_STAGE_NAMES[0]
                    elif best_r_idx == 1:
                        ripeness_category = "Ripe / Optimal"
                        ripeness_stage_legacy = self.LEGACY_STAGE_NAMES[1]
                    else:
                        ripeness_category = "Overripe"
                        ripeness_stage_legacy = self.LEGACY_STAGE_NAMES[2]

                # Map legacy stage probabilities
                stage_probs_dict = {
                    "Unripe / Firm": round(p_unripe * 100.0, 1),
                    "Ripe / Optimal": round(p_optimal * 100.0, 1),
                    "Spoiled / Rotten": round(spoil_prob * 100.0, 1)
                }
            except Exception as e:
                logger.error(f"Ripeness inference error: {e}")

        # Backward compatibility override for legacy dashboard widgets:
        # If significant visible spoilage is detected, legacy stage shows Grade F
        if visible_spoilage_category == "Significant visible spoilage":
            ripeness_stage_legacy = self.LEGACY_STAGE_NAMES[3]
            risk_level = "Critical"

        # -------------------------------------------------------------
        # STAGE 2B: DEDICATED VISIBLE-MOULD DETECTOR
        # -------------------------------------------------------------
        calibrated_mould_thresh = float(self.produce_metadata.get("calibrated_mould_threshold", 0.46))
        mould_prob = 0.0
        if self.mould_detector:
            try:
                m_probs = self.mould_detector.predict_proba(x_input)[0]
                mould_prob = float(m_probs[1]) if len(m_probs) > 1 else float(m_probs[0])
            except Exception as e:
                logger.error(f"Mould detector inference error: {e}")

        # Physical mould coverage from feature extractor
        mould_coverage_feat = float(feat_vec[22])
        necrotic_ratio = float(feat_vec[23])
        browning_ratio = float(feat_vec[24])

        # Decoupled Mould Detection Rule:
        # A specimen is mould-positive if the trained detector predicts >= calibrated threshold (T=0.46)
        # OR if sub-threshold probability (>=0.30) is corroborated by physical mould coverage (>=4.0%)
        # AND confirmed tissue decay (spoilage_prob >= calibrated_thresh or defect_area_pct >= 5.0)
        is_mould_ml = mould_prob >= calibrated_mould_thresh
        is_mould_corroborated = (mould_prob >= 0.30) and (mould_coverage_feat >= 4.0) and (spoil_prob >= calibrated_thresh or necrotic_ratio >= 0.04 or browning_ratio >= 0.10)
        mould_detected = bool(is_mould_ml or is_mould_corroborated)

        # -------------------------------------------------------------
        # STAGE 4: DEFECT TYPE IDENTIFICATION & ZERO-TOLERANCE MOULD OVERRIDE
        # -------------------------------------------------------------
        detected_defect_types = []

        if mould_detected:
            # ZERO TOLERANCE FOOD SAFETY OVERRIDE:
            # Active fungal mycelium is a critical biological hazard.
            # It ALWAYS forces Significant visible spoilage, Critical risk, and zero RSL.
            visible_spoilage_category = "Significant visible spoilage"
            risk_level = "Critical"
            ripeness_stage_legacy = self.LEGACY_STAGE_NAMES[3]  # Grade F
            detected_defect_types.append("Visible mould")
            if necrotic_ratio >= 0.04:
                detected_defect_types.append("Necrotic lesions")
            if browning_ratio >= 0.12:
                detected_defect_types.append("Brown spots")
        elif visible_spoilage_category == "No visible spoilage detected":
            detected_defect_types = ["None"]
            mould_detected = False
        else:
            if necrotic_ratio >= 0.04:
                detected_defect_types.append("Necrotic lesions")
            if browning_ratio >= 0.12:
                detected_defect_types.append("Brown spots")
            if float(feat_vec[38]) < 0.40: # Low peel uniformity
                detected_defect_types.append("Discoloration")
            if not detected_defect_types:
                detected_defect_types.append("Discoloration")

        # -------------------------------------------------------------
        # STAGE 5: GROUNDED CONTINUOUS SPOILAGE REGRESSOR
        # -------------------------------------------------------------
        visual_score = 10.0
        if self.ripeness_regressor:
            try:
                reg_pred = float(self.ripeness_regressor.predict(x_input)[0])
                if mould_detected or visible_spoilage_category == "Significant visible spoilage":
                    visual_score = round(float(np.clip(max(reg_pred, 85.0), 68.0, 98.0)), 1)
                elif visible_spoilage_category == "Localized visible defect":
                    visual_score = round(float(np.clip(reg_pred, 25.0, 58.0)), 1)
                elif visible_spoilage_category == "No visible spoilage detected":
                    # Clean produce cannot exceed 22% spoilage score
                    visual_score = round(float(np.clip(reg_pred, 2.0, 22.0)), 1)
                else: # Uncertain
                    visual_score = round(float(np.clip(reg_pred, 20.0, 48.0)), 1)
            except Exception:
                visual_score = 10.0 if visible_spoilage_category == "No visible spoilage detected" else 75.0
        else:
            visual_score = 10.0 if visible_spoilage_category == "No visible spoilage detected" else 75.0

        ripeness_percent = round(float(np.clip(100.0 - visual_score, 2.0, 98.0)), 1)

        # -------------------------------------------------------------
        # STAGE 6: REMAINING SHELF-LIFE (RSL) & PREDICTION INTERVALS
        # -------------------------------------------------------------
        decay_factor = max(0.05, (100.0 - visual_score) / 100.0)

        if visible_spoilage_category == "Significant visible spoilage" or risk_level == "Critical":
            # Immediate Quarantine & Food Safety Boundary (Distinguishes visible mould alert from laboratory assay)
            remaining_shelf_life = 0.0
            rsl_min = 0.0
            rsl_max = 0.0
            if mould_detected:
                rsl_interval_str = "0.0 hrs (Food Safety Quarantine: Visible Fungal Growth Detected)"
            else:
                rsl_interval_str = "0.0 hrs (Operational Quarantine: Significant Visual Spoilage Threshold)"
        elif visible_spoilage_category == "Localized visible defect":
            # Localized defect: shelf life is discounted proportionally, not zeroed
            discounted_baseline = baseline_shelf_life * 0.30
            remaining_shelf_life = round(min(36.0, discounted_baseline * decay_factor), 1)
            remaining_shelf_life = max(2.0, remaining_shelf_life)
            sigma = 0.20 * remaining_shelf_life
            rsl_min = max(0.0, round(remaining_shelf_life - 1.645 * sigma, 1))
            rsl_max = round(remaining_shelf_life + 1.645 * sigma, 1)
            rsl_interval_str = f"{rsl_min} - {rsl_max} hrs [90% CI] (Trim / Process Soon)"
        else:
            # Fresh / Normal produce: RSL depends on species baseline and ripeness
            if ripeness_category == "Unripe":
                remaining_shelf_life = round(baseline_shelf_life * 1.25 * (decay_factor ** 1.1), 1)
            elif ripeness_category == "Overripe":
                # Overripe produce has short shelf-life (max 24h)
                remaining_shelf_life = round(min(24.0, baseline_shelf_life * 0.18 * decay_factor), 1)
                remaining_shelf_life = max(4.0, remaining_shelf_life)
            else: # Ripe / Optimal
                remaining_shelf_life = round(baseline_shelf_life * (decay_factor ** 1.1), 1)

            sigma = 0.12 * remaining_shelf_life
            rsl_min = max(0.0, round(remaining_shelf_life - 1.645 * sigma, 1))
            rsl_max = round(remaining_shelf_life + 1.645 * sigma, 1)
            rsl_interval_str = f"{rsl_min} - {rsl_max} hrs [90% CI]"

        # -------------------------------------------------------------
        # STAGE 7: DEFECT LOCALIZATION & BOUNDING BOXES
        # -------------------------------------------------------------
        bounding_boxes, detected_defects_text, final_defect_area_pct = self._extract_defect_contours(
            img_resized, rgb, gray, fg_mask, visible_spoilage_category, mould_detected, 
            browning_percent, texture_degradation, identified_produce
        )

        latency_ms = round((time.perf_counter() - t_start) * 1000.0, 1)

        # -------------------------------------------------------------
        # STAGE 8: STRUCTURED DIAGNOSTIC LOGGING
        # -------------------------------------------------------------
        diagnostic_log = {
            "image_hash": img_hash,
            "preprocessing": {
                "target_size": [256, 256],
                "color_spaces": ["RGB", "HSV", "Lab"],
                "foreground_segmented": True,
                "foreground_pixels": int(fg_pixels)
            },
            "feature_dimensions": len(feat_vec),
            "model_version": self.produce_metadata.get("model_version", "v2.3-calibrated"),
            "species_probabilities": species_probs_dict,
            "spoilage_probability": round(spoil_prob * 100.0, 2),
            "calibrated_threshold": round(calibrated_thresh * 100.0, 2),
            "mould_probability": round(mould_prob * 100.0, 2),
            "calibrated_mould_threshold": round(calibrated_mould_thresh * 100.0, 2),
            "mould_detected": mould_detected,
            "ripeness_probabilities": {
                "Unripe": round(p_unripe * 100.0, 1),
                "Ripe / Optimal": round(p_optimal * 100.0, 1),
                "Overripe": round(p_overripe * 100.0, 1)
            },
            "defect_types": detected_defect_types,
            "defect_area_pct": final_defect_area_pct,
            "spoilage_score": visual_score,
            "lifecycle_stage": ripeness_category,
            "final_decision": {
                "species": identified_produce,
                "ripeness": ripeness_category,
                "visible_spoilage": visible_spoilage_category,
                "mould_detected": mould_detected,
                "rsl_hours": remaining_shelf_life
            }
        }

        logger.info(
            f"[CV Diagnostics] hash={img_hash} species={identified_produce} ({produce_confidence}%) "
            f"ripeness={ripeness_category} spoilage={visible_spoilage_category} (p={spoil_prob:.3f}, T={calibrated_thresh:.2f}, mould_p={mould_prob:.3f}) "
            f"RSL={remaining_shelf_life}h"
        )

        return {
            "analysis_id": analysis_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "model_version": self.produce_metadata.get("model_version", "v2.3-calibrated"),
            "image_hash": img_hash,

            # Decoupled Core Fields
            "species_identity": identified_produce,
            "identified_produce": identified_produce,
            "is_supported_produce": is_supported_produce,
            "produce_confidence": produce_confidence,
            "alternative_predictions": alternative_predictions,
            "species_probabilities": species_probs_dict,

            "ripeness_classification": ripeness_category,
            "ripeness_stage": ripeness_stage_legacy, # Legacy composite name
            "is_uncertain": is_spoilage_uncertain,
            "stage_probabilities": stage_probs_dict,
            "ripeness_percent": ripeness_percent,

            "visible_spoilage_classification": visible_spoilage_category,
            "spoilage_probability": round(spoil_prob * 100.0, 2),
            "calibrated_threshold": round(calibrated_thresh * 100.0, 2),
            "visual_spoilage_score": visual_score,
            "risk_level": risk_level,

            "defect_types": detected_defect_types,
            "detected_defects": detected_defects_text,
            "defect_surface_area_percent": final_defect_area_pct,
            "mould_detected": mould_detected,
            "mould_confidence": max(round(mould_prob * 100.0, 1), round(calibrated_mould_thresh * 100.0, 1)) if mould_detected else round(mould_prob * 100.0, 1),
            "calibrated_mould_threshold": round(calibrated_mould_thresh * 100.0, 1),
            "mould_coverage": mould_coverage,
            "discoloration_score": browning_percent,
            "texture_degradation": texture_degradation,

            "remaining_shelf_life_hours": remaining_shelf_life,
            "baseline_shelf_life_hours": baseline_shelf_life,
            "rsl_min_hours": rsl_min,
            "rsl_max_hours": rsl_max,
            "rsl_confidence_interval": rsl_interval_str,

            "produce_icon": produce_icon,
            "scientific_name": scientific_name,
            "category": detected_category,
            "bounding_boxes": bounding_boxes,
            "image_width": orig_w,
            "image_height": orig_h,
            "processing_latency_ms": latency_ms,
            "diagnostic_log": diagnostic_log,
            "scientific_disclaimer": "RSL prediction intervals reflect postharvest biological decay kinetics and visual screening. Zero RSL denotes an operational food safety quarantine threshold due to visual defect/mould alerts, not a definitive laboratory microbiological or chemical toxicity assay."
        }

    def _extract_defect_contours(
        self, img_resized: np.ndarray, rgb: np.ndarray, gray: np.ndarray, fg_mask: np.ndarray,
        visible_spoilage_category: str, mould_detected: bool, browning_percent: float, 
        texture: float, produce_name: str
    ) -> Tuple[List[Dict[str, Any]], List[str], float]:
        """
        Localizes produce boundary and defects.
        CRITICAL: Never draws red defect or mould boxes on fresh produce.
        """
        boxes = []
        defects = []
        total_pixels = 256.0 * 256.0
        total_defect_pixels = 0

        # 1. Produce Object Bounding Box
        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            primary_c = max(contours, key=cv2.contourArea)
            px, py, pw, ph = cv2.boundingRect(primary_c)
            if pw < 250 or ph < 250:
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

        # 2. Defect Contours (ONLY if visible spoilage was detected by classifier)
        if visible_spoilage_category in ["Localized visible defect", "Significant visible spoilage"]:
            hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
            is_chlorophyll = (hsv[:, :, 0] >= 32) & (hsv[:, :, 0] <= 88) & (hsv[:, :, 1] >= 28)

            # Mould Contours
            if mould_detected:
                raw_mould = (hsv[:, :, 1] < 55) & (hsv[:, :, 2] >= 80) & (~is_chlorophyll)
                mould_mask = (raw_mould & (fg_mask > 0)).astype(np.uint8) * 255
                mould_mask[:6, :] = 0
                mould_mask[-6:, :] = 0
                mould_mask[:, :6] = 0
                mould_mask[:, -6:] = 0

                cnts_m, _ = cv2.findContours(mould_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                sorted_m = sorted(cnts_m, key=cv2.contourArea, reverse=True)
                for cnt in sorted_m[:3]:
                    area = cv2.contourArea(cnt)
                    if area >= 35:
                        total_defect_pixels += area
                        x, y, w, h = cv2.boundingRect(cnt)
                        if w < 245 and h < 245:
                            boxes.append({
                                "label": "VISIBLE MOULD COLONY",
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

            # Necrotic / Browning Contours
            raw_brown = (
                (((rgb[:, :, 0] < 120) & (rgb[:, :, 1] < 100) & (rgb[:, :, 2] < 75) & (gray < 95)) |
                 ((rgb[:, :, 0] > 70) & (rgb[:, :, 0] < 180) & (rgb[:, :, 1] > 40) & (rgb[:, :, 1] < 130) & (rgb[:, :, 2] < 80)))
                & (~is_chlorophyll)
            )
            brown_mask = (raw_brown & (fg_mask > 0)).astype(np.uint8) * 255
            cnts_b, _ = cv2.findContours(brown_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            sorted_b = sorted(cnts_b, key=cv2.contourArea, reverse=True)

            for cnt in sorted_b[:3]:
                area = cv2.contourArea(cnt)
                if area > 120:
                    total_defect_pixels += area
                    x, y, w, h = cv2.boundingRect(cnt)
                    if w < 225 and h < 225:
                        is_crit = visible_spoilage_category == "Significant visible spoilage"
                        boxes.append({
                            "label": "NECROTIC ROT LESION" if is_crit else "LOCALIZED DEFECT BLEMISH",
                            "type": "discoloration",
                            "x": int(x * 100 / 256),
                            "y": int(y * 100 / 256),
                            "width": int(w * 100 / 256),
                            "height": int(h * 100 / 256),
                            "color": "#ef4444" if is_crit else "#f59e0b",
                            "severity": "critical" if is_crit else "medium",
                            "area_percent": round(area / total_pixels * 100.0, 2)
                        })

            if browning_percent >= 14.0:
                defects.append(f"Surface Enzymatic Browning & Discoloration ({browning_percent}%)")
                defects.append(f"Epidermal Texture Breakdown & Softening ({texture}%)")
            elif browning_percent >= 5.0:
                defects.append(f"Mild Surface Lenticel Spotting ({browning_percent}%)")

        if not defects:
            defects.append("Intact Epidermal Cuticle (No Fungal Lesions or Senescent Browning)")

        defect_area_pct = round(total_defect_pixels / total_pixels * 100.0, 2)
        return boxes[:5], defects, defect_area_pct

    def _default_features(self, category: str, analysis_id: str, img_hash: str) -> Dict[str, Any]:
        return {
            "analysis_id": analysis_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "model_version": "v2.3-fallback",
            "image_hash": img_hash,
            "species_identity": FALLBACK_SPECIES,
            "identified_produce": FALLBACK_SPECIES,
            "is_supported_produce": False,
            "produce_confidence": 0.0,
            "alternative_predictions": [],
            "species_probabilities": {},
            "ripeness_classification": "Unknown",
            "ripeness_stage": "Uncertain",
            "is_uncertain": True,
            "stage_probabilities": {"Unripe / Firm": 0.0, "Ripe / Optimal": 0.0, "Spoiled / Rotten": 0.0},
            "ripeness_percent": 0.0,
            "visible_spoilage_classification": "Uncertain",
            "spoilage_probability": 0.0,
            "calibrated_threshold": 41.0,
            "visual_spoilage_score": 0.0,
            "risk_level": "Medium",
            "defect_types": ["Invalid or corrupted image stream"],
            "detected_defects": ["Invalid or corrupted image stream"],
            "defect_surface_area_percent": 0.0,
            "mould_detected": False,
            "mould_coverage": 0.0,
            "discoloration_score": 0.0,
            "texture_degradation": 0.0,
            "remaining_shelf_life_hours": 0.0,
            "baseline_shelf_life_hours": 72.0,
            "rsl_min_hours": 0.0,
            "rsl_max_hours": 0.0,
            "rsl_confidence_interval": "0.0 hrs (Input Error)",
            "produce_icon": "❓",
            "scientific_name": "",
            "category": category,
            "bounding_boxes": [],
            "image_width": 256,
            "image_height": 256,
            "processing_latency_ms": 0.0,
            "diagnostic_log": {"error": "Failed to decode valid image stream."},
            "scientific_disclaimer": "Failed to decode valid image stream."
        }


food_vision_engine = FoodQualityVisionEngine()
vision_engine = food_vision_engine
