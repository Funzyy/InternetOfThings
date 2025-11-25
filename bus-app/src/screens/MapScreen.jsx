import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { busLines } from '../data/busData';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';
import L from 'leaflet';

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

const MapScreen = () => {
    const { id } = useParams();
    const bus = busLines.find(b => b.id === parseInt(id));

    if (!bus) {
        return <div>Bus line not found</div>;
    }

    const center = [bus.currentPosition.lat, bus.currentPosition.lng];

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
                            <Popup>
                                {stop.name}
                            </Popup>
                        </Marker>
                    ))}

                    {/* Current Bus Position */}
                    <Marker position={[bus.currentPosition.lat, bus.currentPosition.lng]}>
                        <Popup>
                            Current Position
                        </Popup>
                    </Marker>

                    {/* Route Line */}
                    <Polyline positions={bus.stops.map(s => [s.lat, s.lng])} color={bus.color} />
                </MapContainer>
            </div>
        </div>
    );
};

export default MapScreen;
