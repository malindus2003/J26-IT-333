/*
 * ==============================================================================
 * SLIIT IT4010 Research Project 2026 - Group J26-IT-333
 * Component 4: Smart Waste Bin Identification & Monitoring
 * Researcher: Pathirana P.R.T (IT23324060)
 *
 * ESP32 Hardware Firmware: Food Waste Bin Ultrasonic Fill Level Monitor
 * Sensor: HC-SR04 Ultrasonic Distance Sensor
 * Microcontroller: ESP32 Development Board (NodeMCU / DevKit V1)
 * ==============================================================================
 *
 * Hardware Wiring:
 *   - HC-SR04 VCC  --> ESP32 5V (VIN / 5V rail)
 *   - HC-SR04 GND  --> ESP32 GND
 *   - HC-SR04 TRIG --> ESP32 GPIO 5
 *   - HC-SR04 ECHO --> ESP32 GPIO 18 (Use a voltage divider: 1kΩ + 2kΩ resistors
 *                      to step down 5V echo to 3.3V safe logic for ESP32)
 *
 * Calibration & Geometry:
 *   - Empty bin distance (EMPTY_CM) = 35.0 cm  -->  0.0% fill
 *   - Full bin distance  (FULL_CM)  =  8.0 cm  --> 100.0% fill
 *   - Speed of sound in air         = 0.0343 cm/µs
 *   - pulseIn() timeout             = 30,000 µs (~5.1 meters max range)
 *
 * Academic Integrity & Data Honesty Rules:
 *   - If no echo pulse is detected (timeout/out-of-range), report sensor_status: "no_echo"
 *     and send fill_level_percent as null. NEVER report 0% full on sensor failure!
 *   - Weight is NOT measured by HC-SR04. Never invent or synthesize fake load cell weights.
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>

// ==========================================
// 1. PIN & CALIBRATION CONFIGURATION
// ==========================================
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

const float EMPTY_CM = 35.0; // Distance when bin is completely empty
const float FULL_CM  =  8.0; // Distance when bin is full to threshold

const unsigned long PULSE_TIMEOUT_US = 30000; // 30,000 µs echo timeout
const unsigned long TELEMETRY_INTERVAL_MS = 2000; // Stream readings every ~2 seconds
const unsigned int  HTTP_TIMEOUT_MS = 3000;      // 3-second bounded HTTP timeout

// ==========================================
// 2. NETWORK & BACKEND CONFIGURATION
// ==========================================
// Replace with your local Wi-Fi credentials (both ESP32 and laptop must be on this network):
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Laptop LAN IPv4 Address running FastAPI backend:
// (Run 'Get-NetIPAddress' on laptop to confirm. Detected LAN IP: 10.188.212.232)
const char* BACKEND_HOST = "10.188.212.232";
const int   BACKEND_PORT = 8000;

// Device & Component Metadata
const char* DEVICE_ID = "esp32-waste-food-01";
const char* SOURCE_ID = "ESP32 Ultrasonic (HC-SR04)";

// Telemetry Endpoint URL
String telemetryUrl;

// Timestamp tracking for non-blocking loop
unsigned long lastTelemetryTime = 0;

// ==========================================
// 3. ULTRASONIC MEASUREMENT FUNCTION
// ==========================================
struct UltrasonicReading {
  bool isValid;
  float distanceCm;
  float fillPercent;
};

UltrasonicReading readUltrasonicSensor() {
  UltrasonicReading reading;
  reading.isValid = false;
  reading.distanceCm = -1.0;
  reading.fillPercent = -1.0;

  // Clear trigger pin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  // Send 10µs ultrasonic burst
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Measure echo pulse width (microseconds)
  unsigned long durationUs = pulseIn(ECHO_PIN, HIGH, PULSE_TIMEOUT_US);

  if (durationUs == 0) {
    // Sensor timed out or echo beam scattered / unreflected
    Serial.println(F("[SENSOR WARNING] HC-SR04 Echo Timeout (duration = 0 µs). Sensor reading unavailable."));
    return reading; // isValid = false
  }

  // Calculate distance in centimeters: distance = (duration * sound_speed) / 2
  float distance = (float)durationUs * 0.0343 / 2.0;

  // Physical sanity check (HC-SR04 reliable range: 2cm to 400cm)
  if (distance < 2.0 || distance > 400.0) {
    Serial.print(F("[SENSOR WARNING] HC-SR04 Distance out of physical bounds: "));
    Serial.print(distance);
    Serial.println(F(" cm"));
    return reading; // isValid = false
  }

  // Calculate calibrated fill percentage
  // fill_percent = (35.0 - distance_cm) / (35.0 - 8.0) * 100.0
  float fill = (EMPTY_CM - distance) / (EMPTY_CM - FULL_CM) * 100.0;
  fill = constrain(fill, 0.0, 100.0);

  reading.isValid = true;
  reading.distanceCm = distance;
  reading.fillPercent = fill;
  return reading;
}

// ==========================================
// 4. WI-FI RECONNECTION HELPER
// ==========================================
void ensureWiFiConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.println();
  Serial.print(F("[WIFI] Connecting to "));
  Serial.print(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    delay(500);
    Serial.print(F("."));
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print(F("[WIFI] Connected! ESP32 Assigned IP: "));
    Serial.println(WiFi.localIP());
    Serial.print(F("[WIFI] Signal Strength (RSSI): "));
    Serial.print(WiFi.RSSI());
    Serial.println(F(" dBm"));
  } else {
    Serial.println();
    Serial.println(F("[WIFI ERROR] Connection timeout. Will retry next cycle."));
  }
}

// ==========================================
// 5. HTTP TELEMETRY TRANSMISSION
// ==========================================
void sendTelemetry(const UltrasonicReading& reading) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[HTTP] Skipped send - Wi-Fi is not connected."));
    return;
  }

  HTTPClient http;
  http.setTimeout(HTTP_TIMEOUT_MS);

  if (!http.begin(telemetryUrl)) {
    Serial.println(F("[HTTP ERROR] Failed to initialize connection to endpoint."));
    return;
  }

  http.addHeader("Content-Type", "application/json");

  // Construct JSON payload conforming strictly to backend BinTelemetryUpdate schema
  String payload;
  if (reading.isValid) {
    payload = "{";
    payload += "\"fill_level_percent\":" + String(reading.fillPercent, 1) + ",";
    payload += "\"distance_cm\":" + String(reading.distanceCm, 1) + ",";
    payload += "\"sensor_status\":\"valid\",";
    payload += "\"source\":\"" + String(SOURCE_ID) + "\",";
    payload += "\"device_id\":\"" + String(DEVICE_ID) + "\"";
    // NOTE: current_weight_kg is intentionally omitted.
    // Ultrasonic does not measure weight; load cell is not yet integrated.
    payload += "}";
  } else {
    // Academic honesty: No echo means unavailable, never 0%
    payload = "{";
    payload += "\"fill_level_percent\":null,";
    payload += "\"distance_cm\":null,";
    payload += "\"sensor_status\":\"no_echo\",";
    payload += "\"source\":\"" + String(SOURCE_ID) + "\",";
    payload += "\"device_id\":\"" + String(DEVICE_ID) + "\"";
    payload += "}";
  }

  Serial.println(F("--------------------------------------------------"));
  Serial.print(F("[TELEMETRY POST] Sending to: "));
  Serial.println(telemetryUrl);
  Serial.print(F("[PAYLOAD] "));
  Serial.println(payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.print(F("[HTTP STATUS] "));
    Serial.print(httpCode);
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
      Serial.println(F(" OK (Processed by FastAPI)"));
      String response = http.getString();
      Serial.print(F("[SERVER RESPONSE] "));
      Serial.println(response);
    } else {
      Serial.print(F(" (Unexpected response code: "));
      Serial.print(httpCode);
      Serial.println(F(")"));
    }
  } else {
    Serial.print(F("[HTTP ERROR] Connection failed. Error: "));
    Serial.println(http.errorToString(httpCode));
    Serial.println(F("   -> Check Windows Firewall inbound rule on port 8000."));
    Serial.println(F("   -> Confirm FastAPI backend is running with: --host 0.0.0.0"));
  }

  http.end();
}

// ==========================================
// 6. SETUP & MAIN LOOP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println(F("=================================================="));
  Serial.println(F(" SLIIT IT4010 Research Project 2026 (Group J26-IT-333)"));
  Serial.println(F(" Component 4: Smart Waste Bin Identification"));
  Serial.println(F(" Food Waste Bin Ultrasonic Telemetry (HC-SR04)"));
  Serial.println(F("=================================================="));

  // Configure HC-SR04 ultrasonic pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  // Construct target telemetry URL
  telemetryUrl = "http://" + String(BACKEND_HOST) + ":" + String(BACKEND_PORT) + "/api/waste/bins/food/telemetry";
  Serial.print(F("[CONFIG] Backend Target: "));
  Serial.println(telemetryUrl);

  // Connect to Wi-Fi
  ensureWiFiConnected();
}

void loop() {
  unsigned long currentMillis = millis();

  // Maintain Wi-Fi connectivity
  if (WiFi.status() != WL_CONNECTED) {
    ensureWiFiConnected();
  }

  // Execute reading and transmission every TELEMETRY_INTERVAL_MS (~2 seconds)
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = currentMillis;

    // 1. Acquire HC-SR04 reading
    UltrasonicReading reading = readUltrasonicSensor();

    // 2. Serial Diagnostics
    if (reading.isValid) {
      Serial.print(F("[SENSOR READ] Distance: "));
      Serial.print(reading.distanceCm, 1);
      Serial.print(F(" cm | Fill Level: "));
      Serial.print(reading.fillPercent, 1);
      Serial.println(F(" %"));
    } else {
      Serial.println(F("[SENSOR READ] Distance: UNAVAILABLE (No Echo) | Fill Level: UNAVAILABLE"));
    }

    // 3. Transmit to backend
    sendTelemetry(reading);
  }

  delay(20); // Yield to ESP32 RTOS background watchdog
}
