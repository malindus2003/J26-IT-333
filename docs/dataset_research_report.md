# Public Dataset Research and Audit Report: Produce Identification, Quality, Spoilage, and Shelf-Life Prediction

**Project**: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)  
**Component 3**: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment  
**Author / Researcher**: Maddumage M. S. (IT23348820)  
**Date**: October 2026  
**Document Version**: 2.0 (Comprehensive Academic & Engineering Audit)  

---

## 1. Executive Summary & Objective

In food inventory management, postharvest supply chains, and commercial restaurant cold storage, automated visual assessment of fresh produce is critical for reducing perishable food waste, preventing microbial cross-contamination, and optimizing culinary usage before senescence. 

This document provides an exhaustive audit of publicly available computer vision and multi-modal sensory datasets relevant to:
1. **Produce Species Identification** (Fruits and vegetables across tropical and temperate varieties).
2. **Freshness & Ripeness Lifecycle Classification** (Categorizing stages: Unripe, Ripe/Optimal, Overripe, Spoiled/Rotten).
3. **Defect Detection & Localization** (Identifying surface blemishes, fungal sporulation, bruising, and necrosis with bounding boxes).
4. **Remaining Shelf-Life (RSL) Prediction** (Estimating residual usable shelf life in hours or days under varying environmental storage conditions).

---

## 2. Dataset Registry & Comparative Analysis Matrix

