# src/backend/gps_to_mysql_worker.py
import time
import requests
import mysql.connector
from mysql.connector import Error

from db_init import init_db  # ggf. Import-Pfad anpassen

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
    init_db()
    conn = None
    cur = None
    last_saved_ts = {}

    try:
        conn = connect_db()
        cur = conn.cursor()

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

            except requests.RequestException as e:
                print("HTTP-Fehler:", e)
            except Error as e:
                print("MySQL-Fehler:", e)
                try:
                    cur.close()
                    conn.close()
                except Exception:
                    pass
                time.sleep(2)
                conn = connect_db()
                cur = conn.cursor()

            time.sleep(POLL_SEC)

    except KeyboardInterrupt:
        print("\nStoppe Worker (Ctrl+C)…")  # kein Traceback mehr [web:193]
    finally:
        try:
            if cur:
                cur.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()  # Verbindung sauber schließen [web:201]
        except Exception:
            pass
        print("Worker beendet.")

if __name__ == "__main__":
    main()
