from random import random, randrange
from .route_calculation import get_api_gps_data
import requests
import heapq

ors_api_key = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVkYTMzMzUzNGQ5ZTQyNWQ5YjY3MzYxYjJiN2IxMzRjIiwiaCI6Im11cm11cjY0In0="
ors_api_url_bus = "https://api.openrouteservice.org/v2/matrix/driving-hgv"
ors_api_url_person = "https://api.openrouteservice.org/v2/matrix/foot-walking"
ors_api_url_geoJson = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson"
max_stops = 5
routes_to_display = 2

def build_header():
    header = {
        "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        "Authorization": ors_api_key,
        "Content-Type": "application/json; charset=utf-8"
    }
    return header

def build_locations(start_location, stop_locations):
    locations = [[start_location["lon"], start_location["lat"]]]
    for stop in stop_locations:
        locations.append([stop["lon"], stop["lat"]])
    return locations

def api_call(url, header, specific_body):
    response = requests.post(
        url,
        json=specific_body,
        headers=header)
    print("Dumping plain text response:", response.text)
    return {
        "status": response.status_code,
        "data": response.json(),
    }

def api_call_geojson(route):
    body = {
        "coordinates": [
            [route["person_location"][1], route["person_location"][0]],
            [route["stop_location"][1], route["stop_location"][0]],
        ],
    }
    response = requests.post(ors_api_url_geoJson, json=body, headers=build_header())
    print("Dumping plain text response:", response.text)
    return response.json()

def get_possible_routes(gps_data):
    header = build_header()
    if not header:
        return print("header null"), None

    next_stops = gps_data["next_stops"][:max_stops]

    person_locations = build_locations(gps_data["person"], next_stops)
    bus_locations = build_locations(gps_data["bus_gps"], next_stops)

    person_body = {
        "locations": person_locations,
        "sources": [0],
        "destinations": list(range(1, len(person_locations))),
        "id": "person_routes",
        "metrics": ["duration"],
    }
    person_routes = api_call(ors_api_url_person, header, person_body)

    bus_body = {
        "locations": bus_locations,
        "sources": [0],
        "destinations": list(range(1, len(bus_locations))),
        "id": "person_routes",
        "metrics": ["duration"],
    }
    bus_routes = api_call(ors_api_url_bus, header, bus_body)

    for i in range(len(next_stops)):
        stop = next_stops[i]
        person = person_routes["data"]["durations"][0][i]
        bus = bus_routes["data"]["durations"][0][i]

        print(f"Stop {i + 1}: {stop['stop_name']} ({stop['lat']}, {stop['lon']})")
        print("-" * 50)
        print(f"{'Typ':<10} {'Dauer (s)':<12}")
        print("-" * 50)
        print(f"{'Person':<10} {person:<12}")
        print(f"{'Bus':<10} {bus:<12}")
        print()

    possible_routes = []
    for i in range(len(person_routes["data"]["durations"][0])):
        person_duration = person_routes["data"]["durations"][0][i]
        bus_duration = bus_routes["data"]["durations"][0][i]
        if person_duration < bus_duration:
            possible_routes.append({
                "duration": person_duration,
                "person_location": (
                    float(gps_data["person"]["lat"]),
                    float(gps_data["person"]["lon"]),
                ),
                "stop_location": (
                    float(next_stops[i]["lat"]),
                    float(next_stops[i]["lon"]),
                ),
            })
    print("possible routes:", possible_routes)
    return possible_routes if possible_routes else None

def get_geojson_route_details(index_number, **kwargs):
    if index_number != 4:
        gps_data = get_api_gps_data(index_number, index_number)
        if not gps_data:
            return print("GPS data null"), None

    if index_number == 4:
        random_number = randrange(3)
        gps_data = get_api_gps_data(random_number, random_number) # pickes random bus gps data
        if not gps_data:
            return print("GPS data null"), None
        gps_data["person"]["lat"] = kwargs["lat"]
        gps_data["person"]["lon"] = kwargs["lon"]

    routes_geoJson = {
        "type": "FeatureCollection",
        "features": [],
    }
    possible_routes = get_possible_routes(gps_data)
    if not possible_routes:
        return None

    shortest_routes = heapq.nsmallest(routes_to_display, possible_routes, key=lambda r: r["duration"])

    for index, route in enumerate(shortest_routes):

        response = api_call_geojson(route)

        feature = response["features"][0]
        feature["properties"]["rank"] = index + 1
        feature["properties"]["duration"] = route["duration"]
        feature["properties"]["person_location"] = route["person_location"]
        feature["properties"]["stop_location"] = route["stop_location"]

        routes_geoJson["features"].append(feature)

    return routes_geoJson