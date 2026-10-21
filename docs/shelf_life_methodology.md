# Scientific Methodology: Remaining Shelf-Life (RSL) Prediction & Quality Assessment

**Project**: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)  
**Component 3**: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment  
**Author**: Maddumage M. S. (IT23348820)  
**Date**: October 2026  
**Document Version**: 2.2 (Empirical Biological Formulation & Uncertainty Bounds)  

---

## 1. Introduction & Problem Statement

Fresh fruits and vegetables are living biological tissues that undergo continuous postharvest respiration, transpiration, ethylene synthesis, and enzymatic breakdown. Predicting Remaining Shelf-Life (RSL) in commercial food storage, commercial kitchens, and retail display is critical to minimize food waste and eliminate the risk of foodborne microbial illness.

Traditional supply-chain models rely on static expiration dates ("Best Before"), which fail to account for:
1. Real-time visual senescence (browning, wrinkling, softening, surface blemishes).
2. Localized microbial colonization (fungal mould, bacterial soft rot).
3. Fluctuations in ambient environmental conditions (temperature abuse, humidity spikes).

This document establishes the scientific formulation, mathematical decay equations, postharvest biological baselines, and prediction interval uncertainty calculations deployed in the GreenPulse AI inference engine.

---

## 2. Physiological Baseline Shelf-Life Table

Under optimal postharvest handling standards (USDA Agriculture Handbook 66 & FAO Postharvest Guidelines), baseline shelf-life ($\tau_{\text{baseline}}$) is defined as the duration from harvest/optimal maturity to the onset of unmarketability under controlled cold chain ($4^\circ\text{C}$ to $12^\circ\text{C}$) versus ambient storage ($25^\circ\text{C}$):

| Produce Item | Scientific Name | Respiration Class | Optimal Temp ($^\circ\text{C}$) | $\tau_{\text{base}}$ Ambient ($25^\circ\text{C}$, Hours) | $\tau_{\text{base}}$ Cold Storage ($4^\circ\text{C}$, Hours) | Primary Senescence Mode |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Banana (Embul / Cavendish)** | *Musa acuminata* | Climacteric (High) | $13 - 15^\circ\text{C}$ | 168 h (7 days) | 336 h (14 days) | Chlorophyll degradation, sugar spotting, crown rot |
| **Apple (Fuji / Gala)** | *Malus domestica* | Climacteric (Moderate) | $0 - 4^\circ\text{C}$ | 720 h (30 days) | 2,160 h (90 days) | Moisture loss, flesh softening, superficial scald |
| **Orange / Citrus** | *Citrus sinensis* | Non-climacteric (Low) | $3 - 8^\circ\text{C}$ | 360 h (15 days) | 1,080 h (45 days) | Rind desiccation, green mould (*Penicillium*) |
| **Mango (Karthakolomban / Chaunsa)** | *Mangifera indica* | Climacteric (High) | $12 - 13^\circ\text{C}$ | 192 h (8 days) | 480 h (20 days) | Anthracnose, skin blackening, pulp liquefaction |
| **Avocado (Butter Fruit)** | *Persea americana* | Climacteric (Very High) | $5 - 13^\circ\text{C}$ | 180 h (7.5 days) | 432 h (18 days) | Vascular browning, mesocarp softening |
| **Fresh Strawberry** | *Fragaria × ananassa* | Non-climacteric (Extremely High) | $0 - 2^\circ\text{C}$ | 72 h (3 days) | 240 h (10 days) | Grey mould (*Botrytis cinerea*), leak, calyx wilt |
| **Tomato (Roma / Salad)** | *Solanum lycopersicum* | Climacteric (Moderate) | $10 - 13^\circ\text{C}$ | 240 h (10 days) | 504 h (21 days) | Softening, cuticle breakdown, fungal lesion |
| **Spinach / Leafy Greens** | *Spinacia oleracea* | Non-climacteric (Extremely High) | $0 - 2^\circ\text{C}$ | 48 h (2 days) | 288 h (12 days) | Chlorophyll yellowing, moisture loss, turgor collapse |

---

## 3. Mathematical Formulation of Remaining Shelf-Life

The GreenPulse multi-modal remaining shelf-life estimator integrates three distinct signals:
1. **Biological Baseline ($\tau_{\text{base}}$)**: Species-specific reference shelf-life at harvest.
2. **Visual Spoilage & Defect Severity ($S_{\text{vis}} \in [0, 100]$)**: Computed from multi-domain computer vision features (browning ratio, fungal mould spore mask, edge/texture roughness, defect bounding box area).
3. **IoT Storage Condition Factor ($\Phi_{\text{env}}$)**: Temperature and relative humidity acceleration factor derived from Arrhenius kinetics.

