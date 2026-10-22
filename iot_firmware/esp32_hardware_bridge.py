"""
=========================================================================================
SLIIT IT4010 Research Project - SST (J26-IT-333)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

ESP32 Hardware Bridge & Telemetry Ingestion Driver (DHT22 + MQ-135)
=========================================================================================
Usage Modes:
  1. Live USB Serial Mode (Connects to physical ESP32):
     python esp32_hardware_bridge.py --port COM3 --baud 115200

  2. Live Presentation / Demo Simulation Mode (No physical ESP32 required):
     python esp32_hardware_bridge.py --simulate --zone "Zone 1: Tropical Fruit Chiller (11°C)"
=========================================================================================
"""

import sys
import time
import json
import random
import argparse
import datetime
import requests

DEFAULT_BACKEND_URL = "http://localhost:8000/api/sensors/telemetry"

def auto_detect_serial_port() -> str:
    """Auto-detect connected ESP32 / USB serial device."""
    try:
        import serial.tools.list_ports
        ports = list(serial.tools.list_ports.comports())
        if not ports:
            return "COM3"
        for p in ports:
            desc = p.description.lower()
            if any(keyword in desc for keyword in ["cp210", "ch340", "uart", "usb serial", "esp32"]):
                return p.device
        return ports[0].device
    except Exception:
        return "COM3"

