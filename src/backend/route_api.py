from email.quoprimime import body_check

import route_calculation
import requests

#print(route_calculation.get_api_gps_data(2, 2))

ors_api_key = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVkYTMzMzUzNGQ5ZTQyNWQ5YjY3MzYxYjJiN2IxMzRjIiwiaCI6Im11cm11cjY0In0="
ors_api_url_bus = "https://api.openrouteservice.org/v2/matrix/driving-hgv"
ors_api_url_person = "https://api.openrouteservice.org/v2/matrix/foot-walking"
max_stops = 5

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

def get_possible_routes():
    header = build_header()
    if not header:
        return print("header null"), None

    gps_data = route_calculation.get_api_gps_data(2, 2)
    if not gps_data:
        return print("GPS data null"), None

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

    # routen vergleichen und schauen wo person schneller ist als bus
    possible_routes = {}
    for i in range(len(person_routes["data"]["durations"][0])):
        person_duration = person_routes["data"]["durations"][0][i]
        bus_duration = bus_routes["data"]["durations"][0][i]
        if person_duration < bus_duration:
            possible_routes.append({
                "duration": person_duration,
                "person_location": (
                    person_routes["data"]["destinations"][i]["location"][1],
                    person_routes["data"]["destinations"][i]["location"][0],
                ),
                "stop_location": (
                    next_stops[i]["lat"],
                    next_stops[i]["lon"],
                ),
            })
    print("possible routes:", possible_routes)
    return possible_routes if possible_routes else None

# poly line von möglichen routen holen
# polyline zurück geben
get_possible_routes()

