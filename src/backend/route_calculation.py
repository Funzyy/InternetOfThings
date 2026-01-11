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
# get bus gps
# get person gps
# get line info
# get next bus stops from line_stop_order
# 