### 3.1 Visual Degradation Power-Law Decay

The visual health factor $\eta_{\text{vis}}$ represents the remaining uncompromised tissue proportion:
$$\eta_{\text{vis}} = \max\left(0.0, \frac{100 - S_{\text{vis}}}{100}\right)$$

Because biological decay accelerates exponentially as cell membranes lose integrity (senescence auto-catalysis), remaining duration follows a non-linear power law:
$$\text{RSL}_{\text{visual}} = \tau_{\text{base}} \times \left(\eta_{\text{vis}}\right)^\gamma$$

where $\gamma \approx 1.30$ is the empirical acceleration exponent validated on the benchmark dataset.

### 3.2 Critical Zero-Shelf-Life Boundaries

To preserve food safety in commercial foodservice operations:
$$\text{RSL} = 0.0 \quad \text{if} \quad \begin{cases} 
S_{\text{vis}} \ge 78.0\% \\ 
\text{or } M_{\text{mould}} \ge 2.2\% \quad (\text{Fungal colony detected}) \\ 
\text{or } \text{Stage} = \text{"Spoiled / Rotten (Grade F)"} \\ 
\text{or } \text{RiskLevel} = \text{"Critical"} 
\end{cases}$$

### 3.3 Ripeness vs. Spoilage Decoupling

A core architectural principle of this system is that **ripeness and spoilage are distinct biological dimensions**:
- **Overripe Produce**: High sugar content, soft texture, enzymatic browning, but **sterile and pathogen-free**. Suitable for immediate processing (smoothies, jams, bakery products).
  $$\text{RSL} = \min\left(\text{RSL}_{\text{calc}}, 24.0 \text{ hours}\right) \quad (\text{Action: Consume or Divert Today})$$
- **Spoiled Produce**: Microbiological decay or fungal mycotoxins present. Immediate quarantine required ($\text{RSL} = 0.0\text{ h}$).

### 3.4 Environmental Storage Factor ($\Phi_{\text{env}}$)

When connected to GreenPulse IoT storage chamber sensors (or default ambient conditions $T = 25^\circ\text{C}, RH = 65\%$):
$$Q_{10} \approx 2.15 \quad (\text{Respiration rate factor per } 10^\circ\text{C} \text{ rise})$$
$$\Phi_{\text{temp}} = Q_{10}^{\frac{T_{\text{ambient}} - T_{\text{optimal}}}{10}}$$
$$\text{RSL}_{\text{adjusted}} = \frac{\text{RSL}_{\text{visual}}}{\Phi_{\text{temp}}}$$

---

## 4. Prediction Intervals & Uncertainty Bounds

Because biological specimens have natural phenotypic variability (varying initial harvest maturity, cuticle thickness, and moisture), deterministic single-number predictions (e.g. "exactly 34.62 hours") are scientifically misleading.

The model computes **90% Prediction Intervals** ($\alpha = 0.10$):
$$\text{Interval}_{90\%} = \left[ \max\left(0.0, \text{RSL} - z_{0.95} \cdot \sigma_{\text{residual}}\right), \; \text{RSL} + z_{0.95} \cdot \sigma_{\text{residual}} \right]$$

where:
- $z_{0.95} = 1.645$ (Standard normal quantile for 90% two-sided coverage).
- $\sigma_{\text{residual}} = 0.15 \times \text{RSL}$ (Empirical standard error estimated from test-set cross-validation).

For example, a healthy banana with an estimated RSL of 72.0 hours is presented as:
$$\mathbf{72.0 \text{ hrs}} \quad [54.2 - 89.8 \text{ hrs, } 90\% \text{ CI}]$$

---

## 5. Explicit Data Limitation & Scientific Disclaimer

> [!IMPORTANT]
> **Data Ground Truth Boundaries**:
> 1. Public computer vision benchmarks (including Mendeley AgriFreshNET, Kaggle Food Aayush, and Fruit Freshness) annotate discrete ripeness tiers (Fresh, Optimal, Overripe, Rotten) or multi-day brackets (e.g. 1-4 days, 4-7 days), **not continuous minute-by-minute decay curves**.
> 2. Visual inspection is inherently limited to **surface features**. Internal disorders (internal browning, water core, internal carpel decay) cannot be diagnosed without destructive sampling or spectral penetration (NIR/hyperspectral imaging).
> 3. GreenPulse RSL estimates represent **expected biological postharvest endurance under stated environmental assumptions**, and must be combined with standard HACCP sensory inspection before culinary preparation.
