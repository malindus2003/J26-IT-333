# GreenPulse AI Spoilage & Freshness Model: Training & Acceptance Report

**Project**: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)  
**Component 3**: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment  
**Author**: Maddumage M. S. (IT23348820)  
**Date**: 2026-10-19 13:38:59  
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
| **Fresh-Produce False Positive Spoilage Rate** | **2.78%** | **7 / 252 fresh specimens** | **RESOLVED (Down from 96.7%)** |
| **Fresh-Produce Specificity / Accuracy** | **97.22%** | **245 / 252 fresh specimens** | **PASS** |
| **Rotten-Produce Recall / Detection Rate** | **95.65%** | **66 / 69 rotten specimens** | **PASS** |
| **Missed Spoilage Rate (False Negative)** | **4.35%** | **3 / 69 rotten specimens** | **PASS** |

### Per-Species Spoilage Confusion Breakdown

- **Apple**:
  - Fresh Test Specimens: 78 | False Positives: 2 (**2.56% FPR**)
  - Rotten Test Specimens: 14 | Detected Rot: 14 (**100.0% Recall**)

- **Banana**:
  - Fresh Test Specimens: 111 | False Positives: 2 (**1.8% FPR**)
  - Rotten Test Specimens: 31 | Detected Rot: 28 (**90.32% Recall**)

- **Orange**:
  - Fresh Test Specimens: 63 | False Positives: 3 (**4.76% FPR**)
  - Rotten Test Specimens: 24 | Detected Rot: 24 (**100.0% Recall**)

---

## 3. Produce Species Identification Model

- **Architecture**: `RandomForestClassifier(n_estimators=160, max_depth=14)`
- **Supported Classes**: Apple, Banana, Orange
- **Out-of-Distribution Handling**: Rejection threshold at 50.0% confidence, mapping unfamiliar inputs to `Unknown / Unsupported Produce`.

| Metric | Test Set Score |
| :--- | :--- |
| **Accuracy** | **75.39%** |
| **Macro Precision** | **0.7573** |
| **Macro Recall** | **0.7479** |
| **Macro F1-Score** | **0.7510** |

### Confusion Matrix (Species Classification)
```
Pred ->   Apple   Banana   Orange
Apple      70      11      11     
Banana     8       111     23     
Orange     3       23      61     
```

---

## 4. Visible Spoilage Classifier

- **Architecture**: `XGBClassifier(n_estimators=150, max_depth=5)`
- **Decision Threshold**: 0.41 (calibrated on held-out validation set)
- **ROC-AUC**: **0.9970**
- **Test Accuracy**: **96.88%**
- **Precision**: **0.9041**
- **Recall**: **0.9565**
- **F1 Score**: **0.9296**

### Confusion Matrix (Spoilage)
```
                    Pred Fresh   Pred Rotten
Actual Fresh/Normal     245          7           
Actual Rotten           3            66          
```

---

## 5. Ripeness Stage Classifier

- **Architecture**: `RandomForestClassifier(n_estimators=150, max_depth=10)`
- **Test Accuracy**: **94.39%**
- **Macro F1**: **0.9203**

---

## 6. Continuous Spoilage Severity Regressor

- **Architecture**: `RandomForestRegressor(n_estimators=150, max_depth=10)`
- **Objective**: Grounded physical estimation of tissue decay ($0 - 100\%$) based on foreground defect surface area and spoilage probability.

| Metric | Score |
| :--- | :--- |
| **$R^2$ Score** | **0.9440** |
| **RMSE** | **7.85%** |
| **MAE** | **3.32%** |

---

## 7. Defect Localization & CPU Latency

- **Defect Localization mIoU**: **38.11%**
- **CPU Inference Latency**: **122.72 ms** (P95: 149.07 ms)
- **Hardware Requirement**: 100% CPU Execution, no GPU dependency, fully compliant with real-time ESP32-CAM ingestion.
