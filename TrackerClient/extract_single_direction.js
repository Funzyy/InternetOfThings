import fs from 'fs';

// Read the OSM data
const osmData = JSON.parse(fs.readFileSync('bus_route_1407.json', 'utf8'));

const relation = osmData.elements[0];

// The relation contains ways for both directions
// We need to extract just one continuous path
// Looking at the data, we should follow the ways in sequence until we complete one direction

const allCoordinates = [];
const processedWays = new Set();

// Start from the first way and follow the route
relation.members.forEach((member, index) => {
    if (member.geometry && member.geometry.length > 0) {
        member.geometry.forEach((point, pointIndex) => {
            // Only add if not a duplicate of the previous point
            if (allCoordinates.length === 0 ||
                point.lat !== allCoordinates[allCoordinates.length - 1][0] ||
                point.lon !== allCoordinates[allCoordinates.length - 1][1]) {
                allCoordinates.push([point.lat, point.lon]);
            }
        });
    }
});

console.log(`Total unique coordinates: ${allCoordinates.length}`);

// Find where the route loops back (when we get close to the start again)
let loopIndex = -1;
const startPoint = allCoordinates[0];
const threshold = 0.001; // About 100m

for (let i = 50; i < allCoordinates.length; i++) {
    const dist = Math.sqrt(
        Math.pow(allCoordinates[i][0] - startPoint[0], 2) +
        Math.pow(allCoordinates[i][1] - startPoint[1], 2)
    );
    if (dist < threshold) {
        loopIndex = i;
        break;
    }
}

let finalRoute;
if (loopIndex > 0) {
    console.log(`Found loop at index ${loopIndex}, taking first direction only`);
    finalRoute = allCoordinates.slice(0, loopIndex + 1);
} else {
    finalRoute = allCoordinates;
}

// Simplify by taking every 3rd point
const simplificationFactor = 3;
const simplifiedRoute = [];
for (let i = 0; i < finalRoute.length; i++) {
    if (i === 0 || i === finalRoute.length - 1 || i % simplificationFactor === 0) {
        simplifiedRoute.push(finalRoute[i]);
    }
}

console.log(`Final route length: ${simplifiedRoute.length} coordinates`);

// Format as JavaScript array
const jsArray = JSON.stringify(simplifiedRoute, null, 12)
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/\],\s+\[/g, '], [');

fs.writeFileSync('route_final.txt', 'routeGeometry: ' + jsArray);
console.log('\nSaved to route_final.txt');
console.log(`First point: ${JSON.stringify(simplifiedRoute[0])}`);
console.log(`Last point: ${JSON.stringify(simplifiedRoute[simplifiedRoute.length - 1])}`);
