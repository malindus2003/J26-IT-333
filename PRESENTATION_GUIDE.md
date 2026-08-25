# SLIIT IT4010 Research Proposal Presentation Master Guide

**Project Title**: AI & IoT-Based Smart Restaurant Management System for Food Waste Prediction and Operational Optimization  
**Research Cluster**: SST - Software Systems & Technologies (Group J26-IT-333)  
**Total Assessment Time**: 40 Minutes  

---

## ⏱️ Official 40-Minute Time Budget Breakdown

```
 ┌───────────────────────┬────────────┬────────────────────────────────────────────────────────┐
 │ Phase                 │ Time       │ Content / Responsibility                               │
 ├───────────────────────┼────────────┼────────────────────────────────────────────────────────┤
 │ 1. Intro Video        │ 2 mins     │ Group Teaser & Problem Statement Video                 │
 │ 2. Intro Speech       │ 3 mins     │ Evaluator-selected team member introduces project      │
 │ 3. Component 1        │ 4 mins     │ Nanayakkara K.A.J.Y (Food Demand Prediction)           │
 │ 4. Component 2        │ 4 mins     │ Pahesara H.H.D.S (Kitchen Efficiency & Staffing)       │
 │ 5. Component 3 (YOU)  │ 4 mins     │ Maddumage M. S (Food Spoilage & Quality Assessment)    │
 │ 6. Component 4        │ 4 mins     │ Pathirana P.R.T (Smart Waste Bin & Categorization)     │
 │ 7. Wrap-Up Speech     │ 2 mins     │ Closed-loop integration summary & future milestones    │
 │ 8. Evaluator Q&A      │ 12 mins    │ Technical defence & algorithmic justification          │
 │ 9. Marking            │ 5 mins     │ Evaluators panel scoring                               │
 └───────────────────────┴────────────┴────────────────────────────────────────────────────────┘
```

---

## 🎙️ Section 1: In Case You Are Chosen for the 3-Minute Group Intro (0:00 – 3:00)

> *"Good morning respected evaluators and panel members. Today, my team and I present our research project: **An AI & IoT-Based Smart Restaurant Management System for Food Waste Prediction and Operational Optimization**.*
>
> *Every year, the restaurant and hospitality industry loses over 1.3 billion tons of food globally, with SME commercial kitchens suffering up to 30% direct financial loss due to three interconnected operational failures:*
> 1. *Inaccurate meal demand forecasting leading to over-preparation.*
> 2. *Unmonitored cold storage environments causing premature microbial spoilage.*
> 3. *A lack of automated waste categorization and kitchen line bottleneck optimization.*
>
> *Existing solutions in the market operate in silos—isolated inventory apps or standalone temperature loggers. Our novelty is a **Unified Closed Feedback Loop Ecosystem** divided across 4 research pillars:*
> - *Demand Prediction by Nanayakkara K.,*
> - *Kitchen & Staff Optimization by Pahesara H.,*
> - *Multi-Modal Food Spoilage Prediction by myself, Maddumage M., and*
> - *IoT Smart Waste Bin Monitoring by Pathirana P.*
>
> *Let us now dive into each component."*

---

## 🎙️ Section 2: Your Exact 4-Minute Component 3 Presentation Script

### ⏱️ Timestamp Breakdown (Total 240 Seconds)
- **Minute 0:00 – 0:45 (45s)**: Research Problem, Gap & Objective for Spoilage
- **Minute 0:45 – 1:45 (60s)**: Proposed Multi-Modal Methodology (IoT + Computer Vision)
- **Minute 1:45 – 3:00 (75s)**: Live Dashboard Demo (Camera Scanner, Color Slider, 5 Categories)
- **Minute 3:00 – 4:00 (60s)**: Novelty, ML Architecture & Closed Loop Value

---

### 📄 Slide-by-Slide Spoken Script

#### 🪧 Slide 1: Research Problem & Objective (0:00 – 0:45)
> *"Thank you. I am **Maddumage M. S**, presenting **Component 3: AI-Based Multi-Modal Food Spoilage Prediction and Quality Assessment**.*
>
> *In commercial restaurant cold storage, relying on static printed expiry dates fails because real perishable decay depends dynamically on micro-climates and biochemical reactions. Traditional optical-only systems fail to detect internal bacterial decomposition, while standalone temperature loggers cannot visually inspect surface mould or ripeness stages.*
>
> *My research objective is to develop a **Multi-Modal Early Spoilage & Quality Assessment Engine** that fuses real-time IoT environmental gas telemetry with optical Computer Vision to predict remaining shelf-life in hours and classify perishables across 4 distinct risk tiers."*

---

#### 🪧 Slide 2: Multi-Modal Fusion Methodology & Dataset (0:45 – 1:45)
> *"Our methodology addresses **5 perishable categories**: Fruits, Vegetables, Dairy, Fish & Seafood, and Meat & Poultry.*
>
> *It combines two sensory modalities:*
> 1. ***IoT Hardware Sensor Stream**: Using ESP32 microcontrollers deployed in cold storage containers tracking Temperature, Relative Humidity, Ammonia ($\text{NH}_3$) for protein breakdown, Carbon Dioxide ($\text{CO}_2$) for cellular respiration, and Total Volatile Organic Compounds (VOC) for ethylene gas.*
> 2. ***Computer Vision Inspection**: Deep CNNs (YOLOv8/ResNet) analyze photographic container images to detect surface discoloration, fungal mould colonies (*Botrytis*), and tissue softening.*
>
> *These heterogeneous features are fused into a **Random Forest and XGBoost Multi-Modal Regression & Classification pipeline** to compute precise shelf-life hours ($R^2 > 0.94$) and categorize items into Low, Medium, High, or Critical risk."*

