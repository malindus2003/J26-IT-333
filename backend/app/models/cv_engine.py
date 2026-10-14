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

    CATEGORIES = ["Fruits", "Vegetables", "Dairy", "Fish", "Meat"]
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
        mould_detected = mould_coverage > 1.8
        texture_degradation = min(100.0, round(float(feat_vec[18] * 2.2), 1))

        # 2. Machine Learning Inference if Models Loaded
        cat_clean = category.capitalize() if category and category.capitalize() in self.CATEGORIES else "Fruits"
        
        if self.models_loaded and self.cv_classifier:
            try:
                x_input = feat_vec.reshape(1, -1)
                pred_cls_idx = int(self.cv_classifier.predict(x_input)[0])
                pred_score = float(self.cv_regressor.predict(x_input)[0]) if self.cv_regressor else browning_percent * 1.5
                
                ripeness_stage = self.CLASS_LABELS.get(pred_cls_idx, "Fresh (Grade A)")
                visual_score = float(np.clip(pred_score, 0.0, 100.0))
                
                if pred_cls_idx == 0:
                    ripeness_percent = 92.0
                    risk_level = "Low"
                elif pred_cls_idx == 1:
                    ripeness_percent = 75.0
                    risk_level = "Medium"
                else: # 2: Spoiled / Rotten
                    ripeness_percent = 12.0
                    risk_level = "Critical"
            except Exception as e:
                print(f"[FoodQualityVisionEngine] ML inference error: {e}")
                ripeness_stage, ripeness_percent, visual_score, risk_level = self._heuristic_fallback(
                    browning_percent, mould_coverage, texture_degradation
                )
        else:
            ripeness_stage, ripeness_percent, visual_score, risk_level = self._heuristic_fallback(
                browning_percent, mould_coverage, texture_degradation
            )

        # 3. Contour Defect Segmentation & Bounding Box Generation
        bounding_boxes, detected_defects = self._extract_defect_contours(img_resized, rgb, gray, mould_detected, browning_percent)

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

    def _extract_defect_contours(self, img_bgr, rgb, gray, mould_detected, browning_percent):
        boxes = []
        defects = []

        # Mould Defect Contours
        mould_mask = ((rgb[:, :, 1] > rgb[:, :, 0] * 1.15) & (rgb[:, :, 1] > 65) & (rgb[:, :, 0] < 135)).astype(np.uint8) * 255
        contours, _ = cv2.findContours(mould_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > 120:
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

        if mould_detected:
            defects.append("Fungal Mycelium / Mould Colony Detected")

        # Enzymatic Browning / Necrotic Spot Contours
        brown_mask = ((rgb[:, :, 0] > 70) & (rgb[:, :, 0] < 190) & 
                      (rgb[:, :, 1] > 40) & (rgb[:, :, 1] < 140) & 
                      (rgb[:, :, 2] < 90)).astype(np.uint8) * 255
        contours_b, _ = cv2.findContours(brown_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in contours_b:
            area = cv2.contourArea(cnt)
            if area > 200:
                x, y, w, h = cv2.boundingRect(cnt)
                boxes.append({
                    "label": "SENESCENCE BROWNING",
                    "type": "discoloration",
                    "x": int(x * 100 / 256),
                    "y": int(y * 100 / 256),
                    "width": int(w * 100 / 256),
                    "height": int(h * 100 / 256),
                    "color": "#f59e0b"
                })

        if browning_percent > 12.0:
            defects.append(f"Surface Enzymatic Browning & Discoloration ({browning_percent}%)")

        if not defects:
            defects.append("Intact Epidermal Surface (No Active Fungal Lesions)")

        # Limit to top 5 bounding boxes for clean UI display
        return boxes[:5], defects

    def _heuristic_fallback(self, browning: float, mould: float, texture: float):
        if mould > 2.0 or browning > 30.0:
            return "Spoiled / Mouldy (Grade F)", 10.0, 92.0, "Critical"
        elif browning > 15.0 or texture > 40.0:
            return "Degraded / Consumable (Grade C)", 45.0, 58.0, "Medium"
        elif browning > 6.0:
            return "Ripe / Good (Grade B)", 80.0, 25.0, "Low"
        else:
            return "Fresh (Grade A)", 95.0, 8.0, "Low"

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
