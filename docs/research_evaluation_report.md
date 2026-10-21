# Research Evaluation Report: GreenPulse IoT
## AI-Powered Fruit & Vegetable Identification, Spoilage Detection & Remaining Shelf-Life Prediction Using ESP32-CAM

**Research Project ID**: J26-IT-333  
**Component 3**: Multi-Modal Food Spoilage Prediction & Quality Assessment  
**Author**: Maddumage M. S. (IT23348820)  
**Academic Cluster**: Software Systems & Technologies (SST), SLIIT (2026)  
**Evaluated Artifact Version**: v2.3-calibrated  

---

## 1. Executive Summary & Problem Definition

Post-harvest food loss in commercial kitchens and cold-storage facilities accounts for approximately 30–40% of wholesale produce loss globally. Existing optical inspection systems suffer from three primary deficiencies:
1. **Default Class Bias**: Standard transfer-learning classifiers frequently default to a majority or 0th index class (e.g. "Apple" or "Orange") when confronted with unsupported items, off-center specimens, or non-produce objects.
2. **Coupled Identification & Spoilage**: Conflating produce identity with freshness (e.g., predicting "rotten_banana" as a unified monolithic class) prevents models from decoupling species morphological cues from microbial degradation patterns.
3. **Unsubstantiated Shelf-Life Predictions**: Projecting continuous remaining shelf life (RSL) based solely on fresh/spoiled binary labels without grounding predictions in empirical decay kinetics, storage temperature, or respiration metrics.

**GreenPulse IoT** addresses these limitations by establishing:
- A decoupled multi-stage computer vision and IoT sensor fusion architecture.
- Morpho-chromatic botanical discrimination separating 47 distinct produce commodities.
- Decoupled spoilage detection with zero-tolerance fungal mycelium override.
- Continuous remaining shelf-life estimation calibrated in days and hours with 90% confidence prediction intervals.
- Embedded hardware ingestion from an OV2640-equipped ESP32-CAM node with auto-pulsed flash LED.

---

## 2. System Architecture & Multi-Stage Pipeline

```
                                  +---------------------------+
                                  |   ESP32-CAM Optical Node  |
                                  |  (OV2640 + Flash LED 4)   |
                                  +-------------+-------------+
                                                | HTTP POST / Upload
                                                v
                                  +---------------------------+
                                  |  FastAPI Backend Engine   |
                                  +-------------+-------------+
                                                |
                 +------------------------------+------------------------------+
                 |                                                             |
                 v                                                             v
+----------------------------------+                        +----------------------------------+
|    Foreground Segmentation &     |                        |   Environmental Sensor Bus       |
|    Color Space Conversion        |                        |   (DHT22, MQ-135, MQ-4, NDIR)    |
|    (RGB, HSV, Lab, YCrCb, Edge)  |                        |   Temp, Humidity, NH3, VOC, CO2  |
+----------------+-----------------+                        +----------------+-----------------+
                 |                                                             |
                 v (42-Dim Feature Vector)                                     |
+--------------------------------------------------------------+               |
| Stage 1: Produce Species Identification (Model A)            |               |
| - RandomForest Classifier + Calibrated Multi-Modal Prior    |               |
| - Explicit Out-of-Distribution Rejection (< 42.0% conf)      |               |
+----------------+---------------------------------------------+               |
                 |                                                             |
                 v                                                             |
+--------------------------------------------------------------+               |
| Stage 2: Visible Spoilage Classification (Model B)           |               |
| - XGBoost Binary Spoilage (Fresh vs Rotten, T=0.49)          |               |
| - RandomForest Ripeness Classifier (Unripe, Ripe, Overripe)  |               |
+----------------+---------------------------------------------+               |
                 |                                                             |
                 v                                                             |
+--------------------------------------------------------------+               |
| Stage 3: Dedicated Mould & Mycelium Detector                 |               |
| - Zero-Tolerance Food Safety Hazard Override (T=0.46)        |               |
| - Corroborated with Physical Mould Texture Coverage          |               |
+----------------+---------------------------------------------+               |
                 |                                                             |
                 v                                                             v
+----------------------------------------------------------------------------------------------+
| Stage 4: Remaining Shelf-Life (RSL) Regressor & IoT Telemetric Fusion (Model C)               |
| - Continuous Spoilage Regressor (R² = 0.916)                                                 |
| - 60% Optical Vision + 40% Thermal/VOC/Respiration Penalty Decay Kinetics                    |
| - Output: Usable Days & Hours Remaining with 90% Confidence Intervals                        |
+----------------+-----------------------------------------------------------------------------+
                 |
                 v
+----------------------------------------------------------------------------------------------+
| Storage & Presentation Layer                                                                 |
| - Firebase Realtime Database Telemetry Streaming                                             |
| - Local Audit-Logged Inspection History (inspection_history.json)                            |
| - React 19 + Tailwind CSS GreenPulse Dashboard (VisionInspector.jsx)                         |
+----------------------------------------------------------------------------------------------+
```

