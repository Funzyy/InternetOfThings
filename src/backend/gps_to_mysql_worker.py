# gps_to_mysql_worker.py
# Holt GPS-Daten vom Raspberry (/last) und schreibt sie in MySQL:
# - Devices: MAC -> fk_bus_id
# - BusPosition: fk_bus_id, lat, lon, gps_send_at  [file:5]

import time
import requests
import mysql.connector
from mysql.connector import Error

RPI_LAST_URL = "http://10.242.135.163:5000/last"
POLL_SEC = 1

DB = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "maigoroot",
    "database": "BusTracker",
    "port": 3306,
}

def normalize_ts(iso_ts: str) -> str:
    # z.B. "2026-01-09T23:41:25.152934+00:00" -> "2026-01-09 23:41:25"
    ts = iso_ts.replace("T", " ")
    if "+" in ts:
        ts = ts.split("+")[0]
    ts = ts.split(".")[0]
    return ts

def connect_db():
    return mysql.connector.connect(**DB)

def get_bus_id_for_mac(cur, mac: str):
    cur.execute("SELECT fk_bus_id FROM Devices WHERE device_mac=%s", (mac,))
    row = cur.fetchone()
    return row[0] if row else None

def insert_position(cur, fk_bus_id: int, lat, lon, gps_send_at: str):
    cur.execute(
        "INSERT INTO BusPosition (fk_bus_id, lat, lon, gps_send_at) VALUES (%s, %s, %s, %s)",
        (fk_bus_id, str(lat), str(lon), gps_send_at),
    )

def main():
    print("Worker startet…")
    print("Raspberry:", RPI_LAST_URL)
    print("DB:", DB["host"], DB["database"])

    conn = connect_db()
    cur = conn.cursor()

    # Duplikate vermeiden (pro Gerät nur speichern, wenn timestamp_utc neu ist)
    last_saved_ts = {}  # mac -> timestamp_utc

    while True:
        try:
            data = requests.get(RPI_LAST_URL, timeout=5).json()

            for mac, p in (data or {}).items():
                lat = p.get("lat")
                lon = p.get("lon")
                ts_utc = p.get("timestamp_utc")

                if lat is None or lon is None or not ts_utc:
                    continue
                if last_saved_ts.get(mac) == ts_utc:
                    continue

                fk_bus_id = get_bus_id_for_mac(cur, mac)
                if fk_bus_id is None:
                    print(f"Unbekannte MAC (nicht in Devices): {mac}")
                    continue

                insert_position(cur, fk_bus_id, lat, lon, normalize_ts(ts_utc))
                conn.commit()
                last_saved_ts[mac] = ts_utc

                print(f"OK: mac={mac} bus_id={fk_bus_id} lat={lat} lon={lon} ts={ts_utc}")

        except requests.RequestException as e:
            print("HTTP-Fehler:", e)
        except Error as e:
            print("MySQL-Fehler:", e)
            # Reconnect versuchen
            try:
                cur.close()
                conn.close()
            except Exception:
                pass
            time.sleep(2)
            conn = connect_db()
            cur = conn.cursor()
        except KeyboardInterrupt:
            break
        except Exception as e:
            print("Unbekannter Fehler:", e)

        time.sleep(POLL_SEC)

    try:
        cur.close()
        conn.close()
    except Exception:
        pass

if __name__ == "__main__":
    main()
