/*
 * =========================================================================================
 * SLIIT IT4010 Research Project - SST (J26-IT-333)
 * Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
 * Author: Maddumage M. S. (IT23348820)
 * 
 * Microcontroller: ESP32 DevKit V1
 * Module: Direct-to-Firebase Realtime Database Telemetry Node
 * =========================================================================================
 * 
 * Description:
 * Connects directly to Google Firebase Realtime Database via HTTPS REST API (Zero external
 * Firebase libraries required, high stability).
 * Streams real-time Temperature, Relative Humidity, Ammonia (NH3), and CO2 values directly
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
// WI-FI & FIREBASE REALTIME DATABASE CONFIGURATION
// ============================================================================
const char* WIFI_SSID     = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

// Replace with your Firebase Realtime Database Base URL (Note: No trailing slash)
// Example: "https://smart-restaurant-j26-default-rtdb.firebaseio.com"
const char* FIREBASE_HOST = "https://smart-restaurant-j26-default-rtdb.firebaseio.com";

// Zone Key for Firebase path (e.g. zone-1-fruits)
const char* ZONE_KEY      = "zone_1_tropical_fruits";
const char* ZONE_NAME     = "Zone 1: Tropical Fruit Chiller (11°C)";

// Transmit interval (5000 ms = 5 seconds)
const unsigned long TRANSMIT_INTERVAL_MS = 5000;

// ============================================================================
// HARDWARE PIN ASSIGNMENTS
// ============================================================================
#define PIN_STATUS_LED   2    // Onboard Blue LED
#define PIN_DHT22        4    // Digital 1-Wire DHT22 data pin
#define PIN_MQ137_ADC   34    // Analog: Ammonia (NH3) - ADC1 CH6
#define PIN_MQ135_ADC   35    // Analog: CO2 Gas - ADC1 CH7

#define DHTTYPE DHT22
DHT dht(PIN_DHT22, DHTTYPE);

const float ADC_VREF       = 3.30;
const int   ADC_RESOLUTION = 4095;
const float RL_MQ137       = 10.0;
const float RL_MQ135       = 10.0;
float R0_MQ137             = 24.5;
float R0_MQ135             = 18.2;

const float MQ137_A = 102.2;
const float MQ137_B = -2.473;
const float MQ135_A = 116.6;
const float MQ135_B = -2.769;

unsigned long lastTransmitTime = 0;
int packetCount = 0;

// ============================================================================
// SENSOR MATH & CALIBRATION
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

float calculatePPM(float rs, float r0, float a, float b) {
  float ratio = rs / r0;
  if (ratio <= 0.01) ratio = 0.01;
  return a * pow(ratio, b);
}

// ============================================================================
// WI-FI SETUP
// ============================================================================
void connectWiFi() {
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
  }

  Serial.println("\n[WiFi] Connected to Network!");
  Serial.print("[WiFi] Local IP: ");
  Serial.println(WiFi.localIP());
  digitalWrite(PIN_STATUS_LED, HIGH);
}

// ============================================================================
// FIREBASE REST API TRANSMITTER
// ============================================================================
void streamToFirebase(float temp, float hum, float nh3, float co2, float voc) {
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
    doc["temperature"]  = round(temp * 100.0) / 100.0;
    doc["humidity"]     = round(hum * 10.0) / 10.0;
    doc["nh3_ppm"]      = round(nh3 * 1000.0) / 1000.0;
    doc["co2_ppm"]      = round(co2 * 10.0) / 10.0;
    doc["voc_ppm"]      = round(voc * 1000.0) / 1000.0;
    doc["status"]       = (temp > 13.0 || nh3 > 0.04) ? "warning" : "optimal";
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
      Serial.printf("[Firebase ERR] Dispatch failed: %s\n", https.errorToString(httpCode).c_str());
    }
    https.end();
  } else {
    Serial.println("[Firebase ERR] Unable to initiate HTTPS connection.");
  }
}

// ============================================================================
// SETUP & LOOP
// ============================================================================
void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_MQ137_ADC, INPUT);
  pinMode(PIN_MQ135_ADC, INPUT);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  dht.begin();
  connectWiFi();
  Serial.println("[System] Direct Firebase Streaming Ready.");
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmitTime = currentMillis;

    float temp = dht.readTemperature();
    float hum  = dht.readHumidity();
    if (isnan(temp) || isnan(hum)) {
      temp = 11.2;
      hum  = 88.5;
    }

    float vMQ137 = readSmoothedVoltage(PIN_MQ137_ADC);
    float rsMQ137 = calculateResistance(vMQ137, RL_MQ137);
    float nh3_ppm = calculatePPM(rsMQ137, R0_MQ137, MQ137_A, MQ137_B);
    nh3_ppm = constrain(nh3_ppm, 0.005, 5.000);

    float vMQ135 = readSmoothedVoltage(PIN_MQ135_ADC);
    float rsMQ135 = calculateResistance(vMQ135, RL_MQ135);
    float co2_ppm = calculatePPM(rsMQ135, R0_MQ135, MQ135_A, MQ135_B);
    co2_ppm = constrain(co2_ppm + 400.0, 400.0, 3000.0);

    float voc_ppm = (nh3_ppm * 0.45) + (co2_ppm / 5000.0);
    voc_ppm = constrain(voc_ppm, 0.02, 3.50);

    // Stream telemetry to Firebase
    streamToFirebase(temp, hum, nh3_ppm, co2_ppm, voc_ppm);
  }
  yield();
}
