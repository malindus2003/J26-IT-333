# Pilot v2 Experiment Audit Summary & Evidence Assessment

**Component 4: AI & IoT-Based Smart Waste Bin**
**SLIIT IT4010 Research Project 2026 (Group J26-IT-333)**
**Audit Date:** 2026-10-21

---

## 1. Executive Summary

This document presents the complete audit summary for **Pilot v2** of Component 4 (Food Waste Recognition). Following verification that 3 non-mango images were rejected during Roboflow review, the dataset was rebuilt from scratch, strictly requiring verified approved-image membership, resulting in exactly **127 approved images**. A clean retraining run was executed from base `yolov8n.pt`, and held-out test evaluation was conducted without test-set tuning.

---

## 2. Dataset Reconciliation (127 vs. 130 Images)

1. **Root Cause of v1 Discrepancy**:
   - Roboflow project overview displayed 127 approved images.
   - `food_waste_pilot_v1` contained 130 images because all 25 images uploaded in batch `additional-mango_flesh` were included.
   - User Roboflow screenshots confirmed that 3 of these were rejected during Roboflow review:
     - `mango_flesh_add_022.jpg` (Roboflow ID: `Y9zKWgkTBs5fE5ScUpR1`) — unapproved non-mango flesh (was in Train).
     - `mango_flesh_add_021.jpg` (Roboflow ID: `pUdpgXMLCnBtvkiTRKS2`) — unapproved non-mango flesh (was in Test).
     - `mango_flesh_add_006.jpg` (Roboflow ID: `lnEloSX4QCL6SwEB83EI`) — unapproved Mangifera foetida / non-standard flesh (was in Val).
2. **Reconciliation in Pilot v2**:
   - The 3 rejected images above were **completely purged** from all splits.
   - Deleted image `mango_peel_add_001.jpg` (`tpvVwf4dZ4MQzNdth2LL`) was **completely excluded**.
   - 20 paused `bread` images with 0 annotations were **completely excluded**.
   - Result: Exactly **127 verified approved images** across 7 active classes (371 bounding boxes).
3. **Split Distribution**:
   - **Train**: 95 images (74.8%), 324 bounding boxes
   - **Validation**: 18 images (14.2%), 22 bounding boxes
   - **Test**: 14 images (11.0%), 25 bounding boxes
   - **Dataset Validation**: Validated via `validate_dataset.py` with 0 errors, 0 warnings, and 0 duplicates.

---

## 3. Training & Evaluation Execution

1. **Retraining Setup**:
   - Base Model: `yolov8n.pt` (COCO pretrained weights; no fine-tuning from contaminated v1 checkpoint).
   - Hyperparameters: `imgsz=640`, `epochs=100`, `patience=20`, `seed=42`, `batch=16`.
   - Hardware: CPU (Intel Core i7-11800H @ 2.30GHz, 8 cores / 16 threads, 16 GB RAM).
   - Execution: Stopped early at **Epoch 56** (24.3 minutes); optimal checkpoint selected at **Epoch 36** based strictly on validation performance.
2. **Checkpoint Isolation**:
   - Versioned Checkpoint: Saved to `backend/ai/models/food-waste-yolo-pilot-v2_best.pt` (6.5 MB).
   - Production Checkpoint: `backend/ai/models/best.pt` was **NOT overwritten**.
3. **Held-Out Test Results (14 Images / 25 Bounding Boxes)**:
   - **Overall Precision**: **70.30%**
   - **Overall Recall**: **66.96%**
   - **Overall F1-Score**: **68.59%**
   - **mAP@0.5**: **71.58%**
   - **mAP@0.5:0.95**: **62.30%** (improved over v1's 60.63%)
   - **CPU Inference Latency**: **187.89 ms / image** (well within the $\le 2000\text{ ms}$ real-time smart bin requirement).

---

## 4. Per-Class Test Breakdown & Comparison with Pilot v1

| Class Name | v1 Test mAP@50 | v2 Test mAP@50 | v1 Test mAP@50-95 | v2 Test mAP@50-95 | v2 Test Samples | Impact & Assessment Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`noodles`** | 99.50% | **99.50%** | 86.86% | **86.86%** | 3 images / 3 boxes | Excellent distinctive texture separability. |
| **`mango_flesh`** | 64.49% | **94.41%** | 60.92% | **86.30%** | 3 images / 7 boxes | **+29.92% mAP50 jump** due to purging non-mango `add_021.jpg` from test! |
| **`whole_mango`** | 76.08% | **72.04%** | 61.46% | **57.77%** | 2 images / 3 boxes | Stable; occasional rim-of-plate false positives. |
| **`kottu`** | 70.88% | **69.52%** | 56.40% | **54.99%** | 2 images / 2 boxes | High recall (100%), but low precision due to background confusion. |
| **`rice`** | 51.01% | **22.45%** | 37.52% | **25.59%** | 4 images / 10 boxes | High precision (82.9%), low recall (10.0%) on scattered grains. |
| **`chicken`** | UNASSESSED | **UNASSESSED** | UNASSESSED | **UNASSESSED** | 0 images / 0 boxes | Locked in Train to prevent cafeteria burst sequence leakage. |
| **`mango_peel`** | UNASSESSED | **UNASSESSED** | UNASSESSED | **UNASSESSED** | 0 images / 0 boxes | Locked in Train to prevent garden peel burst sequence leakage. |

---

## 5. Methodological Analysis & Explanations

### 5.1 Explanation of Threshold Differences Between Metrics and Plots
- **Area-Under-Curve Integration (`model.val()`)**: The metrics table reports mAP calculated by integrating precision across recall at all possible confidence thresholds ($	ext{conf} \approx 0.001$ to $1.0$).
- **Fixed Operating Threshold for Plots ($	ext{conf} = 0.25$)**: The confusion matrix and prediction sample plots operate at a fixed threshold of 0.25. Faint or scattered items (such as small rice grains) produce confidence scores between 0.05 and 0.20; while they register along the PR curve, they fall below 0.25 and appear as background misses in the confusion matrix.

### 5.2 Truthful Reporting of Limitations
- **Sequence Containment Trade-off**: `chicken_plate_001`–`020` and `mango_peel_add_002`–`005` were isolated completely in Train. Therefore, `chicken` and `mango_peel` have 0 evaluation images and are reported truthfully as **UNASSESSED**.
- **No Overclaiming**:
  - We do **NOT** claim zero class confusion: `kottu` and `whole_mango` experience background false positives on plate rims.
  - We do **NOT** claim proven edge-device performance: tests were conducted on an Intel Core i7 host CPU, not an embedded ARM/Raspberry Pi device.
  - We do **NOT** claim complete leakage elimination across the entire web dataset: only documented capture sequences and exact file duplicates were isolated.
