import fs from 'fs';

// Read the OSM data
const osmData = JSON.parse(fs.readFileSync('bus_route_1407.json', 'utf8'));

// Extract all coordinates from the route in order
const relation = osmData.elements[0];
const allCoordinates = [];

// Process each way member in order
relation.members.forEach(member => {
    if (member.geometry && member.geometry.length > 0) {
        // Add all points from this way segment
        member.geometry.forEach(point => {
            allCoordinates.push([point.lat, point.lon]);
        });
    }
});

console.log(`Total coordinates before cleanup: ${allCoordinates.length}`);

// Remove consecutive duplicates
const cleanedCoordinates = [];
for (let i = 0; i < allCoordinates.length; i++) {
    if (i === 0 ||
        allCoordinates[i][0] !== allCoordinates[i - 1][0] ||
        allCoordinates[i][1] !== allCoordinates[i - 1][1]) {
        cleanedCoordinates.push(allCoordinates[i]);
    }
}

console.log(`Coordinates after removing consecutive duplicates: ${cleanedCoordinates.length}`);

// Simplify by taking every Nth point (but keep first and last)
const simplificationFactor = 3; // Take every 3rd point
const simplifiedRoute = [];
for (let i = 0; i < cleanedCoordinates.length; i++) {
    if (i === 0 || i === cleanedCoordinates.length - 1 || i % simplificationFactor === 0) {
        simplifiedRoute.push(cleanedCoordinates[i]);
    }
}

console.log(`Simplified to: ${simplifiedRoute.length} coordinates`);

// Format as JavaScript array
const jsArray = JSON.stringify(simplifiedRoute, null, 12)
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/\],\s+\[/g, '], [');

console.log('\nFormatted for busData.js:');
console.log('routeGeometry: ' + jsArray);

// Save to file
fs.writeFileSync('route_cleaned.txt', 'routeGeometry: ' + jsArray);
console.log('\nSaved to route_cleaned.txt');
console.log(`\nFirst 5 points: ${JSON.stringify(simplifiedRoute.slice(0, 5))}`);
console.log(`Last 5 points: ${JSON.stringify(simplifiedRoute.slice(-5))}`);
