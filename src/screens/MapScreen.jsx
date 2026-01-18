import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { busLines } from '../data/busData';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';
import L from 'leaflet';
import BusWorker from '../workers/busSimulation.worker.js?worker';
import busCsvUrl from '../data/busFahrt_1407_2026-01-12.csv?url';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to create a rotated arrow icon
const createArrowIcon = (heading) => {
    return L.divIcon({
        className: 'custom-arrow-icon',
        html: `
            <div style="transform: rotate(${heading}deg); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="2"/>
                <path d="M12 4L19 20L12 16L5 20L12 4Z" fill="white"/>
             </svg>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

// Helper component to center map when position changes
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const MapScreen = () => {
    const { id } = useParams();
    const [bus, setBus] = useState(null);
    const [simulatedPosition, setSimulatedPosition] = useState(null);
    const workerRef = useRef(null);

    useEffect(() => {
        const foundBus = busLines.find(b => b.id === parseInt(id));
        setBus(foundBus);

        // Reset simulation state when bus changes
        setSimulatedPosition(null);
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }

        // Start simulation for Bus 1407 (ID 4)
        if (foundBus && foundBus.id === 4) {
            const worker = new BusWorker();
            workerRef.current = worker;

            worker.postMessage({
                type: 'START_SIMULATION',
                payload: { csvUrl: busCsvUrl }
            });

            worker.onmessage = (e) => {
                const { type, payload } = e.data;
                if (type === 'POSITION_UPDATE') {
                    setSimulatedPosition({
                        lat: payload.lat,
                        lng: payload.lon,
                        heading: payload.heading
                    });
                }
            };
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, [id]);

    if (!bus) {
        return <div>Loading...</div>; // Or handle not found
    }

    // Use simulated position if available, otherwise static
    const currentPos = simulatedPosition || bus.currentPosition;
    const center = [currentPos.lat, currentPos.lng];

    // Determine icon: Simulated gets arrow, Static gets default
    const markerIcon = simulatedPosition
        ? createArrowIcon(simulatedPosition.heading || 0)
        : DefaultIcon;

    return (
        <div className="map-screen-container">
            <header className="map-header">
                <Link to="/" className="back-button">‹</Link>
                <h1>{bus.name} Map {simulatedPosition ? '(Live)' : ''}</h1>
            </header>
            <div className="map-container">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <RecenterAutomatically lat={currentPos.lat} lng={currentPos.lng} />

                    {/* Stops */}
                    {bus.stops.map(stop => (
                        <Marker key={stop.id} position={[stop.lat, stop.lng]}>
                            <Popup>
                                {stop.name}
                            </Popup>
                        </Marker>
                    ))}

                    {/* Current Bus Position */}
                    {/* Current Bus Position */}
                    <Marker position={[currentPos.lat, currentPos.lng]} icon={markerIcon}>
                        <Popup>
                            Current Position
                            {simulatedPosition && <br />}
                            {simulatedPosition && <small>Simulated from CSV</small>}
                        </Popup>
                    </Marker>

                    {/* Route Lines - support multiple routes (e.g., outbound and return) */}
                    {bus.routeGeometries ? (
                        // Multiple routes (don't connect them)
                        bus.routeGeometries.map((geometry, idx) => (
                            <Polyline
                                key={idx}
                                positions={geometry}
                                color={bus.color}
                                weight={4}
                                opacity={0.7}
                            />
                        ))
                    ) : (
                        // Single route or fallback to stops
                        <Polyline
                            positions={bus.routeGeometry || bus.stops.map(s => [s.lat, s.lng])}
                            color={bus.color}
                            weight={4}
                            opacity={0.7}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapScreen;