The table below summarizes the audited candidate datasets recorded in [`data/dataset_registry.csv`](file:///c:/Users/Asus/Desktop/PROJECTS/Research%20Project/data/dataset_registry.csv).

| ID | Dataset Name | Source / Institution | Scale / Modality | Annotations | License | Verification Status | Suitability & Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DS-01** | **Fruit Freshness Detection Dataset** | Public Research Benchmark | 3,202 images (JPEG), 9 classes | 3,202 Pascal VOC XMLs (7,087 bounding boxes) | Apache-2.0 | **Downloaded & Verified Locally** | **Primary benchmark for species classification, 3-tier freshness, and defect bounding box evaluation.** |
| **DS-02** | **Fresh and Rotten Fruits Dataset** | Mendeley Data (Sultana et al., 2022) | 3,200 images, 16 classes | Folder-level binary class (Fresh vs Rotten) | CC BY 4.0 | Audited Candidate | Baseline binary spoilage classification across 8 fruit species. |
| **DS-03** | **AgriFreshNET Freshness & Shelf-Life Dataset** | Mendeley Data (Risdin et al., 2024/2026) | 14,500 images, 24 produce classes | Categorical shelf-life intervals (1-4d, 4-7d, 8-12d, 24-35d) | CC BY 4.0 | Audited Candidate | Scientific anchor for shelf-life estimation bins and produce variety scaling. |
| **DS-04** | **Fruit Quality Detection** | Roboflow Universe (Defect Team, 2023) | 3,800 images, 4 classes | YOLOv8 / VOC bounding boxes (Good, Bruised, Rotten, Underripe) | CC BY 4.0 | Audited Candidate | High-resolution defect localization and surface blemish bounding box regression. |
| **DS-05** | **Fresh and Stale Fruits & Vegetables** | Kaggle (Food Aayush / Potdar, 2021) | 12,000+ images, 12 classes | Image-level + 10-day longitudinal progression | CC0 Public Domain | Audited Candidate | Longitudinal senescence tracking from day 1 (harvest) to day 10 (spoilage). |
| **DS-06** | **FruitVision Dataset** | Mendeley Data (Bijoy et al., 2025) | 10,154 images, 15 classes | Fresh, Rotten, Formalin-Adulterated classes | CC BY 4.0 | Audited Candidate | Multi-class visual degradation including chemical adulteration differentiation. |
| **DS-07** | **Roboflow Rotten-Fruit Aggregation** | Roboflow Universe Community | 22,000+ images, 8 classes | COCO / YOLO bounding boxes for mould, lesions, bruises | CC BY 4.0 / MIT | Audited Candidate | Multi-angle defect contour benchmarking and occlusion resilience. |
| **DS-08** | **Mendeley Mango Ripeness & Shelf-Life** | Mendeley Data (Altaf et al., 2023) | 4,500 images, 5 classes | 5 stages: Unripe, Semi-Ripe, Ripe, Overripe, Perished | CC BY 4.0 | Audited Candidate | Physiological kinetic baseline for 5-tier climacteric fruit ripening curves. |
| **DS-09** | **UCI Gas Sensor Array Spoilage Benchmark** | UCI Machine Learning Repository (Dataset 362) | 5,008 records, 8 MOX gas channels + T/RH | Continuous elapsed hours (0-72h) + volatile kinetics | CC BY 4.0 | **Downloaded & Verified Locally** | **Primary benchmark for multi-modal IoT sensor fusion (volatile resistance drop vs shelf-life).** |

---

## 3. Deep-Dive Audits of Candidate Datasets

### 3.1 Dataset DS-01: Fruit Freshness Detection Dataset (Local Verified Benchmark)
- **Origin**: Open-source postharvest food vision repository.
- **Local Directory**: `backend/app/data/public_benchmarks/fruit_freshness_images/`
- **Volume**: 3,202 verified JPEG images and 3,202 corresponding Pascal VOC XML annotation files.
- **Classes (9 Classes)**:
  - `fresh_apple` (705 images)
  - `normal_apple` (1,103 images)
  - `rotten_apple` (179 images)
  - `fresh_banana` (904 images)
  - `normal_banana` (1,356 images)
  - `rotten_banana` (781 images)
  - `fresh_orange` (737 images)
  - `normal_orange` (995 images)
  - `rotten_orange` (327 images)
- **Bounding Boxes**: 7,087 individual annotated bounding boxes specifying the exact `[xmin, ymin, xmax, ymax]` coordinates for foreground fruits and visible spoilage patches.
- **Licence**: Apache License 2.0 (Permissive, unrestricted commercial use, research distribution authorized).
- **Quality & Verification**:
  - Image resolutions range from $224 \times 224$ to $1024 \times 1024$ px.
  - Zero truncated or unreadable JPEG headers detected.
  - XML schemas conform strictly to Pascal VOC 2007/2012 specification.
- **Strengths**: Provides both species identity, freshness tier, and object localization bounding boxes.
- **Limitations**: Restricted to Apple, Banana, and Orange. Does not include continuous shelf-life timestamps.

### 3.2 Dataset DS-02: Fresh and Rotten Fruits Dataset (Mendeley Data)
- **DOI**: [10.17632/bdd69gyhv8.1](https://doi.org/10.17632/bdd69gyhv8.1)
- **Authors**: Sultana, N., et al. (2022)
- **Classes**: 16 classes covering Apple, Banana, Orange, Grape, Guava, Jujube, Pomegranate, Strawberry in Fresh vs Rotten configurations.
- **Licence**: CC BY 4.0.
- **Analysis**: Excellent for cross-fruit transfer learning and expanding produce species recognition, but lacks intermediate ripeness levels (Unripe, Optimal Ripe, Overripe) and provides no bounding box annotations.

### 3.3 Dataset DS-03: AgriFreshNET Freshness & Shelf-Life Dataset (Mendeley Data)
- **DOI**: [10.17632/42m5tb7yv9.1](https://doi.org/10.17632/42m5tb7yv9.1)
- **Authors**: Risdin, M., et al. (2024 / 2026 update)
- **Scale**: 14,500 images across 24 produce classes.
- **Shelf-Life Ground Truth**: Categorical shelf-life intervals recorded at ambient storage ($25^\circ\text{C}$):
  - Category A: 1–4 days (e.g., ripe berries, cut produce, senescent tomatoes)
  - Category B: 4–7 days (e.g., bananas, leafy greens)
  - Category C: 8–12 days (e.g., citrus, firm stone fruits)
  - Category D: 24–35 days (e.g., potatoes, onions, pumpkins, hardy apples)
- **Licence**: CC BY 4.0.
- **Analysis**: AgriFreshNET is pivotal because it confirms that **computer vision shelf-life estimation in literature is fundamentally interval-based rather than continuous down to minute-level resolution**. This validates formulating Remaining Shelf-Life (RSL) with prediction intervals ($\pm \sigma$).

### 3.4 Dataset DS-04: Fruit Quality Detection (Roboflow Universe)
- **Scale**: 3,800 images with bounding box annotations.
- **Defect Categories**: `good`, `bruised`, `rotten`, `underripe`.
- **Licence**: CC BY 4.0.
- **Analysis**: High utility for defect bounding box evaluation and multi-defect coexistence on a single specimen.

### 3.5 Dataset DS-05: Fresh and Stale Images of Fruits & Vegetables (Kaggle / Food Aayush)
- **Volume**: 12,000+ images covering 6 major classes (Apple, Banana, Bitter Gourd, Capsicum, Orange, Tomato).
- **Licence**: CC0: Public Domain.
- **Analysis**: Crucial for tracking gradual discoloration and surface wrinkling over 10 consecutive post-harvest days.

### 3.6 Dataset DS-08: Mendeley Mango Ripeness & Shelf-Life Dataset
- **DOI**: [10.17632/38v94f2zrg.1](https://doi.org/10.17632/38v94f2zrg.1)
- **Authors**: Altaf, M. A., et al. (2023)
- **Classes**: 5 discrete physiological stages (Unripe $\rightarrow$ Semi-Ripe $\rightarrow$ Fully Ripe $\rightarrow$ Overripe $\rightarrow$ Perished).
- **Shelf-Life Observation**: Demonstrates temperature dependence: shelf life of Chaunsa mango at $12^\circ\text{C}$ is $18.4 \pm 2.1$ days, dropping to $5.6 \pm 0.8$ days at $28^\circ\text{C}$. This empirical data anchors our temperature decay adjustment equations.

### 3.7 Dataset DS-09: UCI Gas Sensor Array Spoilage Benchmark (UCI Dataset 362)
- **Local File**: `backend/app/data/public_benchmarks/uci_banana_fruit_gas_sensor_benchmark.csv`
- **Volume**: 5,008 continuous time-series records across 8 metal-oxide MOX gas sensors ($R_1$ to $R_8$), ambient temperature, and relative humidity.
- **Physics**: As fruit decomposes, volatile reducing gases (ethylene, ethanol, ethyl acetate, ammonia) decrease sensor resistance.
- **Licence**: CC BY 4.0.
- **Role**: Validates multi-modal sensor fusion where visual inspection is cross-referenced with IoT headspace gas concentrations.

---

## 4. Key Scientific Findings & Data Limitations

1. **Absence of Microsecond Ground Truth**: No public dataset contains real-time, continuous hour-by-hour degradation curves across diverse produce. All published datasets either use discrete ripeness stages (Fresh, Ripe, Overripe, Rotten) or multi-day intervals (1-4d, 4-7d).
2. **Requirement for Calibrated Prediction Intervals**: Any AI model claiming deterministic remaining shelf-life (e.g. "exactly 37.42 hours") is fundamentally scientifically unsound. The system must present prediction intervals (e.g., "$36 \text{ hours} \pm 12 \text{ hours}$ at 90% confidence") grounded in postharvest biological baselines and visual defect severity.
3. **Ripeness vs. Spoilage Separation**: An overripe fruit (e.g., sugar-spotted banana) is physiologically safe for immediate culinary use (smoothies, baking), whereas a fresh fruit with localized fungal rot (*Penicillium digitatum*) is biologically hazardous. The model architecture must keep ripeness stage and defect severity conceptually and computationally distinct.
4. **Out-of-Distribution Rejection**: Models evaluated on finite produce classes must explicitly identify out-of-distribution inputs as `"Unknown / Unsupported Produce"` rather than forcing an inaccurate prediction with ungrounded confidence.

---

## 5. Summary of Data Pipeline Architecture

```mermaid
flowchart TD
    A["Raw Public Benchmark Images<br/>(3,202 JPEG + 3,202 XML Annotations)"] --> B["Data Validation & Cleansing<br/>(Corrupt Image Check, Schema Verification)"]
    B --> C["Label Standardization<br/>(Species: Apple/Banana/Orange/Unknown)<br/>(Freshness: Unripe/Ripe/Overripe/Spoiled)"]
    C --> D["Stratified Data Partitioning<br/>(Train 80% / Val 10% / Test 10%)"]
    D --> E["Multi-Domain Feature Extraction<br/>(Color Moments, LAB, GLCM Texture, Hu Moments, Defect Contours)"]
    E --> F["Model Training & Cross-Validation<br/>(Random Forest + XGBoost)"]
    F --> G["Evaluation on Unseen Test Split<br/>(Accuracy, Macro F1, IoU Bounding Box Overlap)"]
```
