import fs from 'fs';

// Read the OSM data
const osmData = JSON.parse(fs.readFileSync('bus_route_1407.json', 'utf8'));

// Extract all coordinates from the route
const relation = osmData.elements[0];
const allCoordinates = [];

relation.members.forEach(member => {
    if (member.geometry) {
        member.geometry.forEach(point => {
            allCoordinates.push({ lat: point.lat, lng: point.lon });
        });
    }
});

console.log(`Total coordinates: ${allCoordinates.length}`);

// Sample every Nth coordinate to simplify the route (e.g., every 10th point for better accuracy)
const samplingRate = 10;
const simplifiedRoute = allCoordinates.filter((_, index) => index % samplingRate === 0);

// Always include the last point
if (allCoordinates.length > 0) {
    simplifiedRoute.push(allCoordinates[allCoordinates.length - 1]);
}

console.log(`Simplified to: ${simplifiedRoute.length} coordinates`);
console.log('\nSimplified coordinates for route:');
console.log(JSON.stringify(simplifiedRoute, null, 2));

// Save to file
fs.writeFileSync('route_coordinates.json', JSON.stringify({
    full: allCoordinates,
    simplified: simplifiedRoute
}, null, 2));

console.log('\nSaved to route_coordinates.json');

