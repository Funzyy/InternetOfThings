export const busLines = [
    {
        id: 1,
        name: "Linie 1410",
        route: "Bertelsdorfer Höhe - Creidlitz",
        color: "#E63946",
        stops: [
            { id: 101, name: "Bertelsdorfer Höhe", lat: 50.2750, lng: 10.9520 },
            { id: 102, name: "Lauterer Höhe", lat: 50.2720, lng: 10.9540 },
            { id: 103, name: "Bahnhof ZOB", lat: 50.2599, lng: 10.9646 },
            { id: 104, name: "Theaterplatz", lat: 50.2585, lng: 10.9665 },
            { id: 105, name: "Mohrenstraße", lat: 50.2595, lng: 10.9680 },
            { id: 106, name: "Klinikum", lat: 50.2650, lng: 10.9750 },
            { id: 107, name: "Ketschendorf", lat: 50.2680, lng: 10.9820 },
            { id: 108, name: "Creidlitz", lat: 50.2720, lng: 10.9900 },
        ],
        currentPosition: { lat: 50.2599, lng: 10.9646 }, // Currently at Bahnhof
    },
    {
        id: 2,
        name: "Linie 1403",
        route: "Cortendorf - Wüstenahorn",
        color: "#2A9D8F",
        stops: [
            { id: 201, name: "Cortendorf", lat: 50.2450, lng: 10.9500 },
            { id: 202, name: "Scheuerfelder Straße", lat: 50.2500, lng: 10.9550 },
            { id: 203, name: "Bahnhof ZOB", lat: 50.2599, lng: 10.9646 },
            { id: 204, name: "Albertsplatz", lat: 50.2610, lng: 10.9670 },
            { id: 205, name: "Mohrenstraße", lat: 50.2595, lng: 10.9680 },
            { id: 206, name: "Sändleinweg", lat: 50.2630, lng: 10.9720 },
            { id: 207, name: "Wüstenahorner Straße", lat: 50.2680, lng: 10.9780 },
        ],
        currentPosition: { lat: 50.2610, lng: 10.9670 }, // Currently at Albertsplatz
    },
    {
        id: 3,
        name: "Stadtlinie",
        route: "Marktplatz - HUK Arena",
        color: "#457B9D",
        stops: [
            { id: 301, name: "Marktplatz", lat: 50.2590, lng: 10.9655 },
            { id: 302, name: "Theaterplatz", lat: 50.2585, lng: 10.9665 },
            { id: 303, name: "Kongresshaus", lat: 50.2600, lng: 10.9700 },
            { id: 304, name: "Landratsamt", lat: 50.2620, lng: 10.9730 },
            { id: 305, name: "HUK-COBURG Arena", lat: 50.2640, lng: 10.9760 },
        ],
        currentPosition: { lat: 50.2585, lng: 10.9665 }, // Currently at Theaterplatz
    },
];
