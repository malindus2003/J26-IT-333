/*
 * ======================================================================================
 * ESP32-CAM Optical Food Spoilage & Container Inspection Node
 * Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
 * Author: Maddumage M. S. (IT23348820)
 * Project: Smart Restaurant Management & Waste Reduction System (J26-IT-333)
 * Institution: SLIIT - Faculty of Computing (2026)
 * ======================================================================================
 * 
 * Target Board: AI-Thinker ESP32-CAM (OV2640 Sensor)
 * Compatible with ESP32 Arduino Core v2.x and v3.x (uses native esp_http_server)
 * 
 * Capabilities:
 *  1. Local HTTP Snapshot Server:
 *     - Listens on port 80 (e.g., http://<ip>/capture)
 *     - Snaps a high-quality JPEG upon HTTP request and streams binary image.
 *  2. Flash LED Illumination (GPIO 4):
 *     - Automatically illuminates dark cold storage containers/refrigerator shelves
 *       during capture, then turns off to save power and prevent heating produce.
 *  3. Periodic Push Option:
 *     - Can automatically HTTP POST frames to FastAPI backend (/api/vision/esp32/upload).
 * ======================================================================================
 */

#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"
#include <HTTPClient.h>

// ==========================================
// 1. Wi-Fi Configuration
// ==========================================
// Wi-Fi SSID and Password
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Central FastAPI Backend IP & Port
const char* BACKEND_SERVER_URL = "http://172.20.10.6:8000/api/vision/esp32/upload";

// Food Container Metadata
const char* CONTAINER_ID = "Container #C-101 (Fruit Chiller)";
const char* PRODUCE_CATEGORY = "Fruits"; // "Fruits" or "Vegetables"

// Optional Periodic Auto-Push (0 = disabled, snapshot pull mode only)
const unsigned long AUTO_PUSH_INTERVAL_MS = 0; // Set e.g. 15000 for 15s push

// ==========================================
// 2. AI-Thinker ESP32-CAM Pin Configuration
// ==========================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define FLASH_LED_PIN      4 // High-power onboard flash LED
#define STATUS_LED_PIN    33 // Small red onboard indicator (Active LOW)

httpd_handle_t camera_httpd = NULL;
unsigned long lastPushTime = 0;

// ==========================================
// 3. Flash LED Control
// ==========================================
void turnOnFlash() {
  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(120); // Brief warm-up for exposure balance
}

void turnOffFlash() {
  digitalWrite(FLASH_LED_PIN, LOW);
}

// ==========================================
// 4. Native HTTP Server Handlers
// ==========================================

// Handler: GET /capture - Snaps frame and streams binary JPEG
static esp_err_t capture_handler(httpd_req_t *req) {
  digitalWrite(STATUS_LED_PIN, LOW); // LED ON
  turnOnFlash();

  camera_fb_t * fb = esp_camera_fb_get();
  turnOffFlash();

  if (!fb) {
    digitalWrite(STATUS_LED_PIN, HIGH); // LED OFF
    Serial.println("[ESP32-CAM] ERROR: Camera capture failed!");
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }

  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=capture.jpg");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  esp_err_t res = httpd_resp_send(req, (const char *)fb->buf, fb->len);
  
  esp_camera_fb_return(fb);
  digitalWrite(STATUS_LED_PIN, HIGH); // LED OFF
  Serial.printf("[ESP32-CAM] Frame streamed (%u bytes)\n", fb->len);
  return res;
}

// Handler: GET /status - Returns JSON metadata
static esp_err_t status_handler(httpd_req_t *req) {
  String json = "{";
  json += "\"status\":\"online\",";
  json += "\"node\":\"ESP32-CAM-Produce-Scanner\",";
  json += "\"container\":\"" + String(CONTAINER_ID) + "\",";
  json += "\"category\":\"" + String(PRODUCE_CATEGORY) + "\",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"uptime_ms\":" + String(millis());
  json += "}";

  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  return httpd_resp_send(req, json.c_str(), json.length());
}

// Handler: GET / - Web dashboard
static esp_err_t index_handler(httpd_req_t *req) {
  String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<title>Smart Restaurant ESP32-CAM Optical Node</title>";
  html += "<style>body{font-family:Arial,sans-serif;margin:20px;background:#f0fdf4;color:#1e293b;text-align:center;}";
  html += ".card{max-width:480px;margin:auto;background:white;padding:24px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.08);}";
  html += "h2{color:#059669;margin-bottom:8px;}";
  html += ".btn{display:inline-block;padding:12px 24px;background:#059669;color:white;text-decoration:none;border-radius:10px;font-weight:bold;margin-top:16px;}";
  html += "img{max-width:100%;border-radius:12px;margin-top:16px;border:2px solid #e2e8f0;}";
  html += "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2>📷 ESP32-CAM Optical Node</h2>";
  html += "<p><b>Component 3:</b> Food Spoilage & Quality Assessment</p>";
  html += "<p><b>Container:</b> " + String(CONTAINER_ID) + "</p>";
  html += "<p><b>Local IP:</b> <code>http://" + WiFi.localIP().toString() + "</code></p>";
  html += "<a href='/capture' target='_blank' class='btn'>📸 View Live Snapshot</a>";
  html += "<div><img src='/capture' id='cam' alt='Live Frame' /></div>";
  html += "<p style='font-size:12px;color:#64748b;margin-top:16px;'>Backend Endpoint: <code>" + String(BACKEND_SERVER_URL) + "</code></p>";
  html += "</div></body></html>";

  httpd_resp_set_type(req, "text/html");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  return httpd_resp_send(req, html.c_str(), html.length());
}