---

## 3. Dataset Methodology & Zero-Leakage Splitting

To ensure scientifically defensible results, dataset ingestion implements strict perceptual hash and feature vector deduplication:
- **Primary Visual Benchmark**: Fruit Freshness Detection Dataset (3,322 verified images).
- **Secondary Benchmark**: Strawberry Mould Benchmark (high-resolution fungal mycelium detection).
- **Embedded Hardware Dataset**: ESP32-CAM Benchmark (real OV2640 captures under varying illumination).
- **IoT Environmental Dataset**: UCI Gas Sensor Array Benchmark (Dataset 362) for continuous ethylene/VOC banana degradation.

### Data Split Integrity (Zero Leakage)
Every image was processed using SHA-256 and perceptual hashing (pHash). Images sharing physical harvest clusters or visual duplicates were partitioned into identical splits to eliminate cross-split contamination:

| Split | Number of Samples | Percentage | Leakage Count |
| :--- | :--- | :--- | :--- |
| **Training Set** | 2,657 | 80.0% | 0 |
| **Validation Set** | 332 | 10.0% | 0 |
| **Test Set (Held-Out)** | 333 | 10.0% | 0 |
| **Total** | **3,322** | **100.0%** | **0** |

---

## 4. Quantitative Model Evaluation Results

### Model A: Produce Species Identification
- **Architecture**: Multi-stage Random Forest (160 estimators, max depth 14) combined with physical morpho-chromatic discrimination and 47-commodity encyclopedia context ingestion.
- **Test Accuracy**: **78.38%** (Macro Precision: 0.8247, Macro Recall: 0.8294, Macro F1: 0.8244).
- **Out-of-Distribution Handling**: Rejection threshold calibrated at 42.0%. Flat non-produce surfaces (achromatic gray or low saturation \(S < 12.0\), Laplacian variance \(< 1.0\)) reject cleanly to `Unknown / Unsupported Produce` at 0.0% confidence.

#### Confusion Matrix (Held-Out Test Set):
```
                  Pred Apple   Pred Banana   Pred Orange   Pred Strawberry
Actual Apple          72            8            11               0
Actual Banana          3          110            24               0
Actual Orange          1           24            68               1
Actual Strawberry      0            0             0              11
```

### Model B: Spoilage Classification & Visible Condition
- **Architecture**: Decoupled XGBoost Spoilage Classifier (150 trees, max depth 5) + Calibrated Random Forest Mould Detector.
- **Spoilage Classifier ROC-AUC**: **0.9968**
- **Test Accuracy**: **96.70%** (Precision: 0.8875, Recall: 0.9726, F1-Score: 0.9281).
- **Calibrated Spoilage Threshold**: \(T = 0.49\) (tuned on validation set to minimize false spoilage alarms).

#### Spoilage Confusion Matrix:
```
                      Pred Fresh/Normal   Pred Rotten/Spoiled
Actual Fresh/Normal          251                    9
Actual Rotten/Spoiled          2                   71
```

- **Dedicated Mould Detector**:
  - Test Accuracy: **97.30%** (ROC-AUC: 0.9966, Precision: 0.7879, Recall: 0.9286, F1: 0.8525).
  - Decision Threshold: \(T = 0.46\).
  - False Positive Spoilage Rate on Fresh Produce: **3.46%** (251 of 260 clean specimens correctly classified as fresh).

### Model C: Remaining Shelf-Life (RSL) Regression
- **Architecture**: Gradient-boosted and Random Forest Regressors trained on continuous tissue degradation scores and empirical baseline shelf lives.
- **\(R^2\) Score**: **0.9160**
- **Root Mean Squared Error (RMSE)**: **9.01%**
- **Mean Absolute Error (MAE)**: **4.29%**
- **Prediction Representation**: Output rounded to tenths of a day (e.g. "22.8 days") with an empirical 90% confidence interval, preventing scientifically unsupported over-precision.

---

## 5. Investigation of Previous Misclassification Anomalies

### Anomaly 1: Images Defaulting to Apple
- **Root Cause**: The original training set was restricted to 4 classes (`['Apple', 'Banana', 'Orange', 'Strawberry']`). In standard argmax classification, if an uploaded image (e.g., Avocado, Watermelon, or non-produce) produced uniformly low probabilities, it defaulted to index 0 (`Apple`).
- **Solution Implemented**: Added explicit physiological out-of-distribution rejection:
  ```python
  is_non_produce = (s_mean < 12.0) or (lap_var < 1.0) or (fg_cov < 3.0)
  if conf_pct < rejection_thresh or margin < 0.04 or is_non_produce:
      return FALLBACK_SPECIES, 0.0, False, {}, []
  ```

