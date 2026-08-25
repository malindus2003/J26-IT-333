# IoT Hardware Architecture & Circuit Schematic Diagrams
## Research Project: AI & IoT-Based Smart Restaurant Management System (J26-IT-333)

This document contains the complete technical IoT architecture, hardware pinout schematics, communication protocols, and closed feedback loop diagrams required for implementation, thesis documentation, and slide presentation.

---

## 📐 Diagram 1: High-Level End-to-End IoT & AI System Architecture

```mermaid
flowchart TB
    subgraph Layer1["1. PHYSICAL SENSING LAYER"]
        direction TB
        subgraph StorageSensors["Cold Storage & Container Nodes (Component 3)"]
            DHT["DHT22 / DS18B20<br/>(Temp & Humidity)"]
            MQ137["MQ-137<br/>(NH₃ Ammonia Gas)"]
            MQ135["MQ-135<br/>(CO₂ Respiration)"]
            SGP30["SGP30 / MQ-138<br/>(VOC & Ethylene)"]
            OV2640["OV2640 / WebCam<br/>(Visual Inspection)"]
        end
        subgraph WasteSensors["Smart Waste Bin Nodes (Component 4)"]
            HX711["HX711 + Load Cells<br/>(Bin Weight kg)"]
            HCSR04["HC-SR04 Ultrasonic<br/>(Fill Level %)"]
            Servo["SG90 Servo Motors<br/>(Sorting Flaps)"]
        end
    end

    subgraph Layer2["2. EDGE COMPUTING & MICROCONTROLLER LAYER"]
        direction TB
        ESP32_C3["ESP32 Cold Chain Node<br/>• Dual-Core 240MHz<br/>• 12-bit SAR ADC<br/>• I2C / SPI / 1-Wire"]
        ESP32_CAM["ESP32-CAM / Edge Vision<br/>• 2MP OV2640<br/>• JPEG Compression"]
        ESP32_BIN["ESP32 Smart Bin Controller<br/>• Multi-Compartment MCU<br/>• PWM Flap Control"]
    end

    subgraph Layer3["3. COMMUNICATION & TRANSPORT LAYER"]
        direction TB
        WIFI["Wi-Fi 802.11 b/g/n (2.4 GHz)"]
        PROTOCOLS["Protocols: HTTP REST (JSON) / MQTT / WebSockets"]
        GATEWAY["Restaurant Local Gateway / Router"]
    end

    subgraph Layer4["4. BACKEND INGESTION & AI FUSION ENGINE LAYER"]
        direction TB
        API["FastAPI REST Backend<br/>(Uvicorn Async Worker)"]
        CV_MODEL["Computer Vision Engine<br/>• YOLOv8 / ResNet-50<br/>• Mould / Defect Bounding Boxes"]
        ML_MODEL["Multi-Modal Fusion Model<br/>• Random Forest & XGBoost<br/>• Shelf-Life Regression (Hours)<br/>• 4-Tier Risk Classifier"]
        DB[(PostgreSQL / Time-Series DB)]
    end

    subgraph Layer5["5. PRESENTATION & DECISION SUPPORT LAYER"]
        direction TB
        DASHBOARD["React 18 Interactive Dashboard<br/>• Executive Hub<br/>• C1: Demand Forecast<br/>• C2: Kitchen Staffing<br/>• C3: Spoilage & Camera Scanner<br/>• C4: Smart Waste Bin"]
        ALERTS["Automated Chef Alerts & POS Integration"]
    end

    StorageSensors --> ESP32_C3
    OV2640 --> ESP32_CAM
    WasteSensors --> ESP32_BIN

    ESP32_C3 --> WIFI
    ESP32_CAM --> WIFI
    ESP32_BIN --> WIFI

    WIFI --> GATEWAY
    GATEWAY --> PROTOCOLS
    PROTOCOLS --> API

    API --> CV_MODEL
    API --> ML_MODEL
    API --> DB

    ML_MODEL --> DASHBOARD
    CV_MODEL --> DASHBOARD
    DB --> DASHBOARD
    DASHBOARD --> ALERTS
```

