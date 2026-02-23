# 🔧 EcoWatch — Hardware Prototype Guide

## Overview

This guide explains how to build a **physical prototype** that feeds real sensor data into the EcoWatch dashboard. Each sensor node uses an **ESP32** microcontroller to read energy, water, and environmental data, then transmits it via **MQTT** over WiFi.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SENSOR LAYER                             │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ Node 01 │  │ Node 02 │  │ Node 03 │  │ Node 04 │   ...     │
│  │ Hostel  │  │ Hostel  │  │  Lab    │  │  Main   │          │
│  │ A - F1  │  │ A - F2  │  │  Elec   │  │  Bldg   │          │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘          │
│       │            │            │            │                 │
│       └────────────┴────────────┴────────────┘                 │
│                         WiFi / MQTT                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EDGE SERVER (Raspberry Pi 4)                │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────┐           │
│  │Mosquitto │  │ MQTT Bridge  │  │  Flask ML API  │           │
│  │  Broker  │→ │ (mqtt_bridge │→ │  (app.py)      │           │
│  │          │  │   .py)       │  │  + ML Models   │           │
│  └──────────┘  └──────────────┘  └───────┬────────┘           │
└──────────────────────────────────────────┬────────────────────┘
                                           │ REST API
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Any Device)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │  React Dashboard (EcoWatch)                       │          │
│  │  http://raspberrypi.local:5173                   │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛒 Bill of Materials

### Per Sensor Node (~₹1,200/node)

| Component | Model | Cost (₹) | Purchase Link |
|---|---|---|---|
| Microcontroller | ESP32 DevKit v1 (30-pin) | ₹450 | Robocraze / Amazon |
| Current Sensor | SCT-013-030 (30A CT Clamp) | ₹200 | Robu.in |
| Voltage Sensor | ZMPT101B AC Voltage Module | ₹150 | Robu.in |
| Water Flow Sensor | YF-S201 (1–30 L/min) | ₹180 | Amazon |
| Temp + Humidity | DHT22 Module | ₹250 | Amazon |
| Burden Resistor | 33Ω 1% (for CT clamp) | ₹10 | Electronics store |
| Capacitors | 10µF × 2 (for CT bias) | ₹10 | Electronics store |
| Jumper Wires | M-M, M-F pack | ₹80 | Amazon |

### Central Server (one-time)

| Component | Model | Cost (₹) | Purpose |
|---|---|---|---|
| Raspberry Pi 4 | 4GB RAM | ₹4,500 | MQTT broker + Flask API |
| SD Card | 32GB Class 10 | ₹400 | OS + Data storage |
| Power Supply | RPi official 5V 3A | ₹500 | Power the Pi |

### Optional Add-ons

| Component | Cost (₹) | Purpose |
|---|---|---|
| SSD1306 OLED 0.96" | ₹180 | Local display on node |
| 4-Channel Relay Module | ₹150 | Remote equipment shutoff |
| LoRa SX1278 Module | ₹350/pair | Long-range for outdoor zones |
| Waterproof Enclosure | ₹200 | Protect outdoor nodes |

### 💰 Total Prototype Cost

| Setup | Zones | Cost |
|---|---|---|
| **Minimum** (3 nodes) | 3 zones | ~₹8,500 |
| **Recommended** (5 nodes + extras) | 5 zones | ~₹12,000 |
| **Full pilot** (8 nodes + LoRa) | 8 zones | ~₹18,000 |

---

## ⚡ Wiring Diagram — CT Clamp Circuit

```
                    3.3V
                     │
                     ├──[10µF]──┐
                     │          │
   SCT-013    ┌──────┤     GPIO 35 (ADC)
   CT Clamp ──┤      │          │
              │  [33Ω Burden]   │
              │      │          │
              └──────┤     ┌──[10µF]──┐
                     │     │          │
                    GND   GND        GND

   Note: The 33Ω burden resistor converts current to voltage.
   The two 10µF caps create a 1.65V DC bias so the ADC can
   read the AC waveform (which swings ±).
```

## 💧 Wiring Diagram — Water Flow Sensor

```
   YF-S201
   ┌──────┐
   │ RED  │──── 5V (VIN on ESP32)
   │ BLACK│──── GND
   │YELLOW│──── GPIO 25 + 10kΩ pull-up to 3.3V
   └──────┘

   The sensor outputs pulses proportional to flow rate:
   7.5 pulses = 1 liter of water
```