---

#### 🪧 Slide 3: Live Dashboard Demonstration (1:45 – 3:00)
*(Screen switch to your live React Dashboard at `http://localhost:5173`)*

> *"As demonstrated on our live interactive dashboard:*
> - *Under our **Container Camera Scanner**, the system processes high-resolution photographic inspections. For example, selecting this **Mouldy Strawberry** crate immediately generates on-photo bounding boxes flagging active fungal mycelium patches and displays a **92% Critical Risk** status.*
> - *Our **4-Stage Lifecycle Progression Bar** tracks items from `Stage 1: Unripe (Firm)` ➔ `Stage 2: Optimal Ripe` ➔ `Stage 3: Overripe (Wilted)` ➔ `Stage 4: Spoiled (Rotten)`.*
> - *Using our **Dynamic Color-Coded Simulation Slider**, we can test the entire decay spectrum from Green (Low Risk) to glowing Amber and Red.*
> - *Under **IoT Telemetry**, continuous 24-hour time-series trends track gas concentrations across all 5 cold zones.*
> - *Finally, our **Batch Matrix** provides kitchen staff with FIFO culinary recommendations—such as immediately converting overripe bananas into pastry baking before spoilage occurs."*

---

#### 🪧 Slide 4: Scientific Novelty & Research Impact (3:00 – 4:00)
> *"The key scientific contributions of this research are:*
> 1. ***Cross-Modal Sensor Fusion**: Overcoming single-modality blind spots by combining non-invasive gas detection with optical diagnostics.*
> 2. ***Multi-Category Generalizability**: Tailored biochemical degradation thresholds across fruits, vegetables, dairy, fish, and meat.*
> 3. ***Actionable Closed-Loop Integration**: High-risk spoilage predictions are directly transmitted to Component 1 (Demand) and Component 2 (Kitchen) to prioritize ingredient consumption.*
>
> *Thank you. I now hand over to Pathirana P. for Component 4."*

---

## 🎙️ Section 3: In Case You Are Chosen for the 2-Minute Team Wrap-Up (36:00 – 38:00)

> *"In conclusion, our research project delivers an end-to-end, closed-loop operational intelligence platform for commercial restaurant kitchens:*
> - *Component 1 accurately forecasts what to order and prepare.*
> - *Component 2 optimizes kitchen stations and staff workflow during peak shifts.*
> - *Component 3 monitors cold storage in real time to prevent ingredient spoilage.*
> - *Component 4 tracks post-consumer plate waste to continually refine future forecasts.*
>
> *Together, this integrated framework aims to reduce commercial food waste by up to 28% and recover millions in direct operational costs for restaurant SMEs. Thank you, and we now welcome questions from the panel."*

---

## 🧠 Section 4: 12-Minute Evaluator Q&A Defence Cheatsheet

### Q1: "Why did you use Multi-Modal Fusion instead of just Computer Vision or just IoT sensors?"
**Your Winning Answer**:
> *"Single-modality systems have fundamental blind spots. Computer Vision can only inspect surface characteristics—it cannot detect internal anaerobic bacterial spoilage in packaged meat or dairy before visible discoloration appears. Conversely, IoT gas sensors detect room-level gas concentrations but cannot pinpoint which specific container or item is decaying. By fusing visual bounding-box defect scores with localized gas/temperature telemetry, our multi-modal XGBoost model achieves higher predictive accuracy ($R^2 = 0.94$) than either modality alone."*

---

### Q2: "How do the biochemical spoilage indicators differ between Meat, Fruits, and Vegetables?"
**Your Winning Answer**:
> *"Different food matrices exhibit distinct decay biomarkers:
> - **Fruits** release volatile ethylene and show high $\text{CO}_2$ spikes due to respiration climacteric peaks and sugar softening.
> - **Vegetables & Leafy Greens** exhibit chlorophyll breakdown (chlorosis/yellowing) and moisture turgor loss.
> - **Meat & Fish** undergo microbial protein deamination, emitting Ammonia ($\text{NH}_3$), Hydrogen Sulfide ($\text{H}_2\text{S}$), and Total Volatile Basic Nitrogen (TVB-N), accompanied by oxymyoglobin oxidation from red to dull grey-brown.
> Our system uses category-specific baseline profiles in the feature fusion layer to evaluate each category accurately."*

---

### Q3: "What Machine Learning algorithms are you using, and what are your evaluation metrics?"
**Your Winning Answer**:
> *- **Computer Vision**: Convolutional Neural Network (YOLOv8 / ResNet-50) for surface defect feature extraction, evaluated via mAP@50 and F1-Score.*
> *- **Shelf-Life Regression**: Random Forest Regressor and XGBoost to predict Remaining Shelf-Life in hours, evaluated via Root Mean Square Error (RMSE) and Mean Absolute Error (MAE).*
> *- **Risk Categorization**: Multi-Class Classifier (`Low`, `Medium`, `High`, `Critical`), evaluated via Accuracy (95.2%), Precision, Recall, and Confusion Matrix.*

---

### Q4: "How does your Spoilage Module talk to the other 3 components in the project?"
**Your Winning Answer**:
> *"Our system operates on a centralized REST API & Event Bus:
> 1. When my component flags an item as `High Risk (Overripe)` (e.g. 25kg bananas expiring in 14h), it sends a priority alert to **Component 2 (Kitchen Optimization)** to schedule that batch into today's prep tasks.
> 2. It signals **Component 1 (Demand Prediction)** to adjust buffer stock quantities for subsequent replenishment orders.
> 3. If an item cannot be saved and must be discarded, **Component 4 (Smart Waste Bin)** validates the discarded weight and verifies the spoilage cost loss."*