---

## ⚡ Diagram 2: Component 3 (Food Spoilage) Detailed Hardware Circuit Schematic

### ESP32 Microcontroller Pin Connection Table

| Sensor / Module | Physical Parameter Measured | ESP32 Interface Type | ESP32 GPIO Pin | Operating Voltage |
| :--- | :--- | :--- | :--- | :--- |
| **DHT22 / AM2302** | Temperature & Relative Humidity | Digital Single-Bus | **GPIO 4** (with $4.7\text{k}\Omega$ Pullup) | 3.3V – 5.0V |
| **MQ-137 Sensor** | Ammonia ($\text{NH}_3$) Protein Decomposition | Analog ADC1 (Channel 6) | **GPIO 34** (Analog IN) | 5.0V (VCC) / 3.3V (ADC) |
| **MQ-135 Sensor** | Carbon Dioxide ($\text{CO}_2$) & Air Quality | Analog ADC1 (Channel 7) | **GPIO 35** (Analog IN) | 5.0V (VCC) / 3.3V (ADC) |
| **SGP30 Sensor** | Ethylene Gas & Total VOC | $\text{I}^2\text{C}$ Serial Data (SDA) | **GPIO 21** (SDA) | 3.3V |
| **SGP30 Sensor** | Ethylene Gas & Total VOC | $\text{I}^2\text{C}$ Serial Clock (SCL) | **GPIO 22** (SCL) | 3.3V |
| **OV2640 Camera** | Visual Optical Container Ripeness Inspection | DVP 8-bit Camera Interface | **ESP32-CAM Bus** | 3.3V / 5.0V |
| **Power Supply** | Main System Power | DC Jack / Micro-USB | **VIN / GND** | 5V 2A DC Adaptor |

```mermaid
graph LR
    subgraph Power["Power Distribution"]
        DC5V["5V 2A DC Power Supply"]
        LM1117["3.3V Voltage Regulator"]
        GND["Common Ground (GND)"]
    end

    subgraph ESP32["ESP32 DevKit V1 (30-Pin MCU)"]
        P_VIN["VIN (5V IN)"]
        P_3V3["3V3 (OUT)"]
        P_GND["GND"]
        P_G4["GPIO 4 (Digital)"]
        P_G34["GPIO 34 (ADC1_6)"]
        P_G35["GPIO 35 (ADC1_7)"]
        P_G21["GPIO 21 (SDA)"]
        P_G22["GPIO 22 (SCL)"]
    end

    subgraph Sensors["Environmental Sensor Array"]
        DHT["DHT22 (Temp & Hum)<br/>Pin 1: VCC (3.3V)<br/>Pin 2: DATA (GPIO 4)<br/>Pin 4: GND"]
        MQ137["MQ-137 (NH₃ Ammonia)<br/>VCC: 5V<br/>AOUT: GPIO 34<br/>GND: Common GND"]
        MQ135["MQ-135 (CO₂ Gas)<br/>VCC: 5V<br/>AOUT: GPIO 35<br/>GND: Common GND"]
        SGP30["SGP30 (VOC/Ethylene)<br/>VCC: 3.3V<br/>SDA: GPIO 21<br/>SCL: GPIO 22<br/>GND: Common GND"]
    end

    DC5V --> P_VIN
    DC5V --> MQ137
    DC5V --> MQ135
    DC5V --> LM1117
    LM1117 --> P_3V3
    P_3V3 --> DHT
    P_3V3 --> SGP30
    GND --> P_GND

    DHT --> P_G4
    MQ137 --> P_G34
    MQ135 --> P_G35
    SGP30 --> P_G21
    SGP30 --> P_G22
```

---

## 🗑️ Diagram 3: Component 4 (Smart Waste Bin) Hardware Circuit Schematic

