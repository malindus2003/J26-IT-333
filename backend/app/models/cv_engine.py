import io
import os
import json
import joblib
import numpy as np
import cv2
from PIL import Image
from typing import Dict, Any, Tuple, List, Optional
from .train_cv_models import (
    extract_visual_features_from_image,
    segment_produce_foreground,
    PRODUCE_INFO,
    PRODUCE_CLASSES
)

class FoodQualityVisionEngine:
    """
    Multi-Category Computer Vision Engine for Produce Identification,
    Food Quality, Ripeness Stage & Spoilage Assessment.
    Combines:
    1. Multi-Cue Foreground Produce Segmentation (eliminates table & background contamination)
    2. Automated Produce Species Classifier (Random Forest identifying 17 fruits & vegetables)
    3. Spoilage Stage Classifier & Continuous Spoilage Regressor
    4. Contour Defect Localization & Normalized Bounding Box Generation for UI Overlays.
    """

    CATEGORIES = ["Fruits", "Vegetables"]
    STAGE_LABELS = {
        0: "Fresh / Firm (Grade A)",
        1: "Optimal Ripe (Grade B)",
        2: "Overripe / Softening (Use Today)",
        3: "Spoiled / Rotten (Grade F)"
    }

    def __init__(self):
        self.models_loaded = False
        self.produce_classifier = None
        self.cv_classifier = None
        self.cv_regressor = None
        self.cv_scaler = None
        self.produce_metadata = {}
        self.load_trained_cv_models()

    def load_trained_cv_models(self):
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            saved_models_dir = os.path.join(base_dir, "saved_models")
            
            produce_path = os.path.join(saved_models_dir, "produce_type_classifier.joblib")
            cls_path = os.path.join(saved_models_dir, "cv_spoilage_classifier.joblib")
            reg_path = os.path.join(saved_models_dir, "cv_ripeness_regressor.joblib")
            scaler_path = os.path.join(saved_models_dir, "cv_feature_scaler.joblib")
            meta_path = os.path.join(saved_models_dir, "produce_metadata.json")

            if os.path.exists(produce_path):
                self.produce_classifier = joblib.load(produce_path)

            if os.path.exists(cls_path) and os.path.exists(reg_path):
                self.cv_classifier = joblib.load(cls_path)
                self.cv_regressor = joblib.load(reg_path)
                if os.path.exists(scaler_path):
                    self.cv_scaler = joblib.load(scaler_path)
                if os.path.exists(meta_path):
                    with open(meta_path, "r", encoding="utf-8") as f:
                        self.produce_metadata = json.load(f)
                self.models_loaded = True
                print(f"[FoodQualityVisionEngine] Successfully loaded CV models & Produce Classifier from {saved_models_dir}")
            else:
                print("[FoodQualityVisionEngine] Trained CV models not found; using calibrated heuristic analyzer.")
        except Exception as e:
            print(f"[FoodQualityVisionEngine] Warning loading CV models: {e}")
            self.models_loaded = False

    def analyze_image(self, image_bytes: bytes, category: str = "Fruits") -> Dict[str, Any]:
        """Analyze an uploaded or container-captured food image."""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            return self._default_features(category)

        orig_h, orig_w = img_bgr.shape[:2]
        img_resized = cv2.resize(img_bgr, (256, 256))
        rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

        # 1. Produce Foreground Segmentation
        mask, primary_contour, fg_pixels, _ = segment_produce_foreground(img_bgr)

        # 2. Extract 36-dimensional feature vector
        feat_vec = extract_visual_features_from_image(img_bgr)
        r_mean, g_mean, b_mean = float(feat_vec[0]), float(feat_vec[1]), float(feat_vec[2])
        avg_brightness = float(feat_vec[8]) # V mean
        browning_percent = round(float(feat_vec[15]), 2)
        green_ratio = round(float(feat_vec[16]), 2)
        mould_coverage = round(float(feat_vec[17]), 2)
        mould_detected = mould_coverage >= 2.2
        texture_degradation = min(100.0, round(float(feat_vec[25] * 2.2), 1))

        # 3. Predict Produce Species
        x_input = feat_vec.reshape(1, -1)
        identified_produce = "Produce"
        produce_confidence = 88.0
        produce_icon = "🍎"
        scientific_name = ""
        baseline_shelf_life = 120.0
        detected_category = category

        if self.produce_classifier:
            try:
                p_idx = int(self.produce_classifier.predict(x_input)[0])
                p_probs = self.produce_classifier.predict_proba(x_input)[0]
                classes = self.produce_metadata.get("produce_classes", PRODUCE_CLASSES)
                if 0 <= p_idx < len(classes):
                    identified_produce = classes[p_idx]
                    produce_confidence = round(float(p_probs[p_idx] * 100.0), 1)
                    info = PRODUCE_INFO.get(identified_produce, {})
                    produce_icon = info.get("icon", "🍎")
                    scientific_name = info.get("scientific", "")
                    baseline_shelf_life = info.get("shelf_life", 120.0)
                    detected_category = info.get("category", category)
            except Exception as e:
                print(f"[FoodQualityVisionEngine] Produce classification error: {e}")

        # 4. Spoilage Diagnostics & Ripeness Classification
        pred_stage_idx = None
        pred_score = None
        if self.models_loaded and self.cv_classifier:
            try:
                pred_stage_idx = int(self.cv_classifier.predict(x_input)[0])
                if self.cv_regressor:
                    pred_score = float(self.cv_regressor.predict(x_input)[0])
            except Exception as e:
                print(f"[FoodQualityVisionEngine] ML inference error: {e}")

        ripeness_stage, ripeness_percent, visual_score, risk_level = self._compute_produce_diagnostics(
            produce_name=identified_produce,
            feat_vec=feat_vec,
            pred_stage_idx=pred_stage_idx,
            pred_score=pred_score,
            browning=browning_percent,
            mould=mould_coverage,
            texture=texture_degradation,
            green_ratio=green_ratio,
            mould_detected=mould_detected
        )

        # 5. Remaining Shelf-Life Estimation
        decay_factor = max(0.0, (100.0 - visual_score) / 100.0)
        remaining_shelf_life = round(baseline_shelf_life * (decay_factor ** 1.3), 1)
        if visual_score >= 78.0 or mould_detected or "Spoiled" in ripeness_stage or risk_level == "Critical":
            remaining_shelf_life = 0.0
        elif "Overripe" in ripeness_stage or risk_level == "High":
            # Overripe produce must be consumed or diverted today (maximum 24 hours shelf-life)
            remaining_shelf_life = round(min(remaining_shelf_life, 24.0), 1)
            remaining_shelf_life = max(2.0, remaining_shelf_life)
        elif risk_level == "Medium":
            remaining_shelf_life = round(min(remaining_shelf_life, 72.0), 1)

        # 6. Extract Normalized Bounding Boxes strictly inside produce boundary
        bounding_boxes, detected_defects = self._extract_defect_contours(
            img_resized, rgb, gray, mask, primary_contour, mould_detected, browning_percent, texture_degradation, ripeness_stage, identified_produce
        )

        return {
            "identified_produce": identified_produce,
            "produce_confidence": produce_confidence,
            "produce_icon": produce_icon,
            "scientific_name": scientific_name,
            "category": detected_category,
            "baseline_shelf_life_hours": baseline_shelf_life,
            "remaining_shelf_life_hours": remaining_shelf_life,
            "mean_rgb": [round(r_mean, 1), round(g_mean, 1), round(b_mean, 1)],
            "brightness": round(avg_brightness, 1),
            "discoloration_score": browning_percent,
            "mould_detected": mould_detected,
            "mould_coverage": mould_coverage,
            "ripeness_stage": ripeness_stage,
            "ripeness_percent": round(ripeness_percent, 1),
            "texture_degradation": texture_degradation,
            "visual_spoilage_score": round(visual_score, 1),
            "risk_level": risk_level,
            "detected_defects": detected_defects,
            "bounding_boxes": bounding_boxes,
            "image_width": orig_w,
            "image_height": orig_h
        }

    def _compute_produce_diagnostics(
        self, produce_name, feat_vec, pred_stage_idx, pred_score, browning, mould, texture, green_ratio, mould_detected
    ):
        """
        Calibrate produce-specific thresholds to avoid false-positives
        and guarantee accurate stage detection for Peach, Avocado, Banana, etc.
        """
        # Physical defect composite penalty
        physical_defect_score = (browning * 1.4) + (mould * 5.0) + (texture * 0.20)

        if pred_score is not None:
            fused_score = (0.35 * pred_score) + (0.65 * physical_defect_score)
        else:
            fused_score = physical_defect_score

        visual_score = float(np.clip(fused_score, 5.0, 99.0))

        # --- Produce-Specific Calibrations ---
        # 1. Avocado: Retains green chlorophyll while ripening into dark peel.
        # High browning (15-35%) with green pulp retention is Overripe (Stage 3), not Spoiled!
        if "Avocado" in produce_name:
            if mould_detected or mould >= 3.0 or browning >= 38.0 or visual_score >= 82.0:
                ripeness_stage = "Spoiled / Rotten (Grade F)"
                risk_level = "Critical"
                ripeness_percent = max(5.0, round(100.0 - visual_score, 1))
            elif browning >= 12.0 or texture >= 38.0 or visual_score >= 48.0 or pred_stage_idx == 2:
                ripeness_stage = "Overripe / Softening (Use Today)"
                risk_level = "High"
                ripeness_percent = max(25.0, round(100.0 - visual_score, 1))
                visual_score = min(74.0, max(58.0, visual_score))
            elif visual_score >= 20.0 or browning >= 4.0 or pred_stage_idx == 1:
                ripeness_stage = "Optimal Ripe (Grade B)"
                risk_level = "Medium" if visual_score >= 40.0 else "Low"
                ripeness_percent = max(60.0, round(100.0 - visual_score, 1))
                visual_score = min(50.0, max(24.0, visual_score))
            else:
                ripeness_stage = "Fresh / Firm (Grade A)"
                risk_level = "Low"
                ripeness_percent = 95.0
                visual_score = min(18.0, max(5.0, visual_score))
            return ripeness_stage, ripeness_percent, round(visual_score, 1), risk_level

        # 2. Peach: Sunken necrotic lesion / brown rot (Monilinia fructicola) or wrinkling
        if "Peach" in produce_name:
            if mould_detected or mould >= 2.5 or browning >= 24.0 or visual_score >= 78.0:
                ripeness_stage = "Spoiled / Rotten (Grade F)"
                risk_level = "Critical"
                ripeness_percent = max(5.0, round(100.0 - visual_score, 1))
                visual_score = max(80.0, visual_score)
            elif browning >= 10.0 or texture >= 32.0 or visual_score >= 48.0 or pred_stage_idx == 2:
                ripeness_stage = "Overripe / Softening (Use Today)"
                risk_level = "High"
                ripeness_percent = max(25.0, round(100.0 - visual_score, 1))
                visual_score = min(74.0, max(60.0, visual_score))
            elif visual_score >= 18.0 or browning >= 4.0:
                ripeness_stage = "Optimal Ripe (Grade B)"
                risk_level = "Medium" if visual_score >= 40.0 else "Low"
                ripeness_percent = max(65.0, round(100.0 - visual_score, 1))
                visual_score = min(50.0, max(22.0, visual_score))
            else:
                ripeness_stage = "Fresh / Firm (Grade A)"
                risk_level = "Low"
                ripeness_percent = 95.0
                visual_score = min(18.0, max(5.0, visual_score))
            return ripeness_stage, ripeness_percent, round(visual_score, 1), risk_level

        # 3. Banana: Sugar freckling is Overripe, blackening/mould is Spoiled
        if "Banana" in produce_name:
            if mould_detected or mould >= 2.5 or browning >= 45.0 or visual_score >= 82.0:
                ripeness_stage = "Spoiled / Rotten (Grade F)"
                risk_level = "Critical"
                ripeness_percent = max(5.0, round(100.0 - visual_score, 1))
            elif browning >= 15.0 or texture >= 40.0 or visual_score >= 52.0:
                ripeness_stage = "Overripe / Softening (Use Today)"
                risk_level = "High"
                ripeness_percent = max(25.0, round(100.0 - visual_score, 1))
                visual_score = min(72.0, max(58.0, visual_score))
            elif visual_score >= 20.0 or browning >= 3.0:
                ripeness_stage = "Optimal Ripe (Grade B)"
                risk_level = "Low"
                ripeness_percent = max(65.0, round(100.0 - visual_score, 1))
                visual_score = min(48.0, max(22.0, visual_score))
            else:
                ripeness_stage = "Fresh / Firm (Grade A)"
                risk_level = "Low"
                ripeness_percent = 95.0
                visual_score = min(18.0, max(5.0, visual_score))
            return ripeness_stage, ripeness_percent, round(visual_score, 1), risk_level

        # 4. Apple, Tomato, Strawberry: High cuticle gloss & natural fruit sheen
        if any(k in produce_name for k in ["Apple", "Tomato", "Strawberry"]):
            if mould_detected or mould >= 2.5 or browning >= 40.0 or visual_score >= 78.0:
                ripeness_stage = "Spoiled / Rotten (Grade F)"
                risk_level = "Critical"
                ripeness_percent = max(5.0, round(100.0 - visual_score, 1))
            elif browning >= 12.0 or visual_score >= 48.0 or pred_stage_idx == 2:
                ripeness_stage = "Overripe / Softening (Use Today)"
                risk_level = "High"
                ripeness_percent = max(25.0, round(100.0 - visual_score, 1))
                visual_score = min(74.0, max(55.0, visual_score))
            elif browning >= 4.0 or visual_score >= 22.0 or pred_stage_idx == 1:
                ripeness_stage = "Optimal Ripe (Grade B)"
                risk_level = "Medium" if visual_score >= 38.0 else "Low"
                ripeness_percent = max(65.0, round(100.0 - visual_score, 1))
                visual_score = min(48.0, max(22.0, visual_score))
            else:
                ripeness_stage = "Fresh / Firm (Grade A)"
                risk_level = "Low"
                ripeness_percent = 95.0
                visual_score = min(15.0, max(5.0, visual_score))
            return ripeness_stage, ripeness_percent, round(visual_score, 1), risk_level

        # 5. Leafy Greens & Lettuce (High Chlorophyll, crisp white rib anatomy)
        if any(k in produce_name for k in ["Lettuce", "Spinach", "Gotukola", "Kankun", "Mukunuwenna"]):
            if mould_detected or (mould >= 2.5 and browning >= 10.0) or browning >= 30.0 or visual_score >= 80.0:
                ripeness_stage = "Spoiled / Rotten (Grade F)"
                risk_level = "Critical"
                ripeness_percent = max(5.0, round(100.0 - visual_score, 1))
            elif green_ratio >= 60.0 and browning < 5.0 and not mould_detected:
                ripeness_stage = "Fresh / Firm (Grade A)"
                risk_level = "Low"
                ripeness_percent = 96.0
                visual_score = min(12.0, max(4.0, visual_score))
            elif browning >= 10.0 or texture >= 45.0 or visual_score >= 48.0 or pred_stage_idx == 2:
                ripeness_stage = "Overripe / Softening (Use Today)"
                risk_level = "High"
                ripeness_percent = max(25.0, round(100.0 - visual_score, 1))
                visual_score = min(72.0, max(58.0, visual_score))
            else:
                ripeness_stage = "Optimal Ripe (Grade B)"
                risk_level = "Low"
                ripeness_percent = max(65.0, round(100.0 - visual_score, 1))
                visual_score = min(45.0, max(20.0, visual_score))
            return ripeness_stage, ripeness_percent, round(visual_score, 1), risk_level

        # Standard Generic Produce Evaluation
        if mould_detected or mould >= 2.5 or visual_score >= 80.0 or browning >= 45.0:
            ripeness_stage = "Spoiled / Rotten (Grade F)"
            risk_level = "Critical"
            ripeness_percent = max(5.0, round(100.0 - visual_score, 1))
            visual_score = max(80.0, visual_score)
        elif browning >= 14.0 or texture >= 42.0 or visual_score >= 52.0 or pred_stage_idx == 2:
            ripeness_stage = "Overripe / Softening (Use Today)"
            risk_level = "High"
            ripeness_percent = max(25.0, round(100.0 - visual_score, 1))
            visual_score = min(74.0, max(58.0, visual_score))
        elif visual_score >= 22.0 or browning >= 6.0 or pred_stage_idx == 1:
            ripeness_stage = "Optimal Ripe (Grade B)"
            risk_level = "Medium" if visual_score >= 40.0 else "Low"
            ripeness_percent = max(60.0, round(100.0 - visual_score, 1))
            visual_score = min(50.0, max(24.0, visual_score))
        else:
            ripeness_stage = "Fresh / Firm (Grade A)"
            risk_level = "Low"
            ripeness_percent = 95.0
            visual_score = min(18.0, max(5.0, visual_score))

        return ripeness_stage, ripeness_percent, round(visual_score, 1), risk_level

    def _extract_defect_contours(
        self, img_resized, rgb, gray, produce_mask, primary_contour, mould_detected, browning_percent, texture, ripeness_stage, produce_name
    ):
        boxes = []
        defects = []
        hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)

        # 1. Produce Object Localization Box (Identified Produce)
        if primary_contour is not None and len(primary_contour) >= 4:
            px, py, pw, ph = cv2.boundingRect(primary_contour)
            if pw < 245 or ph < 245: # Exclude full background
                boxes.append({
                    "label": f"IDENTIFIED: {produce_name.upper()}",
                    "type": "produce_object",
                    "x": int(px * 100 / 256),
                    "y": int(py * 100 / 256),
                    "width": int(pw * 100 / 256),
                    "height": int(ph * 100 / 256),
                    "color": "#059669"
                })

        # 2. Mould Contours (STRICTLY inside produce_mask)
        is_chlorophyll = (hsv[:, :, 0] >= 32) & (hsv[:, :, 0] <= 88) & (hsv[:, :, 1] >= 28)
        raw_mould_mask = ((hsv[:, :, 1] < 28) & (hsv[:, :, 2] > 195) & (~is_chlorophyll) & (gray > 190))
        mould_mask = (raw_mould_mask & (produce_mask > 0)).astype(np.uint8) * 255
        
        # Clear image borders
        mould_mask[:10, :] = 0
        mould_mask[-10:, :] = 0
        mould_mask[:, :10] = 0
        mould_mask[:, -10:] = 0

        if mould_detected:
            contours_m, _ = cv2.findContours(mould_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours_m:
                area = cv2.contourArea(cnt)
                if area > 120:
                    x, y, w, h = cv2.boundingRect(cnt)
                    # Reject boxes that span almost entire image (background artifacts)
                    if w < 220 and h < 220:
                        boxes.append({
                            "label": "MOULD SPORE COLONY",
                            "type": "spoilage",
                            "x": int(x * 100 / 256),
                            "y": int(y * 100 / 256),
                            "width": int(w * 100 / 256),
                            "height": int(h * 100 / 256),
                            "color": "#ef4444"
                        })
            defects.append("Fungal Mycelium / Mould Colony Detected")

        # 3. Enzymatic Browning / Necrotic Softening (STRICTLY inside produce_mask)
        raw_brown_mask = (((rgb[:, :, 0] < 125) & (rgb[:, :, 1] < 110) & (rgb[:, :, 2] < 85) & (gray < 100)) | \
                          ((rgb[:, :, 0] > 70) & (rgb[:, :, 0] < 190) & (rgb[:, :, 1] > 40) & (rgb[:, :, 1] < 140) & (rgb[:, :, 2] < 90))) & (~is_chlorophyll)
        brown_mask = (raw_brown_mask & (produce_mask > 0)).astype(np.uint8) * 255
        contours_b, _ = cv2.findContours(brown_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        sorted_b_contours = sorted(contours_b, key=cv2.contourArea, reverse=True)
        for cnt in sorted_b_contours[:3]:
            area = cv2.contourArea(cnt)
            if area > 150:
                x, y, w, h = cv2.boundingRect(cnt)
                if w < 220 and h < 220:
                    is_overripe = "overripe" in ripeness_stage.lower() or browning_percent >= 14.0
                    is_spoiled = "spoiled" in ripeness_stage.lower()
                    label = "NECROTIC ROT LESION" if is_spoiled else ("SENESCENCE BROWNING" if is_overripe else "PEEL DISCOLORATION")
                    color = "#ef4444" if is_spoiled else ("#f59e0b" if is_overripe else "#eab308")
                    boxes.append({
                        "label": label,
                        "type": "discoloration",
                        "x": int(x * 100 / 256),
                        "y": int(y * 100 / 256),
                        "width": int(w * 100 / 256),
                        "height": int(h * 100 / 256),
                        "color": color
                    })

        if browning_percent >= 14.0:
            defects.append(f"Surface Enzymatic Browning & Discoloration ({browning_percent}%)")
            defects.append(f"Epidermal Texture Breakdown & Softening ({texture}%)")
            defects.append("Senescent Anthracnose / Sunken Necrotic Softening")
        elif browning_percent >= 5.0:
            defects.append(f"Mild Surface Lenticel Spotting ({browning_percent}%)")

        if not defects:
            defects.append("Intact Epidermal Cuticle (No Fungal Lesions or Senescent Browning)")

        # Return top 5 most critical bounding boxes
        return boxes[:5], defects

    def _default_features(self, category: str) -> Dict[str, Any]:
        return {
            "identified_produce": "Fruit / Vegetable",
            "produce_confidence": 0.0,
            "produce_icon": "🍎",
            "scientific_name": "",
            "category": category,
            "baseline_shelf_life_hours": 120.0,
            "remaining_shelf_life_hours": 96.0,
            "mean_rgb": [128.0, 128.0, 128.0],
            "brightness": 128.0,
            "discoloration_score": 0.0,
            "mould_detected": False,
            "mould_coverage": 0.0,
            "ripeness_stage": "Fresh / Firm (Grade A)",
            "ripeness_percent": 95.0,
            "texture_degradation": 10.0,
            "visual_spoilage_score": 5.0,
            "risk_level": "Low",
            "detected_defects": ["No image data provided"],
            "bounding_boxes": [],
            "image_width": 256,
            "image_height": 256
        }

food_vision_engine = FoodQualityVisionEngine()
vision_engine = food_vision_engine
