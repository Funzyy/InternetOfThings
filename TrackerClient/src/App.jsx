import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BusListScreen from './screens/BusListScreen';
import MapScreen from './screens/MapScreen';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BusListScreen />} />
        <Route path="/map/:id" element={<MapScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
