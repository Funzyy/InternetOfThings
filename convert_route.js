import fs from 'fs';

// Read the OSM data
const osmData = JSON.parse(fs.readFileSync('bus_route_1407.json', 'utf8'));

// Extract all coordinates from the route
const relation = osmData.elements[0];
const allCoordinates = [];

relation.members.forEach(member => {
    if (member.geometry) {
        member.geometry.forEach(point => {
            allCoordinates.push([point.lat, point.lon]);
        });
    }
});

console.log(`Total coordinates: ${allCoordinates.length}`);

// Format as JavaScript array
const jsArray = JSON.stringify(allCoordinates, null, 12)
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/\],\s+\[/g, '], [');

console.log('\nFormatted for busData.js:');
console.log('routeGeometry: ' + jsArray);

// Save to file
fs.writeFileSync('route_full.txt', 'routeGeometry: ' + jsArray);
console.log('\nSaved to route_full.txt');
