"""
Unit & Integration Test Suite for GreenPulse Computer Vision Spoilage Pipeline
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)
"""

import os
import glob
import json
import unittest
import numpy as np
import cv2

from backend.app.data.prepare_cv_dataset import (
    extract_multi_domain_features,
    SUPPORTED_SPECIES,
    FALLBACK_SPECIES
)
from backend.app.models.cv_engine import vision_engine
from backend.app.routers.vision import (
    _load_inspection_history,
    _save_to_inspection_history
)

class TestVisionPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.manifest_path = os.path.join(cls.base_dir, "app", "data", "cv_dataset_manifest.json")
        cls.metrics_path = os.path.join(cls.base_dir, "app", "models", "saved_models", "cv_real_metrics.json")
        cls.img_dir = os.path.join(cls.base_dir, "app", "data", "public_benchmarks", "fruit_freshness_images", "JPEGImages")

    def test_01_dataset_manifest_integrity(self):
        """Verify the manifest contains 3,202 verified images and clean splits."""
        self.assertTrue(os.path.exists(self.manifest_path), "Dataset manifest not found")
        with open(self.manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        meta = manifest["metadata"]
        self.assertEqual(meta["total_samples"], 3202)
        self.assertEqual(meta["train_samples"] + meta["val_samples"] + meta["test_samples"], 3202)
        self.assertEqual(meta["feature_dimension"], 36)
        self.assertIn("Apple", meta["supported_species"])
        self.assertIn("Banana", meta["supported_species"])
        self.assertIn("Orange", meta["supported_species"])

    def test_02_feature_extraction_dimension_and_validity(self):
        """Test that multi-domain feature vector is 36-dimensional and contains no NaNs."""
        sample_img = np.full((160, 160, 3), 120, dtype=np.uint8)
        feat = extract_multi_domain_features(sample_img)
        self.assertEqual(feat.shape, (36,))
        self.assertFalse(np.isnan(feat).any(), "Feature vector contains NaN values")
        self.assertFalse(np.isinf(feat).any(), "Feature vector contains Inf values")

    def test_03_models_loaded_successfully(self):
        """Verify that production ML models are loaded in FoodQualityVisionEngine."""
        self.assertTrue(vision_engine.models_loaded, "Vision engine models failed to load")
        self.assertIsNotNone(vision_engine.produce_classifier, "Species classifier is None")
        self.assertIsNotNone(vision_engine.stage_classifier, "Stage classifier is None")
        self.assertIsNotNone(vision_engine.spoilage_regressor, "Spoilage regressor is None")

    def test_04_real_image_inference(self):
        """Run complete inference pipeline on a real test benchmark image."""
        img_files = glob.glob(os.path.join(self.img_dir, "*.jpg"))
        self.assertGreater(len(img_files), 0, "No benchmark images found")
        
        sample_path = img_files[0]
        with open(sample_path, "rb") as f:
            img_bytes = f.read()

        results = vision_engine.analyze_image(img_bytes, category="Fruits")

        # Verify output schema
        self.assertIn("analysis_id", results)
        self.assertTrue(results["analysis_id"].startswith("CV-SCAN-"))
        self.assertIn("identified_produce", results)
        self.assertIn(results["identified_produce"], SUPPORTED_SPECIES + [FALLBACK_SPECIES])
        self.assertIn("produce_confidence", results)
        self.assertGreaterEqual(results["produce_confidence"], 0.0)
        self.assertLessEqual(results["produce_confidence"], 100.0)
        self.assertIn("ripeness_stage", results)
        self.assertIn("remaining_shelf_life_hours", results)
        self.assertIn("rsl_confidence_interval", results)
        self.assertIn("bounding_boxes", results)
        self.assertIn("processing_latency_ms", results)

    def test_05_rsl_boundary_constraints(self):
        """Verify safety bounds: spoiled/mouldy fruit has RSL = 0.0 hrs."""
        sample_img = np.zeros((160, 160, 3), dtype=np.uint8)
        # Simulate extreme dark/rotted pixels
        sample_img[:, :] = [30, 25, 20]
        _, enc = cv2.imencode(".jpg", sample_img)
        results = vision_engine.analyze_image(enc.tobytes(), category="Fruits")

        if results.get("mould_detected") or "Spoiled" in results.get("ripeness_stage", ""):
            self.assertEqual(results["remaining_shelf_life_hours"], 0.0)
            self.assertEqual(results["rsl_min_hours"], 0.0)

    def test_06_prediction_interval_validity(self):
        """Verify that RSL prediction intervals satisfy rsl_min <= rsl <= rsl_max."""
        img_files = glob.glob(os.path.join(self.img_dir, "*.jpg"))
        sample_path = img_files[min(10, len(img_files) - 1)]
        with open(sample_path, "rb") as f:
            img_bytes = f.read()

        res = vision_engine.analyze_image(img_bytes, category="Fruits")
        rsl = res["remaining_shelf_life_hours"]
        rsl_min = res["rsl_min_hours"]
        rsl_max = res["rsl_max_hours"]
        self.assertLessEqual(rsl_min, rsl + 1e-4)
        self.assertGreaterEqual(rsl_max, rsl - 1e-4)

    def test_07_inspection_history_persistence(self):
        """Verify that saving and loading inspection history works reliably."""
        test_entry = {
            "analysis_id": "CV-SCAN-TEST-001",
            "timestamp": "2026-10-19T13:00:00",
            "source": "Automated Unit Test",
            "produce": "Apple",
            "confidence": 95.0,
            "stage": "Ripe / Optimal (Grade B)",
            "rsl_hours": 120.0,
            "rsl_interval": "95.0 - 145.0 hrs [90% CI]",
            "risk_level": "Low",
            "mould_detected": False,
            "defect_count": 0,
            "latency_ms": 35.0
        }
        _save_to_inspection_history(test_entry)
        history = _load_inspection_history()
        self.assertGreaterEqual(len(history), 1)
        self.assertEqual(history[0]["analysis_id"], "CV-SCAN-TEST-001")

if __name__ == "__main__":
    unittest.main()
