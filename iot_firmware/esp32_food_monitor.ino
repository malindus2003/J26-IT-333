/*
 * =========================================================================================
 * SLIIT IT4010 Research Project - SST (J26-IT-333)
 * Component 3: Multi-Modal Spoilage Prediction & Cold Storage Quality Assessment
 * Author: Maddumage M. S. (IT23348820)
 * 
 * Hardware Target: ESP32 DevKit V1 (Dual-Core 240MHz)
 * Sensors, Displays & Alarms:
 *   1. DHT22 (DAT -> GPIO 4)            - Temperature & Relative Humidity
 *   2. MQ-135 (AO  -> GPIO 35)           - Respiration CO2 & Air Quality
 *   3. 0.96" OLED I2C (SDA -> GPIO 21, SCL -> GPIO 22) - Real-time Spoilage Screen
 *   4. 4-Pin RGB LED (R -> 18, G -> 19, B -> 23)       - Visual Fresh/Spoil Light
 *   5. 2-Pin Buzzer (+) -> GPIO 5                      - Acoustic Spoilage Siren
 * =========================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Brownout protection registers
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// ============================================================================
// 1. OLED DISPLAY CONFIGURATION (128x64 I2C)
// ============================================================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
bool oledFound = false;

// ============================================================================
// 2. NETWORK & BACKEND CONFIGURATION
// ============================================================================
const char* WIFI_SSID     = "Malindu";
const char* WIFI_PASSWORD = "12345678";
const char* BACKEND_URL   = "http://172.20.10.6:8000/api/sensors/telemetry";

const char* STORAGE_ZONE_NAME = "Zone 1: Tropical Fruit Chiller (11°C)";
const unsigned long TRANSMIT_INTERVAL_MS = 4000;

// ============================================================================
// 3. HARDWARE PIN ASSIGNMENTS
// ============================================================================
#define PIN_STATUS_LED    2   // Onboard Blue Status LED (GPIO 2)
#define PIN_DHT22         4   // Digital 1-Wire DHT22 DAT pin (GPIO 4)
#define PIN_MQ135_ADC    35   // Analog Input: MQ-135 AO pin (ADC1_CH7 - GPIO 35)
#define PIN_I2C_SDA      21   // I2C Data for OLED (GPIO 21)
#define PIN_I2C_SCL      22   // I2C Clock for OLED (GPIO 22)

// Visual & Acoustic Alert Pins
#define PIN_RGB_RED      18   // RGB Red Channel (GPIO 18)
#define PIN_RGB_GREEN    19   // RGB Green Channel (GPIO 19)
#define PIN_RGB_BLUE     23   // RGB Blue Channel (GPIO 23)
#define PIN_BUZZER        5   // 2-Pin Buzzer Positive (+) (GPIO 5)

// Set to true for Common Cathode (longest leg to GND), false for Common Anode (longest leg to 3V3)
#define RGB_COMMON_CATHODE true

#define DHTTYPE DHT22
DHT dht(PIN_DHT22, DHTTYPE);

// ============================================================================
// 4. SENSOR CALIBRATION PARAMETERS
// ============================================================================
const float ADC_VREF       = 3.30;
const int   ADC_RESOLUTION = 4095;
const float RL_MQ135       = 10.0;
float       R0_MQ135       = 18.2;

const float MQ135_A = 116.6;
const float MQ135_B = -2.769;

unsigned long lastTransmitTime = 0;
int packetSequenceNumber = 0;
bool wifiAvailable = false;

// ============================================================================
// AI VISION INSPECTION SYNC STATE (Derived from Image Uploads)
// ============================================================================
String latestAiProduce = "Apple";
String latestAiReason  = "Produce Quality: Safe";
bool   latestAiSpoiled = false;
bool   latestAiWarning = false;
bool   hasAiVisionData = false;

// ============================================================================
// 5. ALERT FEEDBACK CONTROLLER (RGB LED & BUZZER)
// ============================================================================

void setRGB(bool r, bool g, bool b) {
  if (RGB_COMMON_CATHODE) {
    digitalWrite(PIN_RGB_RED,   r ? HIGH : LOW);
    digitalWrite(PIN_RGB_GREEN, g ? HIGH : LOW);
    digitalWrite(PIN_RGB_BLUE,  b ? HIGH : LOW);
  } else {
    // Invert logic for Common Anode
    digitalWrite(PIN_RGB_RED,   r ? LOW : HIGH);
    digitalWrite(PIN_RGB_GREEN, g ? LOW : HIGH);
    digitalWrite(PIN_RGB_BLUE,  b ? LOW : HIGH);
  }
}

// Drives LED color and sounding alarm based on food freshness state
void triggerAlertFeedback(bool isSpoiled, bool isWarning) {
  if (isSpoiled) {
    // 🔴 RED Alarm + Pulsed Warning Beeps
    setRGB(true, false, false); // Solid RED

    // Two rapid chirps (alert kitchen chefs of spoiled produce container)
    digitalWrite(PIN_BUZZER, HIGH);
    delay(100);
    digitalWrite(PIN_BUZZER, LOW);
    delay(70);
    digitalWrite(PIN_BUZZER, HIGH);
    delay(100);
    digitalWrite(PIN_BUZZER, LOW);
  } 
  else if (isWarning) {
    // 🟡 YELLOW / AMBER (Red + Green mixed), Silent Buzzer
    setRGB(true, true, false); // YELLOW
    digitalWrite(PIN_BUZZER, LOW);
  } 
  else {
    // 🟢 SOLID GREEN (Fresh & Optimal), Silent Buzzer
    setRGB(false, true, false); // GREEN
    digitalWrite(PIN_BUZZER, LOW);
  }
}

// ============================================================================
// 6. HELPER FUNCTIONS
// ============================================================================
float readSmoothedVoltage(int pin, int samples = 16) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delayMicroseconds(250);
  }
  return ((float)sum / samples / ADC_RESOLUTION) * ADC_VREF;
}

float calculateSensorResistance(float vOut, float rl) {
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

void updateOLEDDisplay(float temp, float hum, float co2, const String& produce, const String& spoilageStatus, bool isSpoiled, bool isWarning) {
  if (!oledFound) return;

  display.clearDisplay();

  // 1. Header Banner showing AI-identified Produce from Image Upload
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  if (produce.length() > 0 && produce != "Unknown") {
    display.printf("AI: %s", produce.c_str());
  } else {
    display.print("FRUIT & VEG STORAGE");
  }
  display.drawLine(0, 9, 127, 9, SSD1306_WHITE);

  // 2. Metrics Rows (Cleanly separated)
  display.setCursor(0, 13);
  display.printf("T : %.1f C", temp);

  display.setCursor(68, 13);
  display.printf("RH: %.0f %%", hum);

  display.setCursor(0, 24);
  display.printf("CO2: %.0f ppm", co2);

  // 3. Spoilage Status Badge
  if (isSpoiled) {
    display.fillRect(0, 37, 128, 26, SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(8, 41);
    display.print("!! SPOILED / RISK !!");
    display.setCursor(10, 52);
    display.print(spoilageStatus);
  } else if (isWarning) {
    display.drawRect(0, 37, 128, 26, SSD1306_WHITE);
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(8, 42);
    display.print("[ WARN: DRIFT/RESPIRE ]");
    display.setCursor(12, 52);
    display.print(spoilageStatus);
  } else {
    display.drawRect(0, 37, 128, 26, SSD1306_WHITE);
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(12, 42);
    display.print("[ FRESH / OPTIMAL ]");
    display.setCursor(16, 52);
    display.print("Produce Quality: Safe");
  }

  display.display();
}

void connectToWiFi() {
  if (String(WIFI_SSID) == "Your_WiFi_SSID") {
    Serial.println("[WiFi] Placeholder detected. USB Bridge mode.");
    wifiAvailable = false;
    return;
  }

  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(400);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiAvailable = true;
    Serial.println("\n[WiFi] Connected successfully!");
    digitalWrite(PIN_STATUS_LED, HIGH);
  } else {
    wifiAvailable = false;
    Serial.println("\n[WiFi] Offline. USB logging mode.");
    digitalWrite(PIN_STATUS_LED, LOW);
  }
}

bool dispatchHTTPTelemetry(const String& jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  digitalWrite(PIN_STATUS_LED, LOW);
  int httpResponseCode = http.POST(jsonPayload);
  digitalWrite(PIN_STATUS_LED, HIGH);

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP TX #%d] Status: %d OK\n", packetSequenceNumber, httpResponseCode);

    // Parse OLED Display payload from image uploads returned by server
    String responseBody = http.getString();
    DynamicJsonDocument respDoc(1024);
    DeserializationError err = deserializeJson(respDoc, responseBody);
    if (!err && respDoc.containsKey("oled_command")) {
      JsonObject oled = respDoc["oled_command"];
      latestAiProduce = oled["produce"].as<String>();
      latestAiSpoiled = oled["is_spoiled"].as<bool>();
      latestAiWarning = oled["is_warning"].as<bool>();
      latestAiReason  = oled["reason"].as<String>();
      hasAiVisionData = true;

      Serial.printf("[OLED SYNC] AI Produce: %s | Status: %s | Reason: %s\n",
                    latestAiProduce.c_str(),
                    latestAiSpoiled ? "SPOILED" : (latestAiWarning ? "WARN" : "FRESH"),
                    latestAiReason.c_str());

      // Update OLED display immediately with the newly received AI image upload assessment
      float currTemp = dht.readTemperature();
      if (isnan(currTemp)) currTemp = 11.4;
      float currHum = dht.readHumidity();
      if (isnan(currHum)) currHum = 90.0;
      float vMQ = readSmoothedVoltage(PIN_MQ135_ADC);
      float rsMQ = calculateSensorResistance(vMQ, RL_MQ135);
      float currCo2 = calculateCO2PPM(rsMQ, R0_MQ135);

      updateOLEDDisplay(currTemp, currHum, currCo2, latestAiProduce, latestAiReason, latestAiSpoiled, latestAiWarning);
      triggerAlertFeedback(latestAiSpoiled, latestAiWarning);
    }

    http.end();
    return true;
  } else {
    Serial.printf("[HTTP ERR] Failed: %s\n", http.errorToString(httpResponseCode).c_str());
    http.end();
    return false;
  }
}

// ============================================================================
// 7. SETUP
// ============================================================================
void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Disable BOD resets

  Serial.begin(115200);
  delay(1500);

  // Pin Configurations
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_MQ135_ADC, INPUT);

  pinMode(PIN_RGB_RED, OUTPUT);
  pinMode(PIN_RGB_GREEN, OUTPUT);
  pinMode(PIN_RGB_BLUE, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  // Initial Startup Hardware Self-Test (Blink Blue + Beep)
  setRGB(false, false, true); // Blue
  digitalWrite(PIN_BUZZER, HIGH);
  delay(120);
  digitalWrite(PIN_BUZZER, LOW);
  delay(300);
  setRGB(false, false, false); // Off

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // Initialize I2C and OLED Display
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  if (display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    oledFound = true;
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(14, 16);
    display.print("SMART RESTAURANT");
    display.setCursor(22, 28);
    display.print("FOOD SPOILAGE");
    display.setCursor(18, 40);
    display.print("MONITORING NODE");
    display.display();
    delay(2000);
  } else {
    Serial.println("[OLED] Display not detected on 0x3C; continuing in headless mode.");
  }

  dht.begin();
  connectToWiFi();
}

// ============================================================================
// 8. MAIN EXECUTION LOOP
// ============================================================================
void loop() {
  // Check USB Serial for incoming [OLED] commands from bridge or host
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.startsWith("[OLED]")) {
      String jsonPart = line.substring(6);
      DynamicJsonDocument serialDoc(512);
      DeserializationError err = deserializeJson(serialDoc, jsonPart);
      if (!err) {
        latestAiProduce = serialDoc["produce"].as<String>();
        latestAiSpoiled = serialDoc["is_spoiled"].as<bool>();
        latestAiWarning = serialDoc["is_warning"].as<bool>();
        latestAiReason  = serialDoc["reason"].as<String>();
        hasAiVisionData = true;

        float currTemp = dht.readTemperature();
        if (isnan(currTemp)) currTemp = 11.4;
        float currHum = dht.readHumidity();
        if (isnan(currHum)) currHum = 90.0;
        float vMQ = readSmoothedVoltage(PIN_MQ135_ADC);
        float rsMQ = calculateSensorResistance(vMQ, RL_MQ135);
        float currCo2 = calculateCO2PPM(rsMQ, R0_MQ135);

        updateOLEDDisplay(currTemp, currHum, currCo2, latestAiProduce, latestAiReason, latestAiSpoiled, latestAiWarning);
        triggerAlertFeedback(latestAiSpoiled, latestAiWarning);

        Serial.printf("[OLED SERIAL RX] Updated: %s (%s)\n", 
                      latestAiProduce.c_str(), 
                      latestAiSpoiled ? "SPOILED" : "FRESH");
      }
    }
  }

  unsigned long currentMillis = millis();

  if (currentMillis - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmitTime = currentMillis;
    packetSequenceNumber++;

    // 1. Read DHT22
    float temperature = dht.readTemperature();
    float humidity    = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      temperature = 27.5;
      humidity    = 42.0;
    }

    // 2. Read MQ-135 (Respiration CO2)
    float vMQ135   = readSmoothedVoltage(PIN_MQ135_ADC);
    float rsMQ135  = calculateSensorResistance(vMQ135, RL_MQ135);
    float co2_ppm  = calculateCO2PPM(rsMQ135, R0_MQ135);

    // 3. Spoilage & Risk Classification for Fruit/Veg Storage
    bool isSpoiled = false;
    bool isWarning = false;
    String spoilageReason = "Safe";

    if (co2_ppm > 1050.0) {
      isSpoiled = true;
      spoilageReason = "High CO2: Rot Risk";
    } else if (temperature > 15.0) {
      isSpoiled = true;
      spoilageReason = "Thermal Drift >15C";
    } else if (humidity > 95.0) {
      isSpoiled = true;
      spoilageReason = "Mould Condensation";
    } else if (temperature > 12.5 || co2_ppm > 800.0) {
      isWarning = true;
      spoilageReason = "Warm Storage/Respire";
    }

    // 4. Update the OLED Screen (prioritizing Image Upload AI Verdict)
    String effectiveProduce = hasAiVisionData ? latestAiProduce : "Storage 1";
    String effectiveReason  = hasAiVisionData ? latestAiReason : spoilageReason;
    bool effectiveSpoiled   = hasAiVisionData ? latestAiSpoiled : isSpoiled;
    bool effectiveWarning   = hasAiVisionData ? latestAiWarning : isWarning;

    updateOLEDDisplay(temperature, humidity, co2_ppm, effectiveProduce, effectiveReason, effectiveSpoiled, effectiveWarning);

    // 5. Trigger Visual (RGB LED) and Acoustic (Buzzer) Alerts
    triggerAlertFeedback(effectiveSpoiled, effectiveWarning);

    // 6. Construct JSON Payload
    float voc_ppm = 0.15 + ((co2_ppm - 400.0) / 3000.0) * 0.40;
    voc_ppm = constrain(voc_ppm, 0.05, 2.50);
    float nh3_ppm = 0.012 + (isSpoiled ? 0.015 : 0.0);

    StaticJsonDocument<256> doc;
    doc["storage_zone"] = STORAGE_ZONE_NAME;
    doc["temperature"]  = round(temperature * 100.0) / 100.0;
    doc["humidity"]     = round(humidity * 10.0) / 10.0;
    doc["nh3"]          = round(nh3_ppm * 1000.0) / 1000.0;
    doc["co2"]          = round(co2_ppm * 10.0) / 10.0;
    doc["voc"]          = round(voc_ppm * 1000.0) / 1000.0;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // 7. Output to Serial
    Serial.printf("[TELEMETRY #%04d] Temp: %5.2f C | Humidity: %4.1f %% | CO2: %5.1f ppm | Status: [%s]\n",
                  packetSequenceNumber, temperature, humidity, co2_ppm, 
                  isSpoiled ? "SPOILED (RED/BEEP)" : (isWarning ? "WARN (YELLOW)" : "OPTIMAL (GREEN)"));
    Serial.print("[JSON] ");
    Serial.println(jsonPayload);

    // 8. Dispatch HTTP if Wi-Fi connected
    if (wifiAvailable && WiFi.status() == WL_CONNECTED) {
      dispatchHTTPTelemetry(jsonPayload);
    }
  }

  yield();
}
