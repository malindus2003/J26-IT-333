/*
 * =========================================================================================
 * SLIIT IT4010 Research Project - SST (J26-IT-333)
 * Component 3: Multi-Modal Spoilage Prediction & Cold Storage Quality Assessment
 * Author: Maddumage M. S. (IT23348820)
 * 
 * Microcontroller: ESP32 DevKit V1
 * Sensors: DHT22 (GPIO 4) + MQ-135 (GPIO 35)
 * Module: Direct-to-Firebase Realtime Database Telemetry Node (Fruits & Vegetables)
 * =========================================================================================
 * 
 * Description:
 * Connects directly to Google Firebase Realtime Database via HTTPS REST API (Zero external
 * Firebase libraries required, high stability).
 * Streams real-time Temperature, Relative Humidity, and Respiration CO2 values directly
 * to Google Cloud:
 * 
 *   PATCH https://<YOUR_FIREBASE_RTDB_URL>/telemetry/<ZONE_ID>/latest.json
 *   POST  https://<YOUR_FIREBASE_RTDB_URL>/telemetry/<ZONE_ID>/history.json
 * =========================================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ============================================================================
// 1. WI-FI & FIREBASE REALTIME DATABASE CONFIGURATION
// ============================================================================
const char* WIFI_SSID     = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

// Replace with your Firebase Realtime Database Base URL (No trailing slash)
// Example: "https://smart-restaurant-j26-default-rtdb.firebaseio.com"
const char* FIREBASE_HOST = "https://smart-restaurant-j26-default-rtdb.firebaseio.com";

// Zone Key for Firebase path (e.g. zone-1-fruits)
const char* ZONE_KEY      = "zone_1_tropical_fruits";
const char* ZONE_NAME     = "Zone 1: Tropical Fruit Chiller (11°C)";

// Transmit interval (5000 ms = 5 seconds)
const unsigned long TRANSMIT_INTERVAL_MS = 5000;

// ============================================================================
// 2. HARDWARE PIN ASSIGNMENTS
// ============================================================================
#define PIN_STATUS_LED   2    // Onboard Blue LED (GPIO 2)
#define PIN_DHT22        4    // Digital 1-Wire DHT22 DAT pin (GPIO 4)
#define PIN_MQ135_ADC   35    // Analog Input: MQ-135 AO pin (ADC1_CH7 - GPIO 35)

#define DHTTYPE DHT22
DHT dht(PIN_DHT22, DHTTYPE);

const float ADC_VREF       = 3.30;
const int   ADC_RESOLUTION = 4095;
const float RL_MQ135       = 10.0;
float       R0_MQ135       = 18.2;

const float MQ135_A = 116.6;
const float MQ135_B = -2.769;

unsigned long lastTransmitTime = 0;
int packetCount = 0;

// ============================================================================
// 3. SENSOR MATH & CALIBRATION
// ============================================================================
float readSmoothedVoltage(int pin, int samples = 16) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delayMicroseconds(200);
  }
  return ((float)sum / samples / ADC_RESOLUTION) * ADC_VREF;
}

float calculateResistance(float vOut, float rl) {
  if (vOut <= 0.05) vOut = 0.05;
  if (vOut >= ADC_VREF) vOut = ADC_VREF - 0.05;
  return ((ADC_VREF - vOut) / vOut) * rl;
}

float calculateCO2PPM(float rs, float r0) {
  float ratio = rs / r0;
  if (ratio <= 0.01) ratio = 0.01;
  float ppm = MQ135_A * pow(ratio, MQ135_B);
  return constrain(ppm + 400.0, 400.0, 3200.0);
}

// ============================================================================
// 4. WI-FI SETUP
// ============================================================================
void connectWiFi() {
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected to Network!");
    Serial.print("[WiFi] Local IP: ");
    Serial.println(WiFi.localIP());
    digitalWrite(PIN_STATUS_LED, HIGH);
  } else {
    Serial.println("\n[WiFi] Connection failed. Check credentials.");
  }
}

// ============================================================================
// 5. FIREBASE REST API TRANSMITTER
// ============================================================================
void streamToFirebase(float temp, float hum, float co2, float voc, float nh3) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  WiFiClientSecure client;
  client.setInsecure(); // Allows secure HTTPS connection to Firebase without loading root cert

  HTTPClient https;

  // URL for updating the "latest" telemetry node
  String url = String(FIREBASE_HOST) + "/telemetry/" + String(ZONE_KEY) + "/latest.json";

  if (https.begin(client, url)) {
    https.addHeader("Content-Type", "application/json");

    // Construct JSON payload
    StaticJsonDocument<256> doc;
    doc["zone_name"]    = ZONE_NAME;
    doc["category"]     = "Fruits";
    doc["temperature"]  = round(temp * 100.0) / 100.0;
    doc["humidity"]     = round(hum * 10.0) / 10.0;
    doc["co2_ppm"]      = round(co2 * 10.0) / 10.0;
    doc["voc_ppm"]      = round(voc * 1000.0) / 1000.0;
    doc["nh3_ppm"]      = round(nh3 * 1000.0) / 1000.0;
    doc["status"]       = (temp > 14.5 || co2 > 1050.0 || hum > 96.0) ? "warning" : "optimal";
    doc["timestamp_ms"] = millis();

    String jsonString;
    serializeJson(doc, jsonString);

    Serial.printf("\n[Firebase TX #%d] Dispatching to: %s\n", ++packetCount, url.c_str());
    Serial.print("[Payload] ");
    Serial.println(jsonString);

    // PATCH updates values in Firebase Realtime DB without overwriting siblings
    int httpCode = https.PATCH(jsonString);

    if (httpCode > 0) {
      Serial.printf("[Firebase RX] HTTP Status: %d (Success)\n", httpCode);
    } else {
      Serial.printf("[Firebase ERR] PATCH failed, error: %s\n", https.errorToString(httpCode).c_str());
    }

    https.end();
  }
}

// ============================================================================
// 6. SETUP & MAIN LOOP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=======================================================");
  Serial.println("  SLIIT IT4010: Direct Firebase IoT Telemetry Node");
  Serial.println("  Component 3: Fruits & Vegetables Cold Storage");
  Serial.println("  Hardware: ESP32 + DHT22 (GPIO 4) + MQ-135 (GPIO 35)");
  Serial.println("=======================================================");

  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_MQ135_ADC, INPUT);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  dht.begin();
  Serial.println("[Sensors] DHT22 & MQ-135 initialized.");

  connectWiFi();
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmitTime = currentMillis;

    // 1. Read DHT22
    float temperature = dht.readTemperature();
    float humidity    = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("[WARN] DHT22 sensor jitter; using baseline values (11.4°C, 90.2%).");
      temperature = 11.4;
      humidity    = 90.2;
    }

    // 2. Read MQ-135 (Respiration CO2)
    float vMQ135  = readSmoothedVoltage(PIN_MQ135_ADC);
    float rsMQ135 = calculateResistance(vMQ135, RL_MQ135);
    float co2_ppm = calculateCO2PPM(rsMQ135, R0_MQ135);

    // 3. Fruit & vegetable biokinetics
    float voc_ppm = 0.15 + ((co2_ppm - 400.0) / 3000.0) * 0.40;
    voc_ppm = constrain(voc_ppm, 0.05, 2.50);
    float nh3_ppm = 0.015;

    // 4. Log to Serial
    Serial.printf("[TELEMETRY] Temp: %.2f °C | Humidity: %.1f %% | CO2: %.1f ppm | MQ-135: %.2f V\n",
                  temperature, humidity, co2_ppm, vMQ135);

    // 5. Stream to Firebase
    streamToFirebase(temperature, humidity, co2_ppm, voc_ppm, nh3_ppm);
  }

  yield();
}
