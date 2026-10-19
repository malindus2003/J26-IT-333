# GreenPulse AI Spoilage & Freshness Model: Training & Acceptance Report

**Project**: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)  
**Component 3**: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment  
**Author**: Maddumage M. S. (IT23348820)  
**Date**: 2026-10-19 15:43:24  
**Model Version**: v2.3-calibrated  

---

## 1. Executive Summary & Root Cause Resolution

This report documents the retraining and validation of the GreenPulse computer vision pipeline following the comprehensive diagnosis of the fresh-as-spoiled failure.

### Root Causes Diagnosed & Resolved:
1. **Background / Highlight Contamination**: Previous heuristic mould detection used a global white/light mask (`v > 190, s < 40`), causing 30% to 75% of clean white plates and table backgrounds to be falsely counted as fungal mould mycelium.
2. **Hardcoded Override Removal**: Removed the arbitrary `if mould_detected: stage = "Spoiled"` rule that previously overrode the machine learning model even when the classifier predicted Fresh with 99.8% probability.
3. **Apple Anthocyanin Peel Correction**: Normal red apple peel was previously misclassified as enzymatic browning/necrosis. Browning is now calibrated strictly relative to species-specific baseline hues.
4. **Zero-Leakage Hash Partitioning**: Grouped images by perceptual hash clusters to eliminate data leakage between train, validation, and test sets.
5. **Decoupled Output Schema**: Separated Produce Identity, Ripeness Assessment, Visible Spoilage, and Localized Defect Types.

---

## 2. Dedicated Fresh-Produce False-Positive Evaluation (Key Acceptance Criterion)

| Metric | Score | Denominator / Sample Size | Status |
| :--- | :--- | :--- | :--- |
| **Fresh-Produce False Positive Spoilage Rate** | **3.46%** | **9 / 260 fresh specimens** | **RESOLVED (Down from 96.7%)** |
| **Fresh-Produce Specificity / Accuracy** | **96.54%** | **251 / 260 fresh specimens** | **PASS** |
| **Rotten-Produce Recall / Detection Rate** | **97.26%** | **71 / 73 rotten specimens** | **PASS** |
| **Missed Spoilage Rate (False Negative)** | **2.74%** | **2 / 73 rotten specimens** | **PASS** |

### Per-Species Spoilage Confusion Breakdown

- **Apple**:
  - Fresh Test Specimens: 76 | False Positives: 3 (**3.95% FPR**)
  - Rotten Test Specimens: 15 | Detected Rot: 15 (**100.0% Recall**)

- **Banana**:
  - Fresh Test Specimens: 107 | False Positives: 1 (**0.93% FPR**)
  - Rotten Test Specimens: 30 | Detected Rot: 28 (**93.33% Recall**)

- **Orange**:
  - Fresh Test Specimens: 69 | False Positives: 5 (**7.25% FPR**)
  - Rotten Test Specimens: 25 | Detected Rot: 25 (**100.0% Recall**)

- **Strawberry**:
  - Fresh Test Specimens: 8 | False Positives: 0 (**0.0% FPR**)
  - Rotten Test Specimens: 3 | Detected Rot: 3 (**100.0% Recall**)

---

## 3. Produce Species Identification Model

- **Architecture**: `RandomForestClassifier(n_estimators=160, max_depth=14)`
- **Supported Classes**: Apple, Banana, Orange, Strawberry
- **Out-of-Distribution Handling**: Rejection threshold at 50.0% confidence, mapping unfamiliar inputs to `Unknown / Unsupported Produce`.

| Metric | Test Set Score |
| :--- | :--- |
| **Accuracy** | **77.78%** |
| **Macro Precision** | **0.8364** |
| **Macro Recall** | **0.8283** |
| **Macro F1-Score** | **0.8309** |

### Confusion Matrix (Species Classification)
```
[[ 73  11   7   0]
 [  4 105  28   0]
 [  3  21  70   0]
 [  0   0   0  11]]
Classes: ['Apple', 'Banana', 'Orange', 'Strawberry']
```

---

## 4. Visible Spoilage Classifier

- **Architecture**: `XGBClassifier(n_estimators=150, max_depth=5)`
- **Decision Threshold**: 0.49 (calibrated on held-out validation set)
- **ROC-AUC**: **0.9968**
- **Test Accuracy**: **96.70%**
- **Precision**: **0.8875**
- **Recall**: **0.9726**
- **F1 Score**: **0.9281**

### Confusion Matrix (Spoilage)
```
                    Pred Fresh   Pred Rotten
Actual Fresh/Normal     251          9           
Actual Rotten           2            71          
```

---

## 4B. Dedicated Visible Mould Detector

- **Architecture**: `RandomForestClassifier(n_estimators=160, max_depth=12)`
- **Decision Threshold**: 0.46 (calibrated for zero false positives on fresh produce)
- **ROC-AUC**: **0.9966**
- **Test Accuracy**: **97.30%**
- **Precision**: **0.7879**
- **Recall**: **0.9286**
- **F1 Score**: **0.8525**

---

## 5. Ripeness Stage Classifier

- **Architecture**: `RandomForestClassifier(n_estimators=150, max_depth=10)`
- **Test Accuracy**: **94.89%**
- **Macro F1**: **0.9280**

---

## 6. Continuous Spoilage Severity Regressor

- **Architecture**: `RandomForestRegressor(n_estimators=150, max_depth=10)`
- **Objective**: Grounded physical estimation of tissue decay ($0 - 100\%$) based on foreground defect surface area and spoilage probability.

| Metric | Score |
| :--- | :--- |
| **$R^2$ Score** | **0.9160** |
| **RMSE** | **9.01%** |
| **MAE** | **4.29%** |

---

## 7. Defect Localization & CPU Latency

- **Defect Localization mIoU**: **38.11%**
- **CPU Inference Latency**: **173.58 ms** (P95: 200.70 ms)
- **Hardware Requirement**: 100% CPU Execution, no GPU dependency, fully compliant with real-time ESP32-CAM ingestion.
