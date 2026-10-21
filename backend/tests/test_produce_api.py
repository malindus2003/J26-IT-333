"""
Unit & Integration Tests for GreenPulse Produce Quality Assessment Endpoints
Tests:
- GET  /api/models/status
- POST /api/produce/analyze
- GET  /api/produce/history
- GET  /api/produce/{id}
"""

import os
import unittest
import numpy as np
import cv2
from fastapi.testclient import TestClient

from backend.app.main import app

class TestProduceAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.img_dir = os.path.join(cls.base_dir, "app", "data", "public_benchmarks", "fruit_freshness_images", "JPEGImages")

    def test_01_models_status_endpoint(self):
        """Verify /api/models/status returns 200 with operational model states."""
        resp = self.client.get("/api/models/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "online")
        self.assertTrue(data["readiness"]["model_a_species_identification"])
        self.assertTrue(data["readiness"]["model_b_spoilage_detection"])
        self.assertTrue(data["readiness"]["model_c_shelf_life_regression"])
        self.assertIn("Apple", data["supported_species"])
        self.assertEqual(data["produce_encyclopedia_commodities"], 47)

    def test_02_produce_analyze_clean_apple(self):
        """Verify /api/produce/analyze correctly identifies a clean benchmark apple and provides days RSL."""
        apple_path = os.path.join(self.img_dir, "1.jpg")
        with open(apple_path, "rb") as f:
            resp = self.client.post(
                "/api/produce/analyze",
                files={"file": ("apple.jpg", f.read(), "image/jpeg")},
                data={"category": "Fruits"}
            )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["identification"]["species"], "Apple")
        self.assertTrue(data["identification"]["is_supported"])
        self.assertEqual(data["spoilage"]["status"], "No visible spoilage detected")
        self.assertFalse(data["spoilage"]["mould_detected"])
        self.assertGreater(data["shelf_life"]["remaining_days"], 5.0)
        self.assertIn("days", data["shelf_life"]["days_prediction_interval"])

    def test_03_produce_analyze_unsupported_object_rejection(self):
        """Verify flat non-produce canvas is rejected as Unknown/Unsupported with 0% confidence."""
        gray_img = np.full((120, 120, 3), 128, dtype=np.uint8)
        _, enc = cv2.imencode(".jpg", gray_img)
        resp = self.client.post(
            "/api/produce/analyze",
            files={"file": ("blank.jpg", enc.tobytes(), "image/jpeg")}
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["identification"]["species"], "Unknown / Unsupported Produce")
        self.assertFalse(data["identification"]["is_supported"])
        self.assertEqual(data["identification"]["confidence"], 0.0)

    def test_04_produce_history_and_individual_lookup(self):
        """Verify /api/produce/history lists records and /api/produce/{id} retrieves specific record."""
        # 1. Fetch history
        resp = self.client.get("/api/produce/history?limit=10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("history", data)
        self.assertGreater(data["total_records"], 0)

        # 2. Lookup individual record
        first_id = data["history"][0]["analysis_id"]
        resp_single = self.client.get(f"/api/produce/{first_id}")
        self.assertEqual(resp_single.status_code, 200)
        single_data = resp_single.json()
        self.assertEqual(single_data["record"]["analysis_id"], first_id)

    def test_05_produce_analyze_sliced_watermelon(self):
        """Verify synthesized sliced watermelon is identified as Watermelon, not Apple or Strawberry."""
        img = np.full((256, 256, 3), 240, dtype=np.uint8)
        cv2.ellipse(img, (128, 128), (100, 100), 0, 0, 180, (40, 140, 30), thickness=-1)
        cv2.ellipse(img, (128, 128), (88, 88), 0, 0, 180, (50, 40, 220), thickness=-1)
        for pt in [(110, 150), (145, 145), (128, 170), (105, 175), (150, 175)]:
            cv2.circle(img, pt, 3, (15, 15, 15), -1)

        _, enc = cv2.imencode(".jpg", img)
        resp = self.client.post(
            "/api/produce/analyze",
            files={"file": ("watermelon.jpg", enc.tobytes(), "image/jpeg")},
            data={"category": "Fruits"}
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["identification"]["species"], "Watermelon")
        self.assertGreaterEqual(data["identification"]["confidence"], 75.0)


if __name__ == "__main__":
    unittest.main()
