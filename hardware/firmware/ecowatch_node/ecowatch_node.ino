/*
 * EcoWatch — ESP32 Sensor Node Firmware
 * Reads energy (CT clamp), water (flow sensor), and temperature.
 * Publishes readings via MQTT to the central broker every 5 seconds.
 *
 * Hardware:
 *   - ESP32 DevKit v1
 *   - SCT-013-030 CT Clamp → GPIO 35 (via burden resistor circuit)
 *   - ZMPT101B Voltage Sensor → GPIO 34
 *   - YF-S201 Water Flow Sensor → GPIO 25
 *   - DHT22 Temperature/Humidity → GPIO 4
 *   - SSD1306 OLED (optional) → I2C (GPIO 21/22)
 *   - Relay Module → GPIO 26
 *
 * Libraries needed (install via Arduino Library Manager):
 *   - PubSubClient (MQTT)
 *   - ArduinoJson
 *   - DHT sensor library (Adafruit)
 *   - Adafruit SSD1306 + GFX (for OLED)
 *   - EmonLib (for CT clamp energy monitoring)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "EmonLib.h"

// ─── CONFIG — CHANGE THESE ───
#define WIFI_SSID       "YourWiFiSSID"
#define WIFI_PASSWORD   "YourWiFiPassword"
#define MQTT_BROKER     "192.168.1.100"    // Raspberry Pi IP
#define MQTT_PORT       1883
#define MQTT_USER       ""                 // leave empty if no auth
#define MQTT_PASSWORD   ""

#define ZONE_ID         "hostel_a_floor_1" // unique per node
#define ZONE_NAME       "Hostel A - Floor 1"
#define NODE_ID         "node_01"

// ─── PIN DEFINITIONS ───
#define CT_CLAMP_PIN    35    // ADC pin for SCT-013 current sensor
#define VOLTAGE_PIN     34    // ADC pin for ZMPT101B voltage sensor
#define WATER_FLOW_PIN  25    // Digital interrupt pin for YF-S201
#define DHT_PIN         4     // DHT22 data pin
#define RELAY_PIN       26    // Relay control pin
#define DHT_TYPE        DHT22

// ─── CALIBRATION ───
#define CT_CALIBRATION      30.0   // Calibrate with a known load (Amps)
#define VOLTAGE_CALIBRATION 234.0  // Mains voltage (adjust for India: ~230V)
#define WATER_CALIBRATION   7.5    // YF-S201: 7.5 pulses per liter

// ─── INTERVALS ───
#define PUBLISH_INTERVAL    5000   // 5 seconds between MQTT publishes
#define SAMPLE_COUNT        1480   // Number of ADC samples for RMS (half-cycles)

// ─── MQTT TOPICS ───
#define TOPIC_ENERGY    "ecowatch/energy"
#define TOPIC_WATER     "ecowatch/water"
#define TOPIC_CLIMATE   "ecowatch/climate"
#define TOPIC_STATUS    "ecowatch/status"
#define TOPIC_COMMAND   "ecowatch/command/" NODE_ID

// ─── GLOBAL OBJECTS ───
WiFiClient    wifiClient;
PubSubClient  mqtt(wifiClient);
DHT           dht(DHT_PIN, DHT_TYPE);
EnergyMonitor emon;

// ─── WATER FLOW VARIABLES ───
volatile unsigned long pulseCount = 0;
float totalLiters = 0;
unsigned long lastFlowCheck = 0;

// ─── TIMING ───
unsigned long lastPublish = 0;

// ─── ISR for water flow ───
void IRAM_ATTR waterPulseISR() {
  pulseCount++;
}

// ─── SETUP ───
void setup() {
  Serial.begin(115200);
  Serial.println("\n🚀 EcoWatch Sensor Node Starting...");
  Serial.printf("   Zone: %s\n", ZONE_NAME);
  Serial.printf("   Node: %s\n", NODE_ID);

  // Pin modes
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  pinMode(WATER_FLOW_PIN, INPUT_PULLUP);

  // Water flow interrupt
  attachInterrupt(digitalPinToInterrupt(WATER_FLOW_PIN), waterPulseISR, FALLING);

  // Energy monitor
  emon.current(CT_CLAMP_PIN, CT_CALIBRATION);
  // emon.voltage(VOLTAGE_PIN, VOLTAGE_CALIBRATION, 1.7); // Uncomment for real power

  // DHT sensor
  dht.begin();

  // WiFi
  connectWiFi();

  // MQTT
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(onMqttMessage);
  mqtt.setBufferSize(512);
  connectMQTT();

  Serial.println("✅ Setup complete!\n");
}

// ─── MAIN LOOP ───
void loop() {
  if (!mqtt.connected()) {
    connectMQTT();
  }
  mqtt.loop();

  unsigned long now = millis();
  if (now - lastPublish >= PUBLISH_INTERVAL) {
    lastPublish = now;
    publishReadings();
  }
}

// ─── READ & PUBLISH ───
void publishReadings() {
  // ── Energy ──
  double irms = emon.calcIrms(SAMPLE_COUNT);  // RMS current (Amps)
  double power = irms * VOLTAGE_CALIBRATION;    // Apparent power (Watts)
  double energy_kwh = power / 1000.0;           // kW (instantaneous)

  // ── Water ──
  unsigned long pulses;
  noInterrupts();
  pulses = pulseCount;
  pulseCount = 0;
  interrupts();

  float litersPerSecond = pulses / WATER_CALIBRATION / (PUBLISH_INTERVAL / 1000.0);
  totalLiters += pulses / WATER_CALIBRATION;

  // ── Climate ──
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  // ── Publish energy ──
  {
    JsonDocument doc;
    doc["node"]      = NODE_ID;
    doc["zone"]      = ZONE_NAME;
    doc["zone_id"]   = ZONE_ID;
    doc["current_a"] = round2(irms);
    doc["power_w"]   = round2(power);
    doc["energy_kw"] = round2(energy_kwh);
    doc["voltage"]   = VOLTAGE_CALIBRATION;
    doc["timestamp"] = millis();

    char payload[256];
    serializeJson(doc, payload);
    mqtt.publish(TOPIC_ENERGY, payload);

    Serial.printf("⚡ Energy: %.2f A, %.1f W, %.3f kW\n", irms, power, energy_kwh);
  }

  // ── Publish water ──
  {
    JsonDocument doc;
    doc["node"]        = NODE_ID;
    doc["zone"]        = ZONE_NAME;
    doc["zone_id"]     = ZONE_ID;
    doc["flow_lps"]    = round2(litersPerSecond);
    doc["total_liters"]= round2(totalLiters);
    doc["total_kl"]    = round2(totalLiters / 1000.0);
    doc["timestamp"]   = millis();

    char payload[256];
    serializeJson(doc, payload);
    mqtt.publish(TOPIC_WATER, payload);

    Serial.printf("💧 Water: %.2f L/s, Total: %.1f L\n", litersPerSecond, totalLiters);
  }

  // ── Publish climate ──
  if (!isnan(temp) && !isnan(humidity)) {
    JsonDocument doc;
    doc["node"]        = NODE_ID;
    doc["zone"]        = ZONE_NAME;
    doc["zone_id"]     = ZONE_ID;
    doc["temperature"] = round2(temp);
    doc["humidity"]    = round2(humidity);
    doc["timestamp"]   = millis();

    char payload[256];
    serializeJson(doc, payload);
    mqtt.publish(TOPIC_CLIMATE, payload);

    Serial.printf("🌡️  Climate: %.1f°C, %.1f%% RH\n", temp, humidity);
  }
}

// ─── MQTT MESSAGE HANDLER (for relay control / nudge actions) ───
void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  char msg[length + 1];
  memcpy(msg, payload, length);
  msg[length] = '\0';

  Serial.printf("📩 MQTT Command: %s → %s\n", topic, msg);

  JsonDocument doc;
  deserializeJson(doc, msg);

  const char* action = doc["action"];
  if (action) {
    if (strcmp(action, "relay_on") == 0) {
      digitalWrite(RELAY_PIN, HIGH);
      publishStatus("relay_on");
      Serial.println("🔌 Relay ON — Equipment powered");
    }
    else if (strcmp(action, "relay_off") == 0) {
      digitalWrite(RELAY_PIN, LOW);
      publishStatus("relay_off");
      Serial.println("🔌 Relay OFF — Equipment shutdown");
    }
    else if (strcmp(action, "reset_water") == 0) {
      totalLiters = 0;
      publishStatus("water_counter_reset");
      Serial.println("💧 Water counter reset");
    }
  }
}

// ─── PUBLISH STATUS ───
void publishStatus(const char* status) {
  JsonDocument doc;
  doc["node"]   = NODE_ID;
  doc["zone"]   = ZONE_NAME;
  doc["status"] = status;
  doc["uptime"] = millis() / 1000;

  char payload[256];
  serializeJson(doc, payload);
  mqtt.publish(TOPIC_STATUS, payload);
}

// ─── WIFI CONNECTION ───
void connectWiFi() {
  Serial.printf("📶 Connecting to WiFi: %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n✅ WiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n❌ WiFi connection failed! Restarting...");
    ESP.restart();
  }
}

// ─── MQTT CONNECTION ───
void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.printf("🔗 Connecting to MQTT broker: %s...", MQTT_BROKER);

    String clientId = String("ecowatch-") + NODE_ID;
    bool connected = strlen(MQTT_USER) > 0
      ? mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)
      : mqtt.connect(clientId.c_str());

    if (connected) {
      Serial.println(" ✅ Connected!");
      mqtt.subscribe(TOPIC_COMMAND);
      publishStatus("online");
    } else {
      Serial.printf(" ❌ Failed (rc=%d). Retrying in 3s...\n", mqtt.state());
      delay(3000);
    }
  }
}

// ─── HELPERS ───
float round2(float value) {
  return round(value * 100.0) / 100.0;
}
