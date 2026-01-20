import React, {useEffect, useState, useRef} from 'react';
import {useParams, Link} from 'react-router-dom';
import {MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, GeoJSON, Circle} from 'react-leaflet';
import {busLines} from '../data/busData';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';
import L from 'leaflet';
import BusWorker from '../workers/busSimulation.worker.js?worker';
import busCsvUrl from '../data/busFahrt_1407_2026-01-12.csv?url';
import route1407GeoJsonUrl from '../data/route1407.geojson?url';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import {useGeolocation} from '../hooks/useGeolocation.js';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const userIcon = L.divIcon({
    className: "user-dot-icon",
    html: `<div class="user-dot"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});


L.Marker.prototype.options.icon = DefaultIcon;

const busStopIcon = L.divIcon({
    className: "bus-stop-icon",
    html: `<div class="bus-stop-circle">BUS</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
});


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

// Follow + Recenter Controller
const FollowController = ({mode, targetLatLng, defaultZoom, onStopFollowing}) => {
    const map = useMap();
    const lockedZoomRef = React.useRef(null);
    const prevModeRef = React.useRef(null);

    useEffect(() => {
        if (!mode || !targetLatLng) return;

        const modeChanged = prevModeRef.current !== mode;
        prevModeRef.current = mode;

        if (modeChanged) {
            lockedZoomRef.current = (typeof defaultZoom === 'number') ? defaultZoom : map.getZoom();
            map.flyTo(targetLatLng, lockedZoomRef.current, {animate: true, duration: 0.6});
            return;
        }

        const z = lockedZoomRef.current ?? map.getZoom();
        map.setView(targetLatLng, z, {animate: false});
    }, [mode, targetLatLng?.[0], targetLatLng?.[1], defaultZoom, map]);

    useMapEvents({
        dragstart: () => onStopFollowing?.(),

        zoomend: () => {
            if (!mode || !targetLatLng) return;
            lockedZoomRef.current = map.getZoom();
            map.setView(targetLatLng, lockedZoomRef.current, {animate: false});
        },
    });

    return null;
};

