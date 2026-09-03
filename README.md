# 🍽️ AI + IoT-Based Smart Restaurant Management System
### *For Food Waste Prediction, Spoilage Assessment, Kitchen Efficiency, and Operational Optimization*

**Project ID**: `J26-IT-333`  
**Research Cluster**: SST – Software Systems & Technologies  
**Institution**: Sri Lanka Institute of Information Technology (SLIIT) – IT4010 Research Project 2026  

---

## 👥 Research Team & Component Specializations

| Member | Registration No. | GitHub Username | Research Component & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Maddumage M. S.** *(Lead)* | `IT23348820` | [`@malindus2003`](https://github.com/malindus2003) | **Component 3**: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment Module |
| **Nanayakkara K. A. J. Y.** | `IT23314542` | [`@yohansaJ`](https://github.com/yohansaJ) | **Component 1**: Multi-Source AI Food Demand Prediction & XAI Module |
| **Pehesara H. H. D. S.** | `IT23349292` | [`@Dilmi16`](https://github.com/Dilmi16) | **Component 2**: AI-Based Kitchen Efficiency, Staff Optimization & POS/KDS Module |
| **Pathirana P. R. T.** | `IT23324060` | [`@runeth04`](https://github.com/runeth04) | **Component 4**: IoT-Enabled Smart Waste Monitoring, Categorization & Recycling Module |

---

## 🌟 Executive Overview & System Vision

Commercial restaurants and hospitality kitchens lose over 1.3 billion tons of food annually. SME commercial kitchens frequently incur 25%–30% in preventable financial losses due to isolated operational silos: inaccurate meal forecasting, unmonitored cold chain spoilage, kitchen station bottlenecks, and untracked disposal.

This project delivers a **Unified Closed-Feedback Loop AI & IoT Ecosystem** uniting 4 specialized research pillars into a single real-time decision-support platform with Web, Android Mobile, and Desktop interfaces:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SMART RESTAURANT ECOSYSTEM                                    │
│                                                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │     COMPONENT 1      │  │     COMPONENT 2      │  │   COMPONENT 3    │  │   COMPONENT 4    │  │
│  │    Food Demand       │  │ Kitchen Efficiency   │  │  Multi-Modal     │  │   Smart Waste    │  │
│  │    Forecasting       │  │ & Staff Optimizer    │  │  Food Spoilage   │  │   Bin Tracking   │  │
│  │ (Nanayakkara K.A.J.Y)│  │ (Pehesara H.H.D.S)   │  │ (Maddumage M.S)  │  │(Pathirana P.R.T) │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│             │                         │                       │                     │            │
│             └─────────────────────────┼───────────────────────┴─────────────────────┘            │
│                                       ▼                                                          │
│                      CENTRAL EXECUTIVE DECISION SUPPORT HUB                                      │
│           (Live POS • Connected Inventory • 3-Stage KDS • Incident Alerts Center)                │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Deep-Dive: The 4 Core Research Components

### 📈 Component 1: Multi-Source AI Food Demand Prediction
**Researcher**: Nanayakkara K. A. J. Y. (`IT23314542`)

- **Multi-Source Feature Pipeline**: Synthesizes historical POS sales data, weather forecasts (precipitation, temperature), public holidays, local sporting/cultural events, promotional campaigns, and table reservations.
- **Ensemble Machine Learning**: Implements Random Forest and Prophet time-series regression models for accurate 7-day multi-shift (Breakfast, Lunch, Dinner) meal demand forecasting.
- **Explainable AI (XAI)**: SHAP-inspired feature attribution breakdown showing how weather, day-of-week, and promotions quantitatively impact demand forecasts.
- **What-If Simulation Sandbox**: Interactive simulator allowing managers to test price elasticity, menu adjustments, and sudden weather shifts before kitchen preparation starts.
- **Continuous Retraining & Feedback Loop**: Automated drift detection and historical forecast vs. actual variance tracking for continuous model self-tuning.

---

### 👨‍🍳 Component 2: AI-Based Kitchen Efficiency & Staff Optimization
**Researcher**: Pehesara H. H. D. S. (`IT23349292`)

- **Peak-Hour & Throughput Forecasting**: Predicts hourly customer arrivals and order loads across 5 kitchen stations (Grill, Fry, Salad, Prep, Bakery).
- **Dynamic Station Queue Balancing**: Analyzes cooking durations, queue lengths, and station workloads to recommend live chef reassignments and prevent bottlenecking.
- **Skill-Gap Analysis & Competency Matrix**: Evaluates staff culinary competencies, workload capacities, and recommends personalized skill-improvement training modules.
- **3-Stage Kitchen Display System (KDS)**: Live digital pass tracking ticket stages through `Prep` $\rightarrow$ `Cooking` $\rightarrow$ `Ready for Pickup`.
- **Integrated POS & Table Floor Management**: Digital menu ordering, floor occupancy maps, itemized billing invoices with tax and service charge calculations, and a historical sales ledger.

---

### 🔬 Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
**Researcher**: Maddumage M. S. (`IT23348820`)

- **5-Zone IoT Cold Chain Telemetry**: Continuous streaming of Temperature (°C), Relative Humidity (%), Ammonia ($\text{NH}_3$), Carbon Dioxide ($\text{CO}_2$), and Volatile Organic Compounds (VOC) across Fruit, Veg, Dairy, Meat, and Seafood cold storage vaults.
- **Optical Computer Vision Produce Scanner**: Deep learning feature extraction quantifying surface discoloration percentage, microbial/fungal mould patches, texture degradation, and ripeness stages across 5 food categories.
- **Multi-Modal AI Fusion Engine**: Combines real-time gas/environmental readings with visual defect features to predict **Remaining Shelf-Life (RSL in hours)** and **Spoilage Probability (%)** with 4-tier risk classification (`Low`, `Medium`, `High`, `Critical`).
- **Intelligent FIFO Recipe Routing**: Automatically suggests dishes to prepare immediately using expiring batches to prevent financial loss.
- **ESP32 Telemetry Emulator**: Built-in hardware simulator for testing anomaly spikes (compressor failure, ammonia surges) during demonstrations and evaluations.
- **Stateful Incident Alert Notification Center**: Centralized drawer alerting kitchen managers to environmental drifts and contaminated batches.

---

### 🗑️ Component 4: IoT-Enabled Smart Waste Monitoring & Automated Categorization
**Researcher**: Pathirana P. R. T. (`IT23324060`)

- **Dual-Sensor Smart Bin Monitoring**: HC-SR04 ultrasonic distance sensors for fill-level (%) and HX711 load cells for real-time weight (kg) measurement across waste compartments.
- **Waste Categorization & Mechanical Sorting**: Supports category-specific waste bins (Food Solids, Liquid/Slurry, Recyclable Plastic, Paper/Cardboard) with automated sorting flap controls.
- **Financial Cost-Loss Analytics**: Translates discarded food weight into daily financial losses (LKR) with ingredient-specific cost breakdown and reduction recommendations.
- **Automated Recycling Quotation Dispatch**: Triggers automated quotation requests via SMTP email delivery to registered recycling partners when bins reach capacity.
- **Recycling Partner & Diagnostics Management**: Partner registration portal with waste capability filters and real-time compartment sensor diagnostics.

---

## 💻 Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend Web & UI** | React 18, Vite 5, Tailwind CSS 3, Recharts, Lucide React, Axios |
| **Mobile Application** | Capacitor 8 (`@capacitor/android`, `@capacitor/status-bar`), Android SDK 34, Samsung Galaxy S10 5G edge-to-edge layout |
| **Desktop Application** | Electron 44, Node.js |
| **Backend Core** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **AI / ML & Computer Vision** | Scikit-learn, NumPy, Pillow, Computer Vision Engine, Multi-Modal Fusion Regression |
| **IoT & Microcontrollers** | ESP32, ESP32-CAM, DHT22, MQ-135, MQ-137, SGP30, HX711, HC-SR04, HTTP REST / MQTT |

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher (npm 9+)

---

### 1. Backend Server Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI development server
python run.py
```
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Alternative ReDoc API Guide**: `http://localhost:8000/redoc`

---

### 2. Frontend Dashboard Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
- **Frontend Dashboard**: `http://localhost:5173`

---

### 3. One-Click Launcher (Windows)
Double-click `run.bat` in the root directory to automatically launch both the FastAPI backend and React frontend concurrently.

---

### 4. Android Mobile App Deployment (Capacitor)

```bash
cd frontend

# Sync build assets to Android project
npm run mobile:sync

# Build Debug APK
cd android
./gradlew assembleDebug
```
- **Compiled APK Output**: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🧭 System Navigation & Role-Based Access Control

The application features a 3-role persona switcher in the top navigation header:

1. **👑 Administrator**: Full access to all 7 modules (Executive Hub, Demand Forecast, Kitchen Staff, Spoilage Scanner, Smart Waste Bin, Orders Ledger, Inventory Health).
2. **💳 Cashier / Front-of-House**: Streamlined interface focusing on POS Menu ordering, Floor Table occupancy, and Sales Receipts.
3. **👨‍🍳 Kitchen Staff / Chef**: Focused on 3-Stage KDS Ticket Pass, Station Workload queues, Cold Storage Telemetry, and Spoilage FIFO Alerts.

---

## 📁 Repository Structure

```
J26-IT-333/
├── backend/
│   ├── app/
│   │   ├── data/                 # Seed & offline fallback catalog
│   │   ├── models/               # ML & Computer Vision inference engines
│   │   ├── routers/              # Component 1-4 REST endpoints
│   │   ├── main.py               # FastAPI application root & CORS
│   │   └── schemas.py            # Pydantic validation schemas
│   ├── .env.example              # Environment variables template
│   ├── requirements.txt          # Python dependencies
│   └── run.py                    # Server runner
├── frontend/
│   ├── android/                  # Native Capacitor Android project
│   ├── electron/                 # Electron desktop runtime wrapper
│   ├── public/images/            # Specimen produce & menu dish image datasets
│   ├── src/
│   │   ├── components/           # All 15 React dashboard modules
│   │   ├── data/                 # Client-side offline fallback datasets
│   │   ├── App.jsx               # Root application component
│   │   ├── index.css             # Tailwind styling & animations
│   │   └── main.jsx              # React entry point
│   ├── capacitor.config.json     # Mobile build configuration
│   ├── package.json              # NPM dependencies & scripts
│   ├── tailwind.config.js        # Tailwind CSS config
│   └── vite.config.js            # Vite build config
├── IOT_HARDWARE_ARCHITECTURE_DIAGRAMS.md # 7 Mermaid circuit & system schematics
├── PRESENTATION_GUIDE.md         # SLIIT proposal defense handbook & presentation scripts
├── README.md                     # Project master documentation
└── run.bat                       # One-click Windows runner
```

---

## 📜 License & Academic Integrity

This project is developed for the **SLIIT IT4010 Research Project 2026** by Group **`J26-IT-333`**. All research components, algorithmic implementations, and architectural designs belong to the respective student authors and the Sri Lanka Institute of Information Technology.