def run_simulation(backend_url: str, zone_name: str, interval: float = 4.0):
    """
    Simulates high-fidelity ESP32 sensor telemetry streaming into the FastAPI backend.
    Used for testing model reactions to environmental spikes or offline demos.
    """
    print("=" * 70)
    print("  ESP32 TELEMETRY HARDWARE EMULATOR & BRIDGE")
    print(f"  Target Storage Zone : {zone_name}")
    print(f"  Backend Ingest URL  : {backend_url}")
    print(f"  Streaming Interval  : {interval} seconds")
    print("=" * 70)
    print("Press Ctrl+C to terminate the bridge.\n")

    base_temp = 11.2
    base_hum = 88.5
    base_nh3 = 0.015
    base_co2 = 510.0
    base_voc = 0.32

    packet_id = 0

    try:
        while True:
            packet_id += 1
            
            noise_temp = random.uniform(-0.3, 0.4)
            noise_hum = random.uniform(-1.2, 1.2)
            noise_nh3 = random.uniform(-0.002, 0.003)
            noise_co2 = random.uniform(-15.0, 20.0)
            noise_voc = random.uniform(-0.02, 0.03)

            current_temp = round(max(2.0, base_temp + noise_temp), 2)
            current_hum = round(min(98.0, max(50.0, base_hum + noise_hum)), 1)
            current_nh3 = round(max(0.005, base_nh3 + noise_nh3), 4)
            current_co2 = round(max(400.0, base_co2 + noise_co2), 1)
            current_voc = round(max(0.05, base_voc + noise_voc), 3)

            payload = {
                "storage_zone": zone_name,
                "temperature": current_temp,
                "humidity": current_hum,
                "nh3": current_nh3,
                "co2": current_co2,
                "voc": current_voc
            }

            now_str = datetime.datetime.now().strftime("%H:%M:%S")

            try:
                resp = requests.post(backend_url, json=payload, timeout=3.0)
                if resp.status_code == 200:
                    res_data = resp.json()
                    status = res_data.get("data", {}).get("status", "optimal").upper()
                    print(f"[{now_str}] Packet #{packet_id:04d} -> {zone_name[:20]}... | "
                          f"T: {current_temp:5.2f}°C | H: {current_hum:4.1f}% | "
                          f"CO2: {current_co2:5.1f}ppm | Status: [{status}] (HTTP 200 OK)")
                else:
                    print(f"[{now_str}] Packet #{packet_id:04d} -> Server Error: HTTP {resp.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"[{now_str}] Packet #{packet_id:04d} -> Connection Error: {e}")

            time.sleep(interval)

    except KeyboardInterrupt:
        print("\n[Bridge] Simulation terminated by user.")

def run_serial_bridge(port: str, baud: int, backend_url: str):
    """
    Reads physical raw serial UART lines from connected ESP32,
    extracts the telemetry JSON payload, and dispatches it to the FastAPI backend.
    """
    try:
        import serial
        import serial.tools.list_ports
    except ImportError:
        print("[ERROR] pyserial is not installed. Please run: pip install pyserial")
        sys.exit(1)

    # Validate port existence
    available_ports = [p.device for p in serial.tools.list_ports.comports()]
    if port not in available_ports:
        detected = auto_detect_serial_port()
        if detected in available_ports:
            print(f"[Serial Bridge] Specified port {port} not found. Auto-switching to detected port: {detected}")
            port = detected
        else:
            print(f"[WARNING] Available COM ports: {available_ports}")

    print("=" * 70)
    print("  ESP32 PHYSICAL HARDWARE BRIDGE (DHT22 + MQ-135)")
    print(f"  Target Serial Port : {port} ({baud} baud)")
    print(f"  Backend Ingest URL : {backend_url}")
    print("=" * 70)
    
    try:
        ser = serial.Serial(port, baud, timeout=1.0)
        time.sleep(2.0)  # Wait for ESP32 boot
        print(f"[Serial Bridge] Successfully connected to {port}! Listening for live telemetry...\n")
    except Exception as e:
        print(f"[ERROR] Failed to open serial port {port}: {e}")
        print("Tip: Check that Arduino Serial Monitor is CLOSED so this bridge can access the port.")
        sys.exit(1)

    try:
        while True:
            raw_line = ser.readline().decode('utf-8', errors='ignore').strip()
            if not raw_line:
                continue

            # Display readable telemetry in console
            if raw_line.startswith("[TELEMETRY"):
                print(f"[ESP32] {raw_line}")

            # Extract JSON string even if prepended with [JSON]
            json_str = None
            if "{" in raw_line and "}" in raw_line:
                start_idx = raw_line.find("{")
                end_idx = raw_line.rfind("}") + 1
                json_str = raw_line[start_idx:end_idx]

            if json_str:
                try:
                    payload = json.loads(json_str)
                    resp = requests.post(backend_url, json=payload, timeout=3.0)
                    now_str = datetime.datetime.now().strftime("%H:%M:%S")
                    if resp.status_code == 200:
                        res_json = resp.json()
                        status = res_json.get("data", {}).get("status", "optimal").upper()
                        print(f"[{now_str}] Ingested to Backend -> Status: [{status}] (HTTP 200 OK)")

                        # Transmit latest AI Vision OLED payload to physical ESP32
                        oled_cmd = res_json.get("oled_command")
                        if oled_cmd:
                            oled_str = json.dumps(oled_cmd)
                            ser.write(f"[OLED]{oled_str}\n".encode('utf-8'))
                            print(f"[{now_str}] -> Forwarded to physical OLED: {oled_cmd.get('produce')} [{oled_cmd.get('status')}]")
                    else:
                        print(f"[{now_str}] Backend Error: HTTP {resp.status_code}")
                except json.JSONDecodeError:
                    pass
                except requests.RequestException as re:
                    print(f"[Bridge Ingest] API dispatch failed: {re}")

    except KeyboardInterrupt:
        print("\n[Serial Bridge] Terminated by user.")
        ser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ESP32 Telemetry Hardware Bridge for Food Spoilage Node")
    parser.add_argument("--simulate", action="store_true", help="Run in simulation mode without physical hardware")
    parser.add_argument("--port", type=str, default="auto", help="Serial port of ESP32 (e.g. COM3 or auto)")
    parser.add_argument("--baud", type=int, default=115200, help="Serial baud rate (default: 115200)")
    parser.add_argument("--zone", type=str, default="Zone 1: Tropical Fruit Chiller (11°C)", help="Target storage zone")
    parser.add_argument("--url", type=str, default=DEFAULT_BACKEND_URL, help="FastAPI backend ingestion URL")
    parser.add_argument("--interval", type=float, default=4.0, help="Interval in seconds for simulated packets")

    args = parser.parse_args()

    target_port = auto_detect_serial_port() if args.port == "auto" else args.port

    if args.simulate:
        run_simulation(args.url, args.zone, args.interval)
    else:
        run_serial_bridge(target_port, args.baud, args.url)
