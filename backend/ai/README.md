# Component 4: AI-Based Food Waste Recognition Subsystem
## SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

**Project Title**: AI & IoT-Based Smart Restaurant Management System for Food Waste Prediction and Operational Optimization
**Research Component**: Component 4 — Smart Waste Bin Identification and Monitoring
**Lead Researcher**: Pathirana P.R.T (`IT23324060`)
**University**: Sri Lanka Institute of Information Technology (SLIIT)

---

## 📌 1. AI Subsystem Architecture

The Food Waste Optical Recognition subsystem deploys a custom **Ultralytics YOLO (You Only Look Once)** object detector above the Smart Waste Bin weighing tray. It recognizes discarded food items in real-time, extracts multi-object bounding boxes, and correlates visual recognition with IoT load-cell measurements to compute exact physical and financial food waste loss.

```
       ┌────────────────────────┐
       │   RGB Camera / Phone   │ (Top-down view of weighing plate)
       └───────────┬────────────┘
                   │ Image Frame / Multipart Upload
                   ▼
       ┌────────────────────────┐
       │ FastAPI Backend Server │ (Port 8000)
       │  POST /api/waste/      │
       │       classify         │
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌──────────────────┐ ┌──────────────────────────────────────┐
│ Validation Layer │ │ FoodDetectionService (Singleton)     │
│ • Max Size (10MB)│ │ • Cached YOLO Architecture (best.pt) │
│ • MIME Check     │ │ • Canonical 7-Class Remapping        │
│ • PIL RGB Buffer │ │ • Latency & Box Coordinate Scaler    │
└──────────────────┘ └──────────────────┬───────────────────┘
                                        │ JSON Predictions
                                        ▼
                   ┌────────────────────────────────────────┐
                   │ React + Vite Interactive UI (Port 5173)│
                   │ • Bounding Box Overlay on Canvas       │
                   │ • Confidence Badge & Class Tags        │
                   │ • Manual Confirmation / Correction     │
                   └────────────────────┬───────────────────┘
                                        │ Audit / Feedback
                                        ▼
                   ┌────────────────────────────────────────┐
                   │ Active Learning Dataset Archive        │
                   │ results/manual_corrections.json        │
                   └────────────────────────────────────────┘
```

---

## 🐍 2. System Requirements & Python Environment

- **Python**: `3.10` to `3.14` (Verified working with Python 3.14.4 on Windows x64)
- **Deep Learning Framework**: PyTorch `2.14.1` + Torchvision `0.29.1`
- **YOLO Framework**: Ultralytics `8.4.181`
- **Hardware Acceleration**:
  - NVIDIA CUDA GPU (e.g. RTX 2050 / RTX 3060 / A100) auto-detected when available.
  - Automatic CPU fallback for development laptops without a dedicated GPU.

---

## 📦 3. Dependency Installation

Activate the project virtual environment and install backend requirements:

```powershell
# From the backend directory:
cd backend

# Ensure pip is up to date
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Core dependencies installed:
- `ultralytics>=8.0.0`
- `torch>=2.0.0`
- `torchvision>=0.15.0`
- `fastapi>=0.110.0`
- `uvicorn[standard]>=0.28.0`
- `pillow>=10.2.0`
- `matplotlib>=3.3.0`
- `pytest>=8.0.0`

---

## 🏷️ 4. Canonical Food Waste Classes (nc = 7)

The model detects exactly 7 canonical Sri Lankan restaurant food waste categories:

| Class ID | Canonical Label | Description | Typical Kitchen Source |
| :---: | :--- | :--- | :--- |
| **0** | `rice` | Cooked white or red rice grains and clumps | Customer dining plate waste, buffet pans |
| **1** | `kottu` | Shredded godamba roti mixed with gravy/meat | Leftovers, overcooked order batches |
| **2** | `noodles` | Stir-fried / boiled wheat or rice noodles | Preparation excess, customer leftovers |
| **3** | `chicken` | Bones, carcass trimmings, cooked chicken meat | Kitchen butchery scraps, dining plates |
| **4** | `bread` | Slices, toast crusts, burger buns, roast paan | Stale bakery stock, breakfast buffet |
| **5** | `whole_mango` | Whole spoiled, bruised, or damaged mangoes | Chiller cold injury, overripe storage |
| **6** | `mango_peel` | Stripped mango skins and trimming peelings | Kitchen dessert / chutney prep station |

---

## 🗂️ 5. Dataset Structure & Roboflow Import

### Expected Directory Layout

```text
backend/ai/datasets/food_waste/
├── data.yaml
├── images/
│   ├── train/      # ~70% of images
│   ├── val/        # ~20% of images
│   └── test/       # ~10% of images (held-out)
└── labels/
    ├── train/      # Matching .txt files
    ├── val/
    └── test/
```

### Importing from Roboflow

1. Export your dataset from Roboflow in **YOLOv8** format (`.zip`).
2. Run the automated import utility:

```powershell
# From the backend directory:
.\.venv\Scripts\python.exe ai\scripts\import_roboflow_dataset.py --source "C:\Path\To\Roboflow_Export.zip"
```

The script automatically:
- Unpacks training, validation, and testing splits.
- Re-maps source class names/IDs to canonical IDs `0..6`.
- Strips corrupt annotations and ensures normalized YOLO bounding box coordinates `[0, 1]`.

---

## 🔍 6. Dataset Validation

Before training, always verify dataset integrity:

```powershell
.\.venv\Scripts\python.exe ai\scripts\validate_dataset.py
```

Checks conducted:
1. Image readability and corruption detection using PIL `Image.verify()`.
2. Missing `.txt` annotation files.
3. Invalid class IDs (must be in range `0..6`).
4. Bounding box coordinates out of bounds ($xc, yc, w, h \notin [0, 1]$).
5. Duplicate image identification across splits using SHA-256 hashes.
6. Class distribution and imbalance analysis.
7. Saves report to `backend/ai/results/dataset_validation_report.json`.

---

## 🚀 7. Model Training Procedure

```powershell
# From the backend directory:
.\.venv\Scripts\python.exe ai\scripts\train_model.py `
    --data ai/datasets/food_waste/data.yaml `
    --weights yolov8n.pt `
    --epochs 50 `
    --batch 16 `
    --imgsz 640 `
    --patience 10 `
    --name EXP-001-yolov8n
```

