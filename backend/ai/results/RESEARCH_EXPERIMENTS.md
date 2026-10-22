# SLIIT IT4010 Research Project J26-IT-333
## Component 4: Smart Waste Bin — AI Food Waste Recognition Experiment Log

**Author / Researcher**: Pathirana P.R.T (`IT23324060`)
**Component**: Component 4 — Smart Waste Bin Identification and Monitoring
**Focus**: Deep Learning (YOLO) Multi-Class Food Waste Object Recognition

---

## 🎯 Target Food Waste Classes (nc = 7)

| Class ID | Canonical Name | Description & Visual Characteristics | Typical Restaurant Waste Source |
| :--- | :--- | :--- | :--- |
| **0** | `rice` | Cooked white/red rice, grain clumps | Plate leftovers, rice cooker bottom crust |
| **1** | `kottu` | Shredded godamba roti mixed with veg/meat/gravy | Overproduction, dining plate waste |
| **2** | `noodles` | Stir-fried / boiled wheat/rice noodles | Preparation waste, customer leftovers |
| **3** | `chicken` | Bones, cooked chicken meat trimmings, skin | Carcass de-boning, plate bones |
| **4** | `bread` | Slices, sandwich crusts, buns, rotti | Bakery surplus, stale breakfast bread |
| **5** | `whole_mango` | Whole spoiled / bruised unpeeled mango | Storage chilling injury, overripe fruit |
| **6** | `mango_peel` | Stripped mango skins, peel cuttings | Preparation line knife trimming |

---

## 🔬 Experimental Research Framework

To ensure scientific rigor, reproducibility, and academic integrity required for the SLIIT IT4010 Research Report and final viva:

1. **Academic Integrity Rule**:
   - Zero synthetic, fabricated, or simulated accuracy metrics.
   - Experiments are marked as `COMPLETED`, `FAILED`, or `NOT_YET_PERFORMED / BLOCKED`.
2. **Dataset Isolation**:
   - Training (70%), Validation (20%), and Testing (10%) splits are strictly independent.
   - Image capture sessions are isolated across splits to avoid spatial/temporal data leakage.
3. **Reproducibility Guarantee**:
   - Deterministic random seed (`seed = 42`).
   - Fixed hyperparameters, image resolution (640x640), and model checkpoints recorded in `experiments.json`.

---

## 📊 Experiment Registry & Tracking Table

| Exp ID | Date | Model Architecture | Pretrained Weights | Dataset Version | Image Target | Epochs | Batch | Imgsz | Device | Precision | Recall | F1 | mAP50 | Latency | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EXP-000** | 2026-10-18 | YOLOv8n (Pre-Flight) | `yolov8n.pt` | `v0.1-init` | 0 | 50 | 16 | 640 | CPU | N/A | N/A | N/A | N/A | N/A | **BLOCKED (0 Images)** |
| **EXP-001** | *Scheduled* | YOLOv8n (Baseline) | `yolov8n.pt` | `v1.0-roboflow` | 1,400–2,100 | 50 | 16 | 640 | GPU / CPU | *TBD* | *TBD* | *TBD* | *TBD* | *TBD* | **Awaiting Dataset** |
| **EXP-002** | *Scheduled* | YOLO11n (Comparison) | `yolo11n.pt` | `v1.0-roboflow` | 1,400–2,100 | 50 | 16 | 640 | GPU / CPU | *TBD* | *TBD* | *TBD* | *TBD* | *TBD* | **Awaiting Dataset** |
| **EXP-003** | *Scheduled* | YOLOv8s (Deeper Backbone)| `yolov8s.pt` | `v1.0-roboflow` | 1,400–2,100 | 60 | 8 | 640 | GPU / CPU | *TBD* | *TBD* | *TBD* | *TBD* | *TBD* | **Awaiting Dataset** |

---

## 📈 Engineering Targets for Acceptance

| Evaluation Metric | Target Threshold | Research Rationale |
| :--- | :--- | :--- |
| **Precision** | $\ge 85.0\%$ | Minimizes false positive billing/audit misclassifications |
| **Recall** | $\ge 80.0\%$ | Ensures majority of discarded scraps are captured |
| **F1-Score** | $\ge 82.0\%$ | Balanced harmonic mean for class-imbalanced trays |
| **mAP@0.5** | $\ge 85.0\%$ | Strict bounding box overlap with weighing plate contours |
| **Inference Latency** | $\le 2.0\text{ seconds}$ | Real-time feedback for kitchen and dining bus-boy stations |

---

## 🛠️ Instructions to Trigger Experiment Run

Once your annotated Roboflow dataset is placed in `backend/ai/datasets/food_waste/`:

```powershell
# 1. Validate dataset integrity
python ai/scripts/validate_dataset.py

# 2. Run training (automatically detects NVIDIA RTX GPU if available)
python ai/scripts/train_model.py --epochs 50 --batch 16 --name EXP-001-yolov8n

# 3. Run formal evaluation on held-out test split
python ai/scripts/evaluate_model.py --split test
```
