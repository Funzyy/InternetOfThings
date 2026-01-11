import time
import requests
import mysql.connector
from mysql.connector import Error

from db_init import init_db  # ggf. Import-Pfad anpassen

DB = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "maigoroot",
    "database": "BusTracker",
    "port": 3306,
}

def connect_db():
    return mysql.connector.connect(**DB)

def get_latest_bus_gps(cur, bus_id):
    cur.execute("select * from BusPosition where fk_bus_id=%s order by gps_send_at desc", (bus_id,))
    return cur.fetchone()
# get person gps

def get_bus_id_from_line(cur,):
    cur.execute("select id from BusLine where line_name=1407")
    line = cur.fetchone()
    cur.execute("select * from Bus where fk_line_id=%s", (line[0],))
    return cur.fetchone()

def get_next_stops(cur, next_stop_id,):
    cur.execute("select sequenc_order from LineStops where fk_stop_id=%s", (next_stop_id,))
    next_stop_order = cur.fetchone()
    cur.execute("select * from LineStops where sequenc_order>=%s order by sequenc_order", (next_stop_order[0],))
    return cur.fetchall()
# missing main prob?