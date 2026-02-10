import serial
import time
import requests
from datetime import datetime, timezone
import uuid

def get_mac():
        mac = hex(uuid.getnode())[2:]
        return ":".join(mac[i:i+2] for i in range (0, 12, 2))

# === Einstellungen ===
SERIAL_PORT = "/dev/ttyAMA0"
BAUDRATE = 9600
SERVER_URL = "http://127.0.0.1:5000/track"   # TEST-URL - später ändern!
DEVICE_ID = get_mac()
SEND_INTERVAL = 1 # Sekunden

def nmea_to_decimal(coord_str, hemisphere):
    if not coord_str or coord_str == "0":
        return None
    value = float(coord_str)
    degrees = int(value // 100)
    minutes = value - degrees * 100
    decimal = degrees + minutes / 60.0
    if hemisphere in ("S", "W"):
        decimal = -decimal
    return decimal

def parse_gprmc(sentence):
    parts = sentence.split(",")
    if len(parts) < 12:
        return None
    if parts[2] != "A":  # 'A' gültig, 'V' ungültig
        return None

    time_str = parts[1]
    lat_str = parts[3]
    lat_hem = parts[4]
    lon_str = parts[5]
    lon_hem = parts[6]
    speed_knots_str = parts[7]
    date_str = parts[9]

    lat = nmea_to_decimal(lat_str, lat_hem)
    lon = nmea_to_decimal(lon_str, lon_hem)

    try:
        speed_knots = float(speed_knots_str) if speed_knots_str else 0.0
    except ValueError:
        speed_knots = 0.0
    speed_kmh = speed_knots * 1.852

    timestamp = datetime.now(timezone.utc).isoformat()

    return {
        "lat": lat,
        "lon": lon,
        "speed_kmh": speed_kmh,
        "timestamp_utc": timestamp,
    }

def main():
    ser = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=1)
    print("GPS-Tracker läuft... sende an:", SERVER_URL)

    last_send = 0

    while True:
        line = ser.readline().decode("ascii", errors="ignore").strip()

        if line.startswith("$GPRMC"):
            data = parse_gprmc(line)
            if not data or data["lat"] is None:
                continue

            now = time.time()
            if now - last_send < SEND_INTERVAL:
                continue

            payload = {
                "device_id": DEVICE_ID,
                "lat": data["lat"],
                "lon": data["lon"],
                "speed_kmh": data["speed_kmh"],
                "timestamp_utc": data["timestamp_utc"],
            }

            try:
                r = requests.post(SERVER_URL, json=payload, timeout=5)
                print("Gesendet:", payload, "Status:", r.status_code)
                last_send = now
            except Exception as e:
                print("Fehler beim Senden:", e)

        time.sleep(0.05)

if __name__ == "__main__":
    main()
