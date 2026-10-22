# Pilot Experiment Audit Summary & Evidence Assessment

**Component 4: AI & IoT-Based Smart Waste Bin**
**SLIIT IT4010 Research Project 2026 (Group J26-IT-333)**
**Audit Date:** 2026-10-21

---

## 1. Executive Summary

This audit assesses the dataset reconciliation, sequence-level data leakage controls, training execution, evaluation integrity, and backend model configuration for the Component 4 Food Waste YOLO pilot.

---

## 2. Confirmed Findings

### 2.1 Dataset Count Reconciliation (127 vs. 130 Images)
1. **Roboflow Remote State**:
   - The Roboflow project overview metadata header caches `images: 127` (`train: 100, valid: 19, test: 8`).
   - Querying individual asset records in the Roboflow database reveals **130 annotated images** (`train: 103, valid: 19, test: 8`) and 20 paused unannotated images (`bread`).
2. **The 3-Image Rejection in Roboflow Job Registry**:
   - Roboflow job registry inspection via `GET /jobs` confirmed the presence of Job `nr9NLRba5Dp6wYduUrXN`:
     - Name: `additional-mango_flesh - Auto Label`
     - Created by: `AUTOLABEL` | Reviewer: `runethpathirana@gmail.com`
     - `numImages: 3` | `rejected: 3` | `approved: 0` | Status: `review`
   - Simultaneously, 22 other jobs (`Job 2` through `Job 23`) for `additional-mango_flesh` were approved (`approved: 1`, Status: `complete`).
   - **Conclusion**: Exactly 22 mango flesh images were approved, and **3 mango flesh images were rejected during review in Roboflow**.
   - Because `food_waste_pilot_v1` was constructed from the local staging folder containing all 25 uploaded candidates, it contains:
     `105 (other approved) + 22 (approved flesh) + 3 (rejected flesh) = 130 images`.
3. **Exclusion of Deleted Image**:
   - `mango_peel_add_001.jpg` (`tpvVwf4dZ4MQzNdth2LL`) was deleted from Roboflow (`Image not found in dataset`).
   - Confirmed: `mango_peel_add_001.jpg` is **100% excluded** from `food_waste_pilot_v1`.

### 2.2 Leakage Auditing Forensics
- **Byte Deduplication**: Hash checks confirmed zero duplicate files across splits.
- **Capture Sequence Grouping**:
  - `chicken_plate_001`–`020` (20 cafeteria shots of the same plate): Kept **100% in Train**.
  - `mango_peel_wm_001`/`002` (tabletop peel spirals) & `mango_peel_add_002`–`005` (handheld garden burst): Kept **100% in Train**.
  - Bulacan mango flesh series (multiple angles of the same mango prep sessions): Kept **100% in Train**.
- **Assessment Consequence**:
  - Cross-split sequence leakage was completely eliminated.
  - As a necessary methodological trade-off, **`chicken` and `mango_peel` have 0 evaluation images** in Val and Test and are reported truthfully as **UNASSESSED**.

### 2.3 Training & Evaluation Integrity
- **Training Execution**: Pretrained `yolov8n.pt`, image size 640, batch 16, early stopping patience 20, random seed 42.
- **Hardware**: CPU (Intel Core i7-11800H), 65 epochs completed in 24.2 minutes (optimal checkpoint at Epoch 45).
- **Independence of Test Split**: The test split was completely untouched during training and model selection.
- **Held-Out Test Results**:
  - Precision: **79.75%** | Recall: **59.51%** | F1: **68.16%**
  - **mAP@0.5**: **72.39%** | **mAP@0.5:0.95**: **60.63%**
  - CPU Latency: **199.2 ms/image** (Exceeds the $\le 2000\text{ ms}$ requirement by 10x).
  - Standout Class: `noodles` achieved **mAP50: 99.50%**.

---

## 3. Unresolved Questions & Technical Limitations

1. **Roboflow REST API Job-to-Image Mapping**:
   - While the Roboflow job registry confirms that 3 images in `additional-mango_flesh` were rejected in Job `nr9NLRba5Dp6wYduUrXN`, Roboflow's public REST API does not expose the specific image ID list inside the job object (`/jobs/<id>/images` returns 404, and image detail endpoints do not contain `job_id`).
   - Consequently, the exact mapping of the 3 rejected images to filenames cannot be verified via public API endpoints alone, though sequential naming points to `add_001`, `add_024`, and `add_025`.
   - **Status**: Formally marked as **UNRESOLVED DISCREPANCY AT FILE LEVEL** due to Roboflow REST API schema limitations.

---

## 4. Usability Assessment of Existing Pilot Results

| Research Criterion | Pilot Usability Verdict | Justification |
| :--- | :---: | :--- |
| **IoT Pipeline & Architecture Validation** | **USABLE** | Successfully validates that YOLOv8n integrates with FastAPI, runs in <200ms on CPU, and reliably parses 7 waste classes. |
| **Leak-Free Baseline Protocol** | **USABLE** | Establishes the methodology for grouping capture bursts, ensuring future datasets avoid visual leakage. |
| **Final Conference Paper Publication** | **NOT USABLE AS FINAL** | Requires: (1) Purging the 3 rejected mango flesh images from the training split, (2) Capturing independent held-out evaluation samples for `chicken` and `mango_peel`, (3) Retraining with GPU acceleration on 300+ epochs. |
