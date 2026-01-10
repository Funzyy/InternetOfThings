-- 03_devices.sql
USE BusTracker;

CREATE TABLE IF NOT EXISTS Devices (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  device_mac VARCHAR(17) NOT NULL UNIQUE,
  fk_bus_id INT NOT NULL,
  CONSTRAINT fk_devices_bus
    FOREIGN KEY (fk_bus_id) REFERENCES Bus(id)
);

-- Beispielgerät eintragen (nur wenn nicht vorhanden)
INSERT INTO Devices (device_mac, fk_bus_id)
SELECT '2c:cf:67:7e:b3:10', 1
WHERE NOT EXISTS (
  SELECT 1 FROM Devices WHERE device_mac='2c:cf:67:7e:b3:10'
);
