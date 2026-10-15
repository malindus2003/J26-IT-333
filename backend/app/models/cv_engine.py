import io
import os
import joblib
import numpy as np
import cv2
from PIL import Image
from typing import Dict, Any, Tuple, List, Optional
from .train_cv_models import extract_visual_features_from_image

class FoodQualityVisionEngine:
    """
    Multi-Category Computer Vision Engine for Food Quality, Ripeness Stage & Spoilage Detection.
    Combines:
    1. OpenCV Color-Space & Morphological Defect Feature Extraction
    2. Trained Machine Learning Classifier (Random Forest CV Classifier & Regressor)
    3. Automated Contour Defect Segmentation & Bounding Box Generation for UI Overlays.
    """

    CATEGORIES = ["Fruits", "Vegetables"]
    CLASS_LABELS = {0: "Fresh (Grade A)", 1: "Ripe / Good (Grade B)", 2: "Spoiled / Rotten (Grade F)"}

    def __init__(self):
        self.models_loaded = False
        self.cv_classifier = None
        self.cv_regressor = None
        self.cv_scaler = None
        self.load_trained_cv_models()

    def load_trained_cv_models(self):
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            saved_models_dir = os.path.join(base_dir, "saved_models")
            
            cls_path = os.path.join(saved_models_dir, "cv_spoilage_classifier.joblib")
            reg_path = os.path.join(saved_models_dir, "cv_ripeness_regressor.joblib")
            scaler_path = os.path.join(saved_models_dir, "cv_feature_scaler.joblib")

            if os.path.exists(cls_path) and os.path.exists(reg_path):
                self.cv_classifier = joblib.load(cls_path)
                self.cv_regressor = joblib.load(reg_path)
                if os.path.exists(scaler_path):
                    self.cv_scaler = joblib.load(scaler_path)
                self.models_loaded = True
                print(f"[FoodQualityVisionEngine] Loaded trained CV models from {saved_models_dir}")
            else:
                print("[FoodQualityVisionEngine] Trained CV models not found; using heuristic vision analyzer.")
        except Exception as e:
            print(f"[FoodQualityVisionEngine] Warning loading CV models: {e}")
            self.models_loaded = False

    def analyze_image(self, image_bytes: bytes, category: str = "Fruits") -> Dict[str, Any]:
        """Analyze an uploaded or container-captured food image."""
        try:
            # Decode image with OpenCV
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

        # 1. Feature Extraction via Multi-Domain Pipeline
        feat_vec = extract_visual_features_from_image(img_bgr)
        r_mean, g_mean, b_mean = float(feat_vec[0]), float(feat_vec[1]), float(feat_vec[2])
        avg_brightness = float(feat_vec[8]) # V mean
        browning_percent = round(float(feat_vec[15]), 2)
        mould_coverage = round(float(feat_vec[17]), 2)
        mould_detected = mould_coverage > 2.0
        texture_degradation = min(100.0, round(float(feat_vec[18] * 2.2), 1))

        # 2. Machine Learning Inference & Physical Defect Fusion
        cat_clean = category.capitalize() if category and category.capitalize() in self.CATEGORIES else "Fruits"
        pred_cls_idx = None
        pred_score = None

        if self.models_loaded and self.cv_classifier:
            try:
                x_input = feat_vec.reshape(1, -1)
                pred_cls_idx = int(self.cv_classifier.predict(x_input)[0])
                if self.cv_regressor:
                    pred_score = float(self.cv_regressor.predict(x_input)[0])
            except Exception as e:
                print(f"[FoodQualityVisionEngine] ML inference error: {e}")

        ripeness_stage, ripeness_percent, visual_score, risk_level = self._compute_spoilage_diagnostics(
            feat_vec=feat_vec,
            pred_cls_idx=pred_cls_idx,
            pred_score=pred_score,
            browning=browning_percent,
            mould=mould_coverage,
            texture=texture_degradation,
            mould_detected=mould_detected
        )

        # 3. Contour Defect Segmentation & Bounding Box Generation
        bounding_boxes, detected_defects = self._extract_defect_contours(
            img_resized, rgb, gray, mould_detected, browning_percent, texture_degradation, ripeness_stage
        )

        return {
            "category": cat_clean,
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

    def _compute_spoilage_diagnostics(
        self, feat_vec, pred_cls_idx, pred_score, browning, mould, texture, mould_detected
    ):
        """
        Calibrate and fuse ML predictions with physical defect measurements.
        Accurately separates:
        - Stage 1: Fresh / Firm (Grade A)
        - Stage 2: Optimal Ripe (Grade B)
        - Stage 3: Overripe / Softening (Use Today)
        - Stage 4: Spoiled / Rotten (Grade F)
        """
        # Composite physical visual defect penalty
        physical_defect_score = (browning * 1.3) + (mould * 4.5) + (texture * 0.22)

        if pred_score is not None:
            # Weighted fusion: 40% ML regressor + 60% physical visual defects
            fused_score = (0.40 * pred_score) + (0.60 * physical_defect_score)
        else:
            fused_score = physical_defect_score

        visual_score = float(np.clip(fused_score, 5.0, 99.0))

        # Hierarchical Food Safety Rules:
        # Rule 1: Active Mould Colony OR Severe Necrosis -> Stage 4 (Spoiled / Rotten)
        if mould_detected or mould >= 2.5 or visual_score >= 82.0 or browning >= 52.0:
            ripeness_stage = "Spoiled / Rotten (Grade F)"
            risk_level = "Critical"
            ripeness_percent = max(5.0, round(100.0 - visual_score, 1))
            visual_score = max(82.0, visual_score)

        # Rule 2: High Browning / Senescence / Tissue breakdown -> Stage 3 (Overripe)
        elif browning >= 18.0 or texture >= 60.0 or visual_score >= 58.0 or pred_cls_idx == 2:
            ripeness_stage = "Overripe / Softening (Use Today)"
            risk_level = "High"
            ripeness_percent = max(20.0, round(100.0 - visual_score, 1))
            visual_score = min(76.0, max(68.0, visual_score))

        # Rule 3: Moderate Browning / Ripe -> Stage 2 (Optimal Ripe)
        elif visual_score >= 25.0 or browning >= 8.0 or texture >= 25.0 or pred_cls_idx == 1:
            ripeness_stage = "Optimal Ripe (Grade B)"
            risk_level = "Medium" if visual_score >= 45.0 else "Low"
            ripeness_percent = max(60.0, round(100.0 - visual_score, 1))
            visual_score = min(54.0, max(26.0, visual_score))

        # Rule 4: Prime Fresh Harvest -> Stage 1 (Fresh / Firm)
        else:
            ripeness_stage = "Fresh / Firm (Grade A)"
            risk_level = "Low"
            ripeness_percent = 95.0
            visual_score = min(20.0, max(5.0, visual_score))

        return ripeness_stage, ripeness_percent, round(visual_score, 1), risk_level

    def _extract_defect_contours(self, img_resized, rgb, gray, mould_detected, browning_percent, texture, ripeness_stage):
        boxes = []
        defects = []
        hsv = cv2.cvtColor(img_resized, cv2.COLOR_RGB2HSV)

        # Intact plant green discrimination (prevents false-positive mould on avocados, bananas, cucumbers)
        is_chlorophyll = (hsv[:, :, 0] >= 32) & (hsv[:, :, 0] <= 88) & (hsv[:, :, 1] >= 28)

        mould_mask = (((hsv[:, :, 1] < 35) & (hsv[:, :, 2] > 185) & (~is_chlorophyll) & (gray > 180))).astype(np.uint8) * 255
        # Clear extreme image borders to prevent photo-frame / crop artefacts
        mould_mask[:8, :] = 0
        mould_mask[-8:, :] = 0
        mould_mask[:, :8] = 0
        mould_mask[:, -8:] = 0

        if mould_detected:
            contours_m, _ = cv2.findContours(mould_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours_m:
                if cv2.contourArea(cnt) > 200:
                    x, y, w, h = cv2.boundingRect(cnt)
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

        # 2. Enzymatic Browning / Senescence Necrosis / Sunken Softening Rot
        brown_mask = (((rgb[:, :, 0] < 125) & (rgb[:, :, 1] < 110) & (rgb[:, :, 2] < 85) & (gray < 100)) | \
                      ((rgb[:, :, 0] > 70) & (rgb[:, :, 0] < 190) & (rgb[:, :, 1] > 40) & (rgb[:, :, 1] < 140) & (rgb[:, :, 2] < 90))).astype(np.uint8) * 255
        contours_b, _ = cv2.findContours(brown_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Sort contours by size to highlight the primary symptom areas
        sorted_b_contours = sorted(contours_b, key=cv2.contourArea, reverse=True)
        for cnt in sorted_b_contours[:4]:
            if cv2.contourArea(cnt) > 200:
                x, y, w, h = cv2.boundingRect(cnt)
                is_overripe = "overripe" in ripeness_stage.lower() or browning_percent >= 18.0
                label = "SENESCENCE BROWNING" if is_overripe else "PEEL DISCOLORATION"
                color = "#f59e0b" if is_overripe else "#eab308"
                boxes.append({
                    "label": label,
                    "type": "discoloration",
                    "x": int(x * 100 / 256),
                    "y": int(y * 100 / 256),
                    "width": int(w * 100 / 256),
                    "height": int(h * 100 / 256),
                    "color": color
                })

        if browning_percent >= 18.0:
            defects.append(f"Surface Enzymatic Browning & Discoloration ({browning_percent}%)")
            defects.append(f"Epidermal Texture Breakdown & Softening ({texture}%)")
            defects.append("Senescent Anthracnose / Sunken Necrotic Softening")
        elif browning_percent >= 8.0:
            defects.append(f"Mild Surface Lenticel Spotting ({browning_percent}%)")

        if not defects:
            defects.append("Intact Epidermal Cuticle (No Fungal Lesions or Browning)")
            # Add an intact peel reference box
            boxes.append({
                "label": "INTACT HEALTHY PEEL",
                "type": "fresh",
                "x": 20,
                "y": 20,
                "width": 60,
                "height": 60,
                "color": "#10b981"
            })

        # Limit to top 5 bounding boxes for clean UI display
        return boxes[:5], defects

    def _default_features(self, category: str) -> Dict[str, Any]:
        return {
            "category": category,
            "mean_rgb": [128.0, 128.0, 128.0],
            "brightness": 128.0,
            "discoloration_score": 0.0,
            "mould_detected": False,
            "mould_coverage": 0.0,
            "ripeness_stage": "Fresh (Grade A)",
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
