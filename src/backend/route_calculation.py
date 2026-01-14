import mysql.connector

DB = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "root",
    "database": "bustracker",
    "port": 3306,
}

def connect_db():
    return mysql.connector.connect(**DB)

def get_latest_bus_gps(cur, bus_id):
    cur.execute("select * from BusPosition where fk_bus_id=%s order by gps_send_at desc limit 1", (bus_id,))
    return cur.fetchone()

def get_person_gps(cur, person_id):
    cur.execute("select * from PersonGPS where id=%s limit 1", (person_id,))
    return cur.fetchone()

def get_bus_from_line(cur, line_name):
    cur.execute("select id from BusLine where line_name=%s limit 1", (line_name,))
    line = cur.fetchone()
    cur.execute("select * from Bus where fk_line_id=%s limit 1", (line["id"],))
    return cur.fetchone()

def get_next_stops(cur, next_stop_id,):
    cur.execute("select sequenc_order from LineStops where fk_stop_id=%s", (next_stop_id,))
    next_stop_order = cur.fetchone()
    cur.execute("select * from LineStops where sequenc_order>=%s order by sequenc_order", (next_stop_order["sequenc_order"],))
    return cur.fetchall()

def get_api_gps_data(test_bus_id, test_person_id):
    conn = connect_db()
    cur = conn.cursor(dictionary = True)

    bus = get_bus_from_line(cur, "1407") ## hardcoded for now
    if not bus:
        return print("Bus null"), None

    person = get_person_gps(cur, test_person_id)
    if not person:
        return print("Person null"), None

    bus_gps = get_latest_bus_gps(cur, test_bus_id)
    if not bus_gps:
        return print("Bus GPS null"), None
    
    next_stops = get_next_stops(cur, bus["next_stop"])
    if not next_stops:
        return print("Next stop null"), None
    
    conn.close()

    return {
        "bus": bus,
        "person": person,
        "bus_gps": bus_gps,
        "next_stops": next_stops,
    }