# Verification: Bus Simulation with Web Worker

I have implemented a **Web Worker** to parse and playback the provided CSV file (`src/data/busFahrt_1407_2026-01-12.csv`) for Bus 1407.

## Changes
1.  **Created `src/workers/busSimulation.worker.js`**:
    *   Fetches the CSV file (passed as a URL).
    *   Parses the CSV data.
    *   Sorts the data by timestamp (ascending).
    *   Emits `POSITION_UPDATE` events every 1 second, simulating real-time movement.

2.  **Modified `src/screens/MapScreen.jsx`**:
    *   Imports the new worker and the CSV file URL.
    *   When the bus ID matches **4** (Linie 1407), it instantiates the worker.
    *   Listens for position updates and updates the map state.
    *   Automatically re-centers the map on the new position.
    *   Displays "(Live)" in the header when simulation is active.

## How to Test
1.  Run the development server:
    ```bash
    npm run dev
    ```
2.  Open the web app in the browser.
3.  Navigate to **Linie 1407**.
4.  Observe the map:
    *   The marker should jump to the start position (from the CSV).
    *   The marker should move every second.
    *   The map should follow the marker.
    *   The title should show "Linie 1407 Map (Live)".

## Files Modified/Created
*   `src/workers/busSimulation.worker.js` (New)
*   `src/screens/MapScreen.jsx` (Modified)