// Start native HTTP server
void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;

  httpd_uri_t index_uri = {
    .uri       = "/",
    .method    = HTTP_GET,
    .handler   = index_handler,
    .user_ctx  = NULL
  };

  httpd_uri_t capture_uri = {
    .uri       = "/capture",
    .method    = HTTP_GET,
    .handler   = capture_handler,
    .user_ctx  = NULL
  };

  httpd_uri_t status_uri = {
    .uri       = "/status",
    .method    = HTTP_GET,
    .handler   = status_handler,
    .user_ctx  = NULL
  };

  if (httpd_start(&camera_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &index_uri);
    httpd_register_uri_handler(camera_httpd, &capture_uri);
    httpd_register_uri_handler(camera_httpd, &status_uri);
    Serial.println("[ESP32-CAM] Native HTTP Server started on port 80");
  } else {
    Serial.println("[ESP32-CAM] ERROR: Failed to start HTTP server!");
  }
}

// ==========================================
// 5. Push Frame to FastAPI Backend (Optional)
// ==========================================
void postSnapshotToBackend() {
  turnOnFlash();
  camera_fb_t * fb = esp_camera_fb_get();
  turnOffFlash();

  if (!fb) {
    Serial.println("[ESP32-CAM] Capture failed for auto-push");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  String uploadUrl = String(BACKEND_SERVER_URL);
  if (http.begin(client, uploadUrl)) {
    http.addHeader("Content-Type", "image/jpeg");
    http.addHeader("X-Container-ID", CONTAINER_ID);
    http.addHeader("X-Produce-Category", PRODUCE_CATEGORY);

    int httpCode = http.POST(fb->buf, fb->len);
    if (httpCode > 0) {
      Serial.printf("[ESP32-CAM] Pushed frame to backend. HTTP Code: %d\n", httpCode);
      String payload = http.getString();
      Serial.println("[ESP32-CAM] Backend response: " + payload);
    } else {
      Serial.printf("[ESP32-CAM] POST failed. Error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }

  esp_camera_fb_return(fb);
}

// ==========================================
// 6. Setup & Initialization
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(false);
  Serial.println("\n\n================================================");
  Serial.println("  Smart Restaurant ESP32-CAM Food Spoilage Node ");
  Serial.println("  Component 3 - Research Project J26-IT-333      ");
  Serial.println("================================================");

  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);
  
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, HIGH); // OFF (Active LOW)

  // Configure Camera Sensor
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Frame size & quality (VGA 640x480 is optimal balance of speed & detail)
  if (psramFound()) {
    config.frame_size = FRAMESIZE_VGA; // 640x480
    config.jpeg_quality = 10;          // 0-63 (lower = higher quality)
    config.fb_count = 2;
    Serial.println("[ESP32-CAM] PSRAM detected! VGA High-Quality mode initialized.");
  } else {
    config.frame_size = FRAMESIZE_QVGA; // 320x240
    config.jpeg_quality = 14;
    config.fb_count = 1;
    Serial.println("[ESP32-CAM] PSRAM not found. QVGA mode initialized.");
  }

  // Camera Init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[ESP32-CAM] Camera init failed with error 0x%x\n", err);
    // Flash status LED rapidly on failure
    while(true) {
      digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
      delay(150);
    }
  }

  // Adjust camera sensor tuning for optimal color fidelity
  sensor_t * s = esp_camera_sensor_get();
  if (s != NULL) {
    s->set_brightness(s, 1);    // -2 to 2
    s->set_contrast(s, 1);      // -2 to 2
    s->set_saturation(s, 1);    // -2 to 2
    s->set_whitebal(s, 1);      // Auto White Balance
    s->set_awb_gain(s, 1);
  }

  // Connect to Wi-Fi
  Serial.printf("[ESP32-CAM] Connecting to Wi-Fi: %s ...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
    attempts++;
  }
  digitalWrite(STATUS_LED_PIN, HIGH);

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[ESP32-CAM] Wi-Fi Connected Successfully!");
    Serial.print("[ESP32-CAM] IP Address: http://");
    Serial.println(WiFi.localIP());
    Serial.println("[ESP32-CAM] Snapshot URL: http://" + WiFi.localIP().toString() + "/capture");
    
    // Start native HTTP Server
    startCameraServer();
  } else {
    Serial.println("\n[ESP32-CAM] Wi-Fi Connection Timeout! Running in offline mode.");
  }
}

// ==========================================
// 7. Main Loop
// ==========================================
void loop() {
  // esp_http_server runs in its own FreeRTOS background task,
  // so no server.handleClient() is required in loop()!

  // Handle optional periodic push
  if (AUTO_PUSH_INTERVAL_MS > 0 && WiFi.status() == WL_CONNECTED) {
    if (millis() - lastPushTime >= AUTO_PUSH_INTERVAL_MS) {
      lastPushTime = millis();
      Serial.println("[ESP32-CAM] Triggering periodic frame push to backend...");
      postSnapshotToBackend();
    }
  }
  delay(10);
}