---

## 🔧 Software Setup — Raspberry Pi

### 1. Install Mosquitto MQTT Broker
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients -y
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Test: subscribe to all EcoWatch topics
mosquitto_sub -t "ecowatch/#" -v
```

### 2. Install Python Dependencies
```bash
cd hardware
pip install paho-mqtt

cd ../ml_backend
pip install -r requirements.txt
```

### 3. Run the Stack
```bash
# Terminal 1 — MQTT Bridge (connects sensors to Flask)
cd hardware
python mqtt_bridge.py

# Terminal 2 — Flask ML API
cd ml_backend
python app.py

# Terminal 3 — React Frontend
npm run dev
```

---

## 📟 ESP32 Firmware Setup

### 1. Install Arduino IDE + ESP32 Board
- Open Arduino IDE → Preferences
- Add Board URL: `https://dl.espressif.com/dl/package_esp32_index.json`
- Tools → Board → ESP32 Dev Module

### 2. Install Libraries
Search in Library Manager and install:
- `PubSubClient` (Nick O'Leary)
- `ArduinoJson` (Benoit Blanchon)
- `DHT sensor library` (Adafruit)
- `EmonLib` (OpenEnergyMonitor)
- `Adafruit SSD1306` (if using OLED)

### 3. Configure & Upload
- Open `hardware/firmware/ecowatch_node/ecowatch_node.ino`
- Update these values:
  ```cpp
  #define WIFI_SSID       "YourWiFi"
  #define WIFI_PASSWORD   "YourPassword"
  #define MQTT_BROKER     "192.168.1.100"  // RPi's IP
  #define ZONE_ID         "hostel_a_floor_1"
  #define ZONE_NAME       "Hostel A - Floor 1"
  #define NODE_ID         "node_01"
  ```
- Select ESP32 Dev Module, correct COM port
- Upload!

### 4. Verify
Open Serial Monitor (115200 baud). You should see:
```
🚀 EcoWatch Sensor Node Starting...
   Zone: Hostel A - Floor 1
   Node: node_01
📶 Connecting to WiFi: YourWiFi...
✅ WiFi connected! IP: 192.168.1.42
🔗 Connecting to MQTT broker: 192.168.1.100... ✅ Connected!
✅ Setup complete!

⚡ Energy: 2.45 A, 571.5 W, 0.572 kW
💧 Water: 0.12 L/s, Total: 45.3 L
🌡️  Climate: 26.3°C, 62.0% RH
```

---

## 🧪 Testing Without Hardware

Don't have sensors yet? You can simulate ESP32 nodes from your laptop:

```bash
# Install mosquitto-clients
sudo apt install mosquitto-clients

# Simulate an energy reading
mosquitto_pub -h localhost -t "ecowatch/energy" -m '{
  "node": "test_01",
  "zone": "Hostel A - Floor 1",
  "zone_id": "hostel_a_floor_1",
  "current_a": 2.45,
  "power_w": 571.5,
  "energy_kw": 0.572,
  "voltage": 233
}'

# Simulate a water reading
mosquitto_pub -h localhost -t "ecowatch/water" -m '{
  "node": "test_01",
  "zone": "Hostel A - Floor 1",
  "zone_id": "hostel_a_floor_1",
  "flow_lps": 0.12,
  "total_liters": 45.3,
  "total_kl": 0.045
}'
```

---

## 📡 MQTT Topic Structure

| Topic | Publisher | Payload |
|---|---|---|
| `ecowatch/energy` | ESP32 Node | `{node, zone, current_a, power_w, energy_kw}` |
| `ecowatch/water` | ESP32 Node | `{node, zone, flow_lps, total_liters, total_kl}` |
| `ecowatch/climate` | ESP32 Node | `{node, zone, temperature, humidity}` |
| `ecowatch/status` | ESP32 Node | `{node, zone, status, uptime}` |
| `ecowatch/command/{node_id}` | Server → Node | `{action: "relay_off"}` |

---

## 🔐 Security Considerations (for campus deployment)

1. **MQTT Auth**: Enable username/password in Mosquitto config
2. **TLS**: Use MQTT over TLS (port 8883) for encrypted communication
3. **Firewall**: Only allow ESP32 IPs to connect to the MQTT broker
4. **OTA Updates**: Use ESP32's OTA capability to update firmware remotely
5. **Watchdog**: ESP32 watchdog timer auto-restarts on crashes