```mermaid
graph TD
    subgraph WasteBin["Smart Waste Bin Controller (ESP32)"]
        MCU2["ESP32 Controller Node"]
    end

    subgraph WeightSensing["Load Cell & Weight Sensing"]
        LC1["Load Cell 1 (Food Waste)"]
        LC2["Load Cell 2 (Plastics)"]
        LC3["Load Cell 3 (Paper)"]
        LC4["Load Cell 4 (General)"]
        HX["HX711 24-Bit ADC Module<br/>DT: GPIO 18 | SCK: GPIO 19"]
    end

    subgraph LevelSensing["Ultrasonic Fill-Level Sensing"]
        US1["HC-SR04 Compartment 1<br/>Trig: GPIO 12 | Echo: GPIO 13"]
        US2["HC-SR04 Compartment 2<br/>Trig: GPIO 14 | Echo: GPIO 27"]
    end

    subgraph SortingFlaps["Automated Mechanical Sorting"]
        SERVO1["SG90 Servo Motor (Flap A)<br/>PWM: GPIO 25"]
        SERVO2["SG90 Servo Motor (Flap B)<br/>PWM: GPIO 26"]
    end

    LC1 & LC2 & LC3 & LC4 --> HX --> MCU2
    US1 & US2 --> MCU2
    MCU2 --> SERVO1 & SERVO2
```

---

## 🔄 Diagram 4: Closed Feedback Loop Cross-Component Data Interaction

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Restaurant Staff / Chefs
    participant C1 as Component 1: Demand Prediction (Nanayakkara K.)
    participant C2 as Component 2: Kitchen Efficiency (Pahesara H.)
    participant C3 as Component 3: Spoilage & Quality (Maddumage M.)
    participant C4 as Component 4: Smart Waste Bin (Pathirana P.)
    participant DB as Central System Data Bus

    %% Step 1: Demand Planning
    C1->>DB: Broadcasts Daily Portion Targets (480 Meals)
    DB->>C2: Allocates Chefs & Station Prep Quotas

    %% Step 2: Storage Monitoring
    C3->>C3: IoT Nodes stream Temp, NH₃, CO₂, VOC & Camera Scan
    C3->>DB: Spoilage Alert: 25kg Bananas (14h Shelf-life left)
    DB->>C2: Directs Kitchen to prioritize Bananas in today's dessert menu (FIFO)

    %% Step 3: Kitchen Production
    C2->>Staff: Dynamic Kitchen Allocation during 19:00 peak rush

    %% Step 4: Waste Monitoring & Closed Loop
    Staff->>C4: Discards unconsumed food waste
    C4->>C4: Load Cells record 28.5 kg waste & AI categorizes (Rice 34.5%)
    C4->>DB: Transmits plate waste metrics & financial loss (LKR 10,900)
    DB->>C1: Feeds actual waste data back to refine future meal portion forecasts
```

---

## 📡 Diagram 5: IoT Wireless Transmission & Data Payload Schema

When the ESP32 node publishes sensor data, it formats a lightweight JSON payload transmitted over HTTP POST or MQTT:

```json
{
  "node_id": "ESP32_ZONE_01",
  "storage_zone": "Zone 1: Fruit & Berry Preservation Chamber",
  "category": "Fruits",
  "telemetry": {
    "temperature_c": 9.20,
    "humidity_pct": 91.0,
    "nh3_ammonia_ppm": 0.03,
    "co2_ppm": 980.0,
    "voc_ppm": 0.46
  },
  "battery_v": 4.12,
  "rssi_dbm": -64,
  "timestamp": "2026-08-25T10:30:00Z"
}
```

---

## 🎯 How to Use These Diagrams in Your SLIIT Presentation & Thesis:
1. **Slide Presentations (PowerPoint)**:
   - Copy **Diagram 1** into your group system overview slide.
   - Copy **Diagram 2** into your individual 4-minute Component 3 methodology slide to explain the hardware.
   - Copy **Diagram 4** into your wrap-up slide to demonstrate the closed-loop novelty.
2. **Research Proposal / Final Report**:
   - Paste the diagrams and pinout tables directly into Chapter 3 (Methodology & System Architecture).
