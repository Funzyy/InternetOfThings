# src/backend/db_init.py
from pathlib import Path
import mysql.connector

DB = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "maigoroot",
    "port": 3306,
}

SQL_FILES = [
    Path("src/backend/sql/01_schema.sql"),
    Path("src/backend/sql/02_seed_bus.sql"),
    Path("src/backend/sql/03_devices.sql"),
]

def split_sql_statements(sql: str):
    # Entfernt einfache '-- ...' Kommentare und splittet grob nach ';'
    lines = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--") or stripped == "":
            continue
        lines.append(line)
    cleaned = "\n".join(lines)

    parts = [p.strip() for p in cleaned.split(";")]
    return [p for p in parts if p]

def run_sql_file(cur, path: Path):
    sql = path.read_text(encoding="utf-8")
    for stmt in split_sql_statements(sql):
        cur.execute(stmt)

def init_db():
    conn = mysql.connector.connect(**DB)
    conn.autocommit = False
    cur = conn.cursor()
    try:
        for f in SQL_FILES:
            print("Running:", f)
            run_sql_file(cur, f)
        conn.commit()
        print("DB init done.")
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    init_db()
