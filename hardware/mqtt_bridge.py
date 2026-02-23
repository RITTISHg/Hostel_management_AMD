"""
EcoWatch — MQTT-to-API Bridge
Subscribes to ESP32 MQTT topics, stores readings, and exposes them
to the Flask ML backend via a shared data store.

Run this alongside app.py on the Raspberry Pi.

Requirements:
  pip install paho-mqtt

Usage:
  python mqtt_bridge.py
"""

import json
import time
import threading
from datetime import datetime
from collections import deque

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("❌ Install paho-mqtt: pip install paho-mqtt")
    exit(1)

# ─── CONFIG ───
MQTT_BROKER = "localhost"   # Raspberry Pi localhost (Mosquitto)
MQTT_PORT = 1883
MQTT_TOPICS = [
    ("ecowatch/energy", 0),
    ("ecowatch/water", 0),
    ("ecowatch/climate", 0),
    ("ecowatch/status", 0),
]

# ─── SHARED DATA STORE ───
# Rolling buffer of last 1000 readings per type
energy_readings: deque = deque(maxlen=10000)
water_readings: deque = deque(maxlen=10000)
climate_readings: deque = deque(maxlen=5000)
node_status: dict = {}

# Lock for thread safety
data_lock = threading.Lock()


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        client.subscribe(MQTT_TOPICS)
        print(f"📡 Subscribed to {len(MQTT_TOPICS)} topics")
    else:
        print(f"❌ MQTT connection failed with code: {rc}")


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        payload['received_at'] = datetime.now().isoformat()
        topic = msg.topic

        with data_lock:
            if topic == "ecowatch/energy":
                energy_readings.append(payload)
                _log_reading("⚡", payload.get('zone', '?'),
                             f"{payload.get('power_w', 0):.1f} W")

            elif topic == "ecowatch/water":
                water_readings.append(payload)
                _log_reading("💧", payload.get('zone', '?'),
                             f"{payload.get('flow_lps', 0):.2f} L/s")

            elif topic == "ecowatch/climate":
                climate_readings.append(payload)
                _log_reading("🌡️ ", payload.get('zone', '?'),
                             f"{payload.get('temperature', 0):.1f}°C")

            elif topic == "ecowatch/status":
                node_id = payload.get('node', 'unknown')
                node_status[node_id] = payload

    except json.JSONDecodeError:
        print(f"⚠️  Invalid JSON on {msg.topic}: {msg.payload}")
    except Exception as e:
        print(f"⚠️  Error processing message: {e}")


def _log_reading(icon: str, zone: str, value: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"  [{ts}] {icon} {zone}: {value}")


def get_latest_readings(reading_type: str = 'energy', zone: str = 'all',
                         limit: int = 100) -> list:
    """Get recent readings — called by Flask API."""
    with data_lock:
        if reading_type == 'energy':
            source = list(energy_readings)
        elif reading_type == 'water':
            source = list(water_readings)
        elif reading_type == 'climate':
            source = list(climate_readings)
        else:
            source = []

    if zone != 'all':
        source = [r for r in source if zone.lower() in r.get('zone', '').lower()]

    return source[-limit:]


def get_node_status() -> dict:
    """Get status of all connected nodes."""
    with data_lock:
        return dict(node_status)


def send_command(node_id: str, action: str) -> bool:
    """Send a command to a specific ESP32 node (e.g., relay_off for nudge action)."""
    topic = f"ecowatch/command/{node_id}"
    payload = json.dumps({
        "action": action,
        "sent_at": datetime.now().isoformat(),
    })

    try:
        client.publish(topic, payload)
        print(f"📤 Command sent: {action} → {node_id}")
        return True
    except Exception as e:
        print(f"❌ Failed to send command: {e}")
        return False


# ─── MQTT CLIENT ───
client = mqtt.Client(client_id="ecowatch-bridge")
client.on_connect = on_connect
client.on_message = on_message


def start_bridge():
    """Start the MQTT bridge (blocking)."""
    print("🚀 EcoWatch MQTT Bridge Starting...")
    print(f"   Broker: {MQTT_BROKER}:{MQTT_PORT}")

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
        print("🔗 Connecting to MQTT broker...")
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down MQTT bridge...")
        client.disconnect()
    except ConnectionRefusedError:
        print(f"❌ Cannot connect to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        print("   Make sure Mosquitto is running: sudo systemctl start mosquitto")


if __name__ == '__main__':
    start_bridge()
