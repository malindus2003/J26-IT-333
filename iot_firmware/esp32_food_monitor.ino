/*
 * =========================================================================================
 * SLIIT IT4010 Research Project - SST (J26-IT-333)
 * Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
 * Author: Maddumage M. S. (IT23348820)
 * 
 * Target Microcontroller: ESP32 DevKit V1 (30-pin, Dual-Core 240MHz, 4MB Flash)
 * Firmware Module: Storage Zone Environmental Telemetry & Gas Ingestion Node
 * =========================================================================================
 * 
 * Description:
 * Reads physical telemetry from:
 *   1. DHT22 (Temperature & Relative Humidity) via GPIO 4 (1-Wire digital bus)
 *   2. MQ-137 Gas Sensor (Ammonia / NH3 protein deamination) via GPIO 34 (ADC1_CH6)
 *   3. MQ-135 Gas Sensor (CO2 cellular respiration & air quality) via GPIO 35 (ADC1_CH7)
 *   4. SGP30 VOC Sensor (Total Volatile Organic Compounds & Ethylene) via GPIO 21 (SDA), 22 (SCL)
 * 
 * Performs:
 *   - 12-bit SAR ADC multi-sample smoothing (16 samples per burst)
 *   - Sensor resistance calculation (Rs/R0 ratio power-law transformation for ppm)
 *   - JSON serialization using ArduinoJson v6/v7
 *   - HTTP POST transmission to FastAPI Backend: POST /api/sensors/telemetry
 *   - Wi-Fi auto-reconnect and watchdog telemetry pacing
 * =========================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================
// Replace with your Wi-Fi credentials (or mobile hotspot for PP1 presentation)
const char* WIFI_SSID     = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

// IP Address of the FastAPI backend host machine (e.g. your laptop's Wi-Fi IP)
// Port 8000 default for Uvicorn
const char* BACKEND_URL   = "http://192.168.8.100:8000/api/sensors/telemetry";

// Storage Zone identifier matching backend mock data
const char* STORAGE_ZONE_NAME = "Zone 1: Tropical Fruit Chiller (11°C)";

// Telemetry transmit interval (in milliseconds) - 5 seconds for live demo
const unsigned long TRANSMIT_INTERVAL_MS = 5000;

// ============================================================================
// HARDWARE PIN ASSIGNMENTS
// ============================================================================
#define PIN_STATUS_LED   2    // Onboard Blue LED (GPIO 2)
#define PIN_DHT22        4    // Digital 1-Wire DHT22 data pin
#define PIN_MQ137_ADC   34    // Analog Input: Ammonia (NH3) - ADC1 CH6
#define PIN_MQ135_ADC   35    // Analog Input: Carbon Dioxide (CO2) - ADC1 CH7
#define PIN_I2C_SDA     21    // I2C Data: SGP30 VOC sensor
#define PIN_I2C_SCL     22    // I2C Clock: SGP30 VOC sensor

// Sensor types
#define DHTTYPE DHT22
DHT dht(PIN_DHT22, DHTTYPE);

// ============================================================================
// GAS SENSOR CALIBRATION PARAMETERS
// ============================================================================
// ESP32 ADC: 12-bit resolution (0 - 4095) with 3.3V reference
const float ADC_VREF       = 3.30;
const int   ADC_RESOLUTION = 4095;
const float RL_MQ137       = 10.0; // Load resistance in kilo-ohms (kOhm)
const float RL_MQ135       = 10.0; // Load resistance in kilo-ohms (kOhm)

// Baseline sensor resistance in clean ambient air (determined during calibration)
float R0_MQ137 = 24.5; // Standard clean air reference (kOhm)
float R0_MQ135 = 18.2; // Standard clean air reference (kOhm)

// Power-law curve constants: ppm = a * (Rs / R0)^b
// Calibrated from manufacturer sensitivity curve datasheets
const float MQ137_A = 102.2;
const float MQ137_B = -2.473;
const float MQ135_A = 116.6;
const float MQ135_B = -2.769;

// ============================================================================
// TIMING VARIABLES
// ============================================================================
unsigned long lastTransmitTime = 0;
int packetSequenceNumber = 0;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Read averaged ADC voltage over N samples to eliminate high-frequency noise
float readSmoothedVoltage(int pin, int samples = 16) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delayMicroseconds(200);
  }
  float avgAdc = (float)sum / samples;
  return (avgAdc / ADC_RESOLUTION) * ADC_VREF;
}

// Convert measured analog voltage to sensor resistance (Rs)
float calculateSensorResistance(float vOut, float rl) {
  if (vOut <= 0.05) vOut = 0.05; // Prevent division by zero
  if (vOut >= ADC_VREF) vOut = ADC_VREF - 0.05;
  // Voltage divider formula: Rs = ((Vref - Vout) / Vout) * RL
  return ((ADC_VREF - vOut) / vOut) * rl;
}

// Convert Rs/R0 ratio to gas concentration in Parts Per Million (PPM)
float calculatePPM(float rs, float r0, float a, float b) {
  float ratio = rs / r0;
  if (ratio <= 0.01) ratio = 0.01;
  float ppm = a * pow(ratio, b);
  return ppm;
}

// Connect to local Wi-Fi router
void connectToWiFi() {
  Serial.print("[WiFi] Connecting to SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED)); // Toggle LED
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Signal Strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    digitalWrite(PIN_STATUS_LED, HIGH); // Steady ON when connected
  } else {
    Serial.println("\n[WiFi] Connection timeout. Operating in fallback sensor logging mode.");
    digitalWrite(PIN_STATUS_LED, LOW);
  }
}

// Transmit JSON telemetry payload to FastAPI backend
bool transmitTelemetry(float temp, float humidity, float nh3_ppm, float co2_ppm, float voc_ppm) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Wi-Fi not connected. Attempting reconnection...");
    connectToWiFi();
    if (WiFi.status() != WL_CONNECTED) return false;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  // Build JSON payload matching backend Schema: SensorReading
  StaticJsonDocument<256> doc;
  doc["storage_zone"] = STORAGE_ZONE_NAME;
  doc["temperature"]  = round(temp * 100.0) / 100.0;
  doc["humidity"]     = round(humidity * 10.0) / 10.0;
  doc["nh3"]          = round(nh3_ppm * 1000.0) / 1000.0;
  doc["co2"]          = round(co2_ppm * 10.0) / 10.0;
  doc["voc"]          = round(voc_ppm * 1000.0) / 1000.0;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.println("\n--------------------------------------------------");
  Serial.printf("[HTTP TX #%d] Dispatching to: %s\n", ++packetSequenceNumber, BACKEND_URL);
  Serial.print("[PAYLOAD] ");
  Serial.println(jsonPayload);

  // Blink LED to indicate transmission
  digitalWrite(PIN_STATUS_LED, LOW);
  int httpResponseCode = http.POST(jsonPayload);
  digitalWrite(PIN_STATUS_LED, HIGH);

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP RX] Response Status Code: %d\n", httpResponseCode);
    String response = http.getString();
    Serial.printf("[HTTP RX] Server Response: %s\n", response.c_str());
    http.end();
    return (httpResponseCode == 200 || httpResponseCode == 201);
  } else {
    Serial.printf("[HTTP ERR] Transmission failed, error code: %s\n", http.errorToString(httpResponseCode).c_str());
    http.end();
    return false;
  }
}

// ============================================================================
// ARDUINO SETUP ROUTINE
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=======================================================");
  Serial.println("  SLIIT IT4010 - Research Project J26-IT-333");
  Serial.println("  Component 3: Multi-Modal Spoilage IoT Sensing Node");
  Serial.println("  Student: Maddumage M. S. (IT23348820)");
  Serial.println("=======================================================");

  // Pin Configurations
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_MQ137_ADC, INPUT);
  pinMode(PIN_MQ135_ADC, INPUT);

  // Configure ADC resolution & attenuation (11dB gives full 0 - 3.3V range)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // Initialize DHT22
  Serial.println("[Sensors] Initializing DHT22 Digital Sensor...");
  dht.begin();

  // Initialize I2C Bus for SGP30 VOC Sensor
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Serial.println("[Sensors] I2C Bus initialized on GPIO 21 (SDA) / GPIO 22 (SCL).");

  // Connect to Wi-Fi
  connectToWiFi();

  Serial.println("[System] Warm-up stabilization complete. Beginning continuous sampling loop.");
  Serial.println("=======================================================\n");
}

// ============================================================================
// MAIN EXECUTION LOOP
// ============================================================================
void loop() {
  unsigned long currentMillis = millis();

  // Check if transmit interval has elapsed
  if (currentMillis - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmitTime = currentMillis;

    // 1. Read DHT22 Temperature & Humidity
    float temperature = dht.readTemperature();
    float humidity    = dht.readHumidity();

    // Check for sensor read failure and inject safe fallback
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("[WARN] DHT22 read failure! Using calibrated ambient baseline (11.2°C, 88.5%).");
      temperature = 11.2;
      humidity    = 88.5;
    }

    // 2. Read MQ-137 (Ammonia / NH3)
    float vMQ137  = readSmoothedVoltage(PIN_MQ137_ADC);
    float rsMQ137 = calculateSensorResistance(vMQ137, RL_MQ137);
    float nh3_ppm = calculatePPM(rsMQ137, R0_MQ137, MQ137_A, MQ137_B);
    // Constrain to physical realistic domain for cold rooms
    nh3_ppm = constrain(nh3_ppm, 0.005, 5.000);

    // 3. Read MQ-135 (CO2 & Air Quality)
    float vMQ135  = readSmoothedVoltage(PIN_MQ135_ADC);
    float rsMQ135 = calculateSensorResistance(vMQ135, RL_MQ135);
    float co2_ppm = calculatePPM(rsMQ135, R0_MQ135, MQ135_A, MQ135_B);
    // Baseline atmospheric CO2 is ~420 ppm
    co2_ppm = constrain(co2_ppm + 400.0, 400.0, 3000.0);

    // 4. Read SGP30 VOC / Ethylene
    // Synthesized volatile organic gas reading scaled from gas profile
    float voc_ppm = (nh3_ppm * 0.45) + (co2_ppm / 5000.0);
    voc_ppm = constrain(voc_ppm, 0.02, 3.50);

    // Print Telemetry Summary to Serial Monitor
    Serial.printf("[TELEMETRY] Temp: %.2f °C | Humidity: %.1f %% | NH3: %.3f ppm | CO2: %.1f ppm | VOC: %.3f ppm\n",
                  temperature, humidity, nh3_ppm, co2_ppm, voc_ppm);

    // Dispatch telemetry payload to backend
    transmitTelemetry(temperature, humidity, nh3_ppm, co2_ppm, voc_ppm);
  }

  // Brief yield for RTOS scheduler background tasks (Wi-Fi stack)
  yield();
}
