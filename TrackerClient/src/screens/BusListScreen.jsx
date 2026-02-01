import React from 'react';
import { Link } from 'react-router-dom';
import { busLines } from '../data/busData';
import './BusListScreen.css';

const BusListScreen = () => {
    return (
        <div className="bus-list-container">
            <header className="app-header">
                <h1>Bus Lines</h1>
            </header>
            <div className="bus-list">
                {busLines.map((bus) => (
                    <Link to={`/map/${bus.id}`} key={bus.id} className="bus-item" style={{ borderLeftColor: bus.color }}>
                        <div className="bus-info">
                            <span className="bus-name" style={{ color: bus.color }}>{bus.name}</span>
                            <span className="bus-route">{bus.route}</span>
                        </div>
                        <div className="arrow-icon">›</div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BusListScreen;
