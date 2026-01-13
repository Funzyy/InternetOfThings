import { useEffect, useState } from "react";

export function useGeolocation(options = { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }) {
    const [position, setPosition] = useState(null); // { lat, lng, accuracy, heading, speed, timestamp }
    const [error, setError] = useState(null);
    const [isSupported] = useState(typeof navigator !== "undefined" && "geolocation" in navigator);

    useEffect(() => {
        if (!isSupported) {
            setError("Geolocation wird vom Browser nicht unterstützt.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy, heading, speed } = pos.coords;
                setPosition({
                    lat: latitude,
                    lng: longitude,
                    accuracy,
                    heading,
                    speed,
                    timestamp: pos.timestamp,
                });
                setError(null);
            },
            (err) => {
                setError(err.message || "Standort konnte nicht abgerufen werden.");
            },
            options
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isSupported]);

    return { position, error, isSupported };
}
