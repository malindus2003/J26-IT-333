# Backend Model Loading Audit (Pilot v2 Retraining Verification)

**Component 4: AI & IoT-Based Smart Waste Bin**
**SLIIT IT4010 Research Project 2026 (Group J26-IT-333)**
**Audit Timestamp:** 2026-10-21

---

## 1. Executive Summary

This audit verifies whether the completion of the clean YOLO Pilot v2 retraining run affected the deployed backend application, altered runtime model weights, or changed environment configurations.

---

## 2. Model Loading Implementation Inspection

### Supporting Code Locations:
1. **Core Service**: `Research-/backend/app/services/food_detection_service.py`
   - Class: `FoodDetectionService`
   - Method: `_get_configured_weights_path()` (Lines 79–83):
     ```python
     def _get_configured_weights_path(self) -> Path:
         env_path = os.getenv("FOOD_WASTE_MODEL_PATH")
         if env_path:
             return Path(env_path).resolve()
         return self._default_weights_path.resolve()
     ```
   - Default Weights Definition (Line 57):
     ```python
     self._default_weights_path = self._backend_dir / "ai" / "models" / "best.pt"
     ```
   - Singleton Model Cache & Lazy Loading (Lines 85–98):
     ```python
     def load_model(self, force_reload: bool = False):
         with self._lock:
             if self._model is not None and not force_reload:
                 return self._model
             weights_path = self._get_configured_weights_path()
             if not weights_path.exists():
                 raise ModelNotAvailableError(...)
     ```

2. **API Endpoint**: `Research-/backend/app/api/endpoints/waste.py`
   - Endpoint: `POST /api/waste/detect`
   - Calls: `food_detection_service.detect_food(...)`
   - Exception Handling: Catches `ModelNotAvailableError` and returns `HTTP 503 Service Unavailable` with academic research notice.

---

## 3. Configuration & Environment Variable Audit

- **Environment Variable Checked**: `FOOD_WASTE_MODEL_PATH`
- **Audit Result**: `FOOD_WASTE_MODEL_PATH` is **NOT set** in `backend/.env` or system environment variables.
- **Configured Weights Path**: Points to the default location:
  `D:\SLIIT\Research\Research-\backend\ai\models\best.pt`

---

## 4. State Verification: Production Checkpoint Isolation

| Model Weight File | Timestamp on Disk | File Size | Status / Modification Policy |
| :--- | :---: | :---: | :--- |
| **`ai/models/best.pt`** | `2026-10-21 15:38` | 6,511,850 bytes | **UNCHANGED** (Preserved intact; NOT overwritten by Pilot v2) |
| **`ai/models/food-waste-yolo-pilot-v1_best.pt`** | `2026-10-21 15:38` | 6,511,850 bytes | **SUPERSEDED** (Preserved as historical audit artifact) |
| **`ai/models/food-waste-yolo-pilot-v2_best.pt`** | `2026-10-21 17:09` | 6,510,698 bytes | **ACTIVE PILOT V2** (Clean benchmark checkpoint trained from `yolov8n.pt`) |

### Critical Isolation Confirmations:
1. **No Overwrite**: `models/best.pt` was **not modified or replaced** during the Pilot v2 training run.
2. **Versioned Saving**: Pilot v2 weights were saved exclusively to `food-waste-yolo-pilot-v2_best.pt`.
3. **No Process Interruption**: No background backend, frontend, or IoT service was interrupted or restarted.

---

## 5. Distinction: Configured Path vs. Confirmed Loaded Runtime Model

- **Configured Checkpoint Path**: `D:\SLIIT\Research\Research-\backend\ai\models\best.pt`
- **Confirmed Loaded Runtime Model**: **Runtime verification unavailable**. At the time of this audit, no FastAPI or Uvicorn server processes were active in memory (`Get-Process` confirmed 0 running backend instances). Thus, no active server process had loaded weights into memory.
