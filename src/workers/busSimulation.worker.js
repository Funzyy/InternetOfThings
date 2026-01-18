/* eslint-disable no-restricted-globals */

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    if (type === 'START_SIMULATION') {
        const { csvUrl } = payload;
        try {
            const response = await fetch(csvUrl);
            const text = await response.text();

            const data = parseCSV(text);
            const sortedData = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            let currentIndex = 0;

            // Interval to emit position updates
            const intervalId = setInterval(() => {
                if (currentIndex >= sortedData.length) {
                    clearInterval(intervalId);
                    self.postMessage({ type: 'SIMULATION_COMPLETE' });
                    return;
                }

                const point = sortedData[currentIndex];
                let heading = 0;

                // Calculate heading to the next point if available
                if (currentIndex < sortedData.length - 1) {
                    const nextPoint = sortedData[currentIndex + 1];
                    heading = calculateBearing(point.lat, point.lon, nextPoint.lat, nextPoint.lon);
                } else if (currentIndex > 0) {
                    // Maintain previous heading for the last point
                    const prevPoint = sortedData[currentIndex - 1];
                    heading = calculateBearing(prevPoint.lat, prevPoint.lon, point.lat, point.lon);
                }

                self.postMessage({
                    type: 'POSITION_UPDATE',
                    payload: {
                        lat: point.lat,
                        lon: point.lon,
                        timestamp: point.timestamp,
                        id: point.id,
                        fk_bus_id: point.fk_bus_id,
                        heading: heading
                    }
                });

                currentIndex++;
            }, 1000); // Update every 1 second (matching roughly the data interval)

            // Store interval ID to clear it if needed
            self.intervalId = intervalId;

        } catch (error) {
            console.error("Worker error:", error);
            self.postMessage({ type: 'ERROR', payload: error.message });
        }
    } else if (type === 'STOP_SIMULATION') {
        if (self.intervalId) {
            clearInterval(self.intervalId);
        }
    }
};

function toRad(deg) {
    return deg * Math.PI / 180;
}

function toDeg(rad) {
    return rad * 180 / Math.PI;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const lam1 = toRad(lon1);
    const lam2 = toRad(lon2);

    const y = Math.sin(lam2 - lam1) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(lam2 - lam1);

    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Helper to find index of column
    const getIndex = (name) => headers.indexOf(name);

    const idIdx = getIndex('id');
    const fkIdx = getIndex('fk_bus_id');
    const latIdx = getIndex('lat');
    const lonIdx = getIndex('lon');
    const timeIdx = getIndex('gps_send_at');

    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Handle potential quotes in CSV (basic handling)
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

        if (cols.length < headers.length) continue;

        result.push({
            id: cols[idIdx],
            fk_bus_id: cols[fkIdx],
            lat: parseFloat(cols[latIdx]),
            lon: parseFloat(cols[lonIdx]),
            timestamp: cols[timeIdx]
        });
    }
    return result;
}
