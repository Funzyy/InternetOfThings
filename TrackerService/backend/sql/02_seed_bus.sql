-- 02_seed_bus.sql
USE BusTracker;

-- Mindestens einen Bus anlegen, falls noch keiner existiert
INSERT INTO Bus (fk_line_id, prev_stop, next_stop)
SELECT 1, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM Bus);