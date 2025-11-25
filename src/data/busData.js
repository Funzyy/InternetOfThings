export const busLines = [
    {
        id: 1,
        name: "Line 10",
        route: "City Center - Central Station",
        color: "#FF5733",
        stops: [
            { id: 101, name: "City Center", lat: 51.505, lng: -0.09 },
            { id: 102, name: "Market Square", lat: 51.506, lng: -0.092 },
            { id: 103, name: "Central Station", lat: 51.507, lng: -0.094 },
        ],
        currentPosition: { lat: 51.506, lng: -0.092 }, // Mock current position
    },
    {
        id: 2,
        name: "Line 20",
        route: "Airport - Downtown",
        color: "#33FF57",
        stops: [
            { id: 201, name: "Airport", lat: 51.51, lng: -0.1 },
            { id: 202, name: "Business Park", lat: 51.509, lng: -0.098 },
            { id: 203, name: "Downtown", lat: 51.508, lng: -0.096 },
        ],
        currentPosition: { lat: 51.509, lng: -0.098 },
    },
    {
        id: 3,
        name: "Line 30",
        route: "University - Stadium",
        color: "#3357FF",
        stops: [
            { id: 301, name: "University", lat: 51.515, lng: -0.08 },
            { id: 302, name: "Library", lat: 51.514, lng: -0.082 },
            { id: 303, name: "Stadium", lat: 51.513, lng: -0.084 },
        ],
        currentPosition: { lat: 51.514, lng: -0.082 },
    },
];