### Academic Integrity Rules
- The training script **strictly enforces pre-flight validation**. If `images/train` contains 0 images, it halts and logs `BLOCKED_PENDING_DATASET` in `experiments.json`.
- When training completes, the best checkpoint is automatically preserved at:
  ```
  backend/ai/models/best.pt
  ```

---

## 📊 8. Model Evaluation Procedure

Evaluate the trained model on the held-out test split:

```powershell
.\.venv\Scripts\python.exe ai\scripts\evaluate_model.py --split test --imgsz 640
```

The evaluation suite outputs:
- **Precision**, **Recall**, and **F1-Score**.
- **mAP@0.5** and **mAP@0.5:0.95**.
- **Per-class performance breakdown table**.
- **Average inference latency** (ms/image).
- Exports formatted results to:
  - `ai/results/evaluations/evaluation_report.json`
  - `ai/results/evaluations/evaluation_metrics.csv`

### Engineering Acceptance Targets
- Precision: $\ge 85.0\%$
- Recall: $\ge 80.0\%$
- F1-Score: $\ge 82.0\%$
- mAP@0.5: $\ge 85.0\%$
- Inference Latency: $\le 2.0\text{ seconds}$

---

## 🧪 9. Local Image Prediction (CLI)

Test YOLO recognition directly from the command line:

```powershell
.\.venv\Scripts\python.exe ai\scripts\predict_image.py --image "C:\Path\To\food_sample.jpg" --conf 0.25
```

Reports:
- Recognized food items.
- Confidence scores.
- Bounding-box coordinates $(x_1, y_1, x_2, y_2)$.
- Inference latency.

---

## 🌐 10. FastAPI Endpoints & Contract

### 1. `POST /api/waste/classify`
Uploads an RGB image for object detection.

**Request**: Multipart form-data with key `file` (image binary).
**Query Parameters**:
- `confidence`: float (default `0.25`, range `0.01` to `1.0`)
- `imgsz`: int (default `640`)

**Sample 200 OK Response**:
```json
{
  "success": true,
  "model_version": "food-waste-yolo-v1",
  "detections": [
    {
      "class_id": 0,
      "class_name": "rice",
      "confidence": 0.9412,
      "bounding_box": {
        "x1": 120.5,
        "y1": 80.0,
        "x2": 320.0,
        "y2": 280.5
      }
    }
  ],
  "inference_time_ms": 142.3,
  "total_detected": 1,
  "image_dimensions": {
    "width": 640,
    "height": 480
  }
}
```

**Status Codes**:
- `200 OK`: Inference successful.
- `400 Bad Request`: Empty image, unsupported format, or corrupt data.
- `413 Payload Too Large`: Image exceeds 10MB limit.
- `503 Service Unavailable`: Model weights (`best.pt`) not yet trained (academic integrity protection).

### 2. `GET /api/waste/ai/status`
Returns status of loaded weights, device (CUDA/CPU), and canonical class dictionary.

### 3. `POST /api/waste/corrections`
Submits kitchen operator feedback (`status: 'confirmed'` or `status: 'corrected'`).
Permanently logs to `backend/ai/results/manual_corrections.json`.

---

## 💻 11. Frontend Testing & USB Camera Integration

1. Start Backend:
   ```powershell
   cd backend
   .\.venv\Scripts\python.exe run.py
   ```
2. Start Frontend:
   ```powershell
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.
4. Navigate to **Smart Waste Bin** (`activeModule: 'waste'`).
5. Use the **AI Food Waste Optical Recognition Subsystem** card:
   - **Upload Image**: Select an image file.
   - **Use USB / Web Camera**: Opens local webcam/USB camera feed via HTML5 `getUserMedia`. Click **Capture Waste Frame**.
   - Adjust the **Confidence Slider** as required.
   - Click **Detect Food Waste**.
   - Bounding boxes appear dynamically over the photo.
   - Use the **Confirm** or **Correct Class...** buttons to audit the prediction.

---

## 🧪 12. Automated Tests Execution

Run the complete test suite:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest tests/test_waste_ai.py -v
```

All 19 test cases verify:
- Dataset validation logic
- Image format validation
- Error handling (empty file, invalid MIME, missing weights)
- Mocked inference contract serialization
- Canonical 7-class integrity
- Backwards compatibility with `/api/waste/metrics` and recycling endpoints.

---

## ⚠️ 13. Common Troubleshooting & Notes

1. **"Trained model weights (best.pt) not found" (HTTP 503)**:
   - This is by design when custom training has not yet completed.
   - Provide an annotated dataset in `backend/ai/datasets/food_waste/` and run `train_model.py`.
2. **CUDA not detected**:
   - The system automatically falls back to CPU execution without throwing errors.
   - If you have an NVIDIA GPU, verify drivers using `nvidia-smi` and ensure PyTorch was installed with CUDA enabled.
3. **Camera permission denied**:
   - Modern browsers require HTTPS or `localhost` for webcam access (`navigator.mediaDevices.getUserMedia`). Make sure you access the dashboard on `http://localhost:5173`.
