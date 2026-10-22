# Backend Model Loading Audit

**Component 4: AI & IoT-Based Smart Waste Bin**
**SLIIT IT4010 Research Project 2026 (Group J26-IT-333)**
**Audit Timestamp:** 2026-10-21

---

## 1. Executive Summary

This audit inspects the backend application code, model loading mechanism, and environment configuration to determine whether the completion of the YOLO pilot training affected the deployed model or altered backend behavior.

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
   - Exception Handling: Catches `ModelNotAvailableError` and returns `HTTP 503 Service Unavailable` with academic notice.

---

## 3. Configuration & Environment Variable Audit

- **Environment Variable Checked**: `FOOD_WASTE_MODEL_PATH`
- **Audit Result**: `FOOD_WASTE_MODEL_PATH` is **NOT set** in `backend/.env` or the operating system environment.
- **Configured Weights Path**: Falls back to the default location:
  `D:\SLIIT\Research\Research-\backend\ai\models\best.pt`

---

## 4. State Before vs. After Training

| Attribute | State Before Pilot Training Run | State After Pilot Training Run |
| :--- | :--- | :--- |
| **`ai/models/best.pt` on disk** | **Did not exist** (Folder was empty) | **Created** (6.5 MB, copy of pilot checkpoint) |
| **`ai/models/food-waste-yolo-pilot-v1_best.pt`** | Did not exist | Created (6.5 MB, versioned pilot checkpoint) |
| **Backend API Response if queried** | Would raise `ModelNotAvailableError` (HTTP 503) | Would load `best.pt` and perform inference |
| **Was an existing deployed model overwritten?** | **NO** (No previous model weights existed on disk) | N/A |
| **Was a running backend process modified?** | **NO** (No Python/Uvicorn process was running during or after the audit) | N/A |

---

## 5. Distinction: Configured Path vs. Confirmed Loaded Runtime Model

- **Configured Checkpoint Path**: `D:\SLIIT\Research\Research-\backend\ai\models\best.pt`
- **Confirmed Loaded Runtime Model**: **Runtime verification unavailable**. At the time of this audit, no FastAPI or Uvicorn server processes were active in memory (`Get-Process` confirmed 0 running backend instances). Thus, no active server process had loaded weights into memory.
