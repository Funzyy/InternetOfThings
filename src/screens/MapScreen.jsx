import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { busLines } from '../data/busData';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import userIconImage from '../icons/userIconImage.png';
import { useGeolocation } from '../hooks/useGeolocation.js';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

let userIcon = L.icon({
    iconUrl: userIconImage,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapScreen = () => {
    const { id } = useParams();
    const bus = busLines.find(b => b.id === parseInt(id));

    const { position: userPos } = useGeolocation();

    if (!bus) {
        return <div>Bus line not found</div>;
    }

    const center = userPos
        ? [userPos.lat, userPos.lng]
        : [bus.currentPosition.lat, bus.currentPosition.lng];

    return (
        <div className="map-screen-container">
            <header className="map-header">
                <Link to="/" className="back-button">‹</Link>
                <h1>{bus.name} Map</h1>
            </header>
            <div className="map-container">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Stops */}
                    {bus.stops.map(stop => (
                        <Marker key={stop.id} position={[stop.lat, stop.lng]}>
                            <Popup>{stop.name}</Popup>
                        </Marker>
                    ))}

                    {userPos && (
                        <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                            <Popup>User Position</Popup>
                        </Marker>
                    )}

                    {/* Current Bus Position */}
                    <Marker position={[bus.currentPosition.lat, bus.currentPosition.lng]}>
                        <Popup>
                            Current Position
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