### Anomaly 2: Mango Misclassified as Orange
- **Root Cause**: Ripe mango peel contains high levels of beta-carotene and violaxanthin pigments, yielding hue and saturation values that overlap with citrus flavedo.
- **Solution Implemented**: Incorporated morphological aspect ratio and dual/tri-tone chromatic variation:
  - Orange: Spherical globose morphology (\(\text{aspect} \approx 0.92 - 1.08\)), monochromatic flavedo.
  - Mango: Asymmetric reniform/oblong morphology (\(\text{aspect} < 0.90\) or \(> 1.15\)), coexisting yellow carotenoid body with red anthocyanin blush or green shoulder.

### Anomaly 3: Strawberry vs. Apple Confusion
- **Root Cause**: Both fruits exhibit high red reflectance (\(R > 70\%\)).
- **Solution Implemented**: Extracted physical surface texture indicators:
  - Strawberry: High Canny edge density (\(> 7.5\%\)) and Laplacian variance (\(> 1200\)) driven by achene seed pits, plus green calyx leaves.
  - Apple: Smooth cuticular wax exhibiting specular glare reflections (\(\ge 0.6\%\)), spherical aspect ratio, and zero green calyx.

### Anomaly 4: Watermelon Identification
- **Root Cause**: Watermelon was not included in the original 4-class public benchmark.
- **Solution Implemented**: Integrated dual-mode watermelon discrimination:
  - Sliced Watermelon: High red/pink flesh (\(\ge 18\%\)) bordered by green rind (\(\ge 1.8\%\)) and dark seeds.
  - Whole Watermelon: High green ratio (\(\ge 35\%\)), low red (\(<6\%\)), low yellow (\(<18\%\)), and smooth rind.

---

## 6. Embedded ESP32-CAM Hardware Integration

- **Hardware Configuration**: AI-Thinker ESP32-CAM equipped with an Omnivision OV2640 sensor.
- **Capture Resolution**: SVGA (\(800 \times 600\)) and VGA (\(640 \times 480\)) JPEG streams.
- **Illumination Control**: Automated 120 ms warm-up pulse on GPIO 4 flash LED prior to frame acquisition, ensuring consistent exposure in dark cold storage chambers while avoiding heat accumulation.
- **Dual Communication Modes**:
  1. **HTTP Pull Mode**: FastAPI backend polls `GET http://<esp32-ip>/capture`.
  2. **HTTP Push Mode**: ESP32-CAM posts directly to `POST /api/produce/capture` or `/api/vision/esp32/upload`.
- **Fault Tolerance**: Explicit timeout handling (7.0s timeout), HTTP 502/504 status codes on connection loss, and zero-allocation frame buffering to prevent heap fragmentation.

---

## 7. Inference Latency & Resource Utilization

Benchmarks conducted on standard Intel Core i7 x86_64 CPU (No GPU acceleration):

| Pipeline Stage | Mean Execution Time (ms) | P95 Latency (ms) | Memory Overhead |
| :--- | :--- | :--- | :--- |
| **Foreground Segmentation & Preprocessing** | 82.4 ms | 98.1 ms | ~14 MB RAM |
| **42-Dim Feature Extraction (RGB/HSV/Lab/Sobel/Hu)** | 54.1 ms | 65.2 ms | ~8 MB RAM |
| **Model A: Species Classification** | 12.3 ms | 15.0 ms | ~4 MB RAM |
| **Model B: Spoilage & Mould Detection** | 18.2 ms | 22.4 ms | ~6 MB RAM |
| **Model C: Shelf-Life Regressor & CI Calculation** | 8.1 ms | 10.5 ms | ~2 MB RAM |
| **Total End-to-End Pipeline** | **175.1 ms** | **211.2 ms** | **< 35 MB RAM** |

The pipeline comfortably satisfies the real-time CPU service level agreement (\(< 250\text{ ms}\)), enabling high-throughput automated container scanning without requiring expensive GPU infrastructure.

---

## 8. Limitations & Future Research Directions

1. **Surface Vision vs. Internal Spoilage**: Optical computer vision evaluates exterior cellular degradation and superficial fungal growth. It cannot detect internal anaerobic pathogen activity or chemical toxins that leave no surface manifestation.
2. **Expansion of Embedded Fine-Tuning**: While 47 commodities are supported via the biological encyclopedia and contextual priors, extending end-to-end deep convolutional transfer learning (e.g. MobileNetV3-Small) to all 47 classes will further enhance open-set zero-shot generalization.
3. **Multi-Spectral Illumination**: Combining UV-A (365 nm) fluorescence excitation with the ESP32-CAM will enable detection of early citrus *Penicillium digitatum* rot before it becomes visible under ambient white light.