const MapScreen = () => {
    const {id} = useParams();
    const [bus, setBus] = useState(null);
    const [simulatedPosition, setSimulatedPosition] = useState(null);
    const workerRef = useRef(null);
    const [followTarget, setFollowTarget] = useState('auto'); // 'auto' | 'user' | 'bus' | 'none'
    const [route1407GeoJson, setRoute1407GeoJson] = useState(null);
    const [stopsGeoJson, setStopsGeoJson] = useState(null);
    const [simSpeed, setSimSpeed] = useState(1); // 1x default

    useEffect(() => {
        const foundBus = busLines.find(b => b.id === parseInt(id));
        setBus(foundBus);

        // Reset simulation state when bus changes
        setSimulatedPosition(null);
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }

        setRoute1407GeoJson(null);

        if (foundBus?.id === 4) {
            (async () => {
                try {
                    const res = await fetch(route1407GeoJsonUrl);
                    const json = await res.json();

                    setRoute1407GeoJson(json);

                    const stopFeatures = (json.features || []).filter(
                        f => f?.geometry?.type === "Point" && f?.properties?.kind === "stop"
                    );

                    setStopsGeoJson({type: "FeatureCollection", features: stopFeatures});

                } catch (err) {
                    console.error('Failed to load GeoJSON:', err);
                }
            })();

            const worker = new BusWorker();
            workerRef.current = worker;
            worker.postMessage({ type: "SET_SPEED", payload: { speed: simSpeed } });

            worker.postMessage({
                type: 'START_SIMULATION',
                payload: {csvUrl: busCsvUrl}
            });

            worker.onmessage = (e) => {
                const {type, payload} = e.data;
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
                workerRef.current = null;
            }
        };
    }, [id]);

    useEffect(() => {
        if (!workerRef.current) return;

        workerRef.current.postMessage({
            type: "SET_SPEED",
            payload: { speed: simSpeed }
        });

    }, [simSpeed]);


    const {position: userPos} = useGeolocation();

    useEffect(() => {
        if (followTarget !== 'auto') return;

        if (userPos) setFollowTarget('user');
        else if (bus) setFollowTarget('bus');
    }, [userPos, bus, followTarget]);


    if (!bus) {
        return <div>Loading...</div>; // Or handle not found
    }

    // Use simulated position if available, otherwise static
    const currentPos = simulatedPosition || bus.currentPosition;

    const busLatLng = [currentPos.lat, currentPos.lng];
    const userLatLng = userPos ? [userPos.lat, userPos.lng] : null;

    const initialCenter = userLatLng || busLatLng;

    const activeTargetLatLng =
        followTarget === 'user' ? userLatLng :
            followTarget === 'bus' ? busLatLng :
                null;

    const USER_ZOOM = 16;
    const BUS_ZOOM = 13;

    const followMode = (followTarget === 'user' || followTarget === 'bus') ? followTarget : null;

    const defaultZoom =
        followTarget === 'user' ? USER_ZOOM :
            followTarget === 'bus' ? BUS_ZOOM :
                undefined;


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
                <MapContainer
                    center={initialCenter}
                    zoom={13}
                    style={{height: '100%', width: '100%'}}
                    scrollWheelZoom="center"
                    touchZoom="center">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <FollowController
                        mode={followMode}
                        targetLatLng={activeTargetLatLng}
                        defaultZoom={defaultZoom}
                        onStopFollowing={() => setFollowTarget('none')}
                    />

                    {/* Stops (aus GeoJSON) */}
                    {stopsGeoJson?.features?.map((f) => {
                        const [lon, lat] = f.geometry.coordinates; // GeoJSON: [lon, lat]
                        const name = f.properties?.name ?? f.properties?.id ?? "Stop";
                        const id = f.properties?.id ?? `${lon},${lat}`;

                        return (
                            <Marker
                                key={id}
                                position={[lat, lon]}
                                icon={busStopIcon}
                                eventHandlers={{
                                    click: (e) => {
                                        const el = e.target?.getElement?.();
                                        if (!el) return;

                                        el.classList.remove("is-active");
                                        void el.offsetWidth;
                                        el.classList.add("is-active");

                                        setTimeout(() => el.classList.remove("is-active"), 350);
                                    },
                                }}
                            >
                                <Popup>{name}</Popup>
                            </Marker>

                        );
                    })}

                    {userPos && (
                        <>
                            {/* Accuracy-Circle */}
                            {userPos.accuracy && (
                                <Circle
                                    center={[userPos.lat, userPos.lng]}
                                    radius={userPos.accuracy}
                                    pathOptions={{
                                        color: "#1a73e8",
                                        weight: 1,
                                        opacity: 0.9,
                                        fillColor: "#1a73e8",
                                        fillOpacity: 0.15
                                    }}
                                />
                            )}

                            {/* User-Icon */}
                            <Marker
                                position={[userPos.lat, userPos.lng]}
                                icon={userIcon}
                            >
                                <Popup>
                                    You are within {Math.round(userPos.accuracy)} meters from this point
                                </Popup>
                            </Marker>
                        </>
                    )}


                    {/* Current Bus Position */}
                    <Marker position={[currentPos.lat, currentPos.lng]} icon={markerIcon}>
                        <Popup>
                            Current Position
                            {simulatedPosition && <br/>}
                            {simulatedPosition && <small>Simulated from CSV</small>}
                        </Popup>
                    </Marker>

                    {/* Route */}
                    {bus.id === 4 && route1407GeoJson ? (
                        <GeoJSON
                            data={route1407GeoJson}
                            pointToLayer={() => null}
                            style={(feature) => {
                                const t = feature?.geometry?.type;
                                if (t === "LineString" || t === "MultiLineString") {
                                    return { color: bus.color, weight: 4, opacity: 0.7 };
                                }
                                return {};
                            }}
                        />
                    ) : bus.routeGeometries ? (
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
                        <Polyline
                            positions={bus.routeGeometry || bus.stops.map(s => [s.lat, s.lng])}
                            color={bus.color}
                            weight={4}
                            opacity={0.7}
                        />
                    )}
                </MapContainer>
                <div className="map-controls">
                    <button
                        type="button"
                        className={followTarget === 'none' ? 'active' : ''}
                        onClick={() => setFollowTarget('none')}
                        title="Folgen aus"
                    >
                        ✋
                    </button>

                    <button
                        type="button"
                        className={followTarget === 'user' ? 'active' : ''}
                        onClick={() => setFollowTarget('user')}
                        disabled={!userLatLng}
                        title="Auf User zentrieren"
                    >
                        📍
                    </button>

                    <button
                        type="button"
                        className={followTarget === 'bus' ? 'active' : ''}
                        onClick={() => setFollowTarget('bus')}
                        title="Bus folgen"
                    >
                        🚌
                    </button>

                    {/* Simulation Speed */}
                    <div className="sim-speed-wrapper">
                        <input
                            className="sim-speed-slider"
                            type="range"
                            min="0.25"
                            max="4"
                            step="0.25"
                            value={simSpeed}
                            onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                        />
                        <div
                            className="sim-speed-bubble"
                            style={{ left: `${((simSpeed - 0.25) / (4 - 0.25)) * 100}%` }}
                        >
                            {simSpeed.toFixed(2)}×
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapScreen;
