import route_calculation
import requests

# komplet neu machen für ors
# zwei anfragen bus/person getrennt
# zwei unterschiedliche apis /driving-car oder /driving-hgv (bus)
# /foot-walking (person)
## zwei komplette origins bus/person
## erst lon dann lat
## destiantions können gleich bleiben
## probe request für tests und evtl. andere gewichtung/ergebnisse von ors
print(route_calculation.get_api_gps_data(2, 2))

ors_api_key = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVkYTMzMzUzNGQ5ZTQyNWQ5YjY3MzYxYjJiN2IxMzRjIiwiaCI6Im11cm11cjY0In0="
ors_api_url_bus = "https://api.openrouteservice.org/v2/matrix/driving-hgv"
ors_api_url_person = "https://api.openrouteservice.org/v2/matrix/foot-walking"
max_stops = 5

def builld_header():
    headers = {
        "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        "Authorization": ors_api_key,
        "Content-Type": "application/json; charset=utf-8"
    }

def api_call(url, header, body):
    response = requests.post(
        url,
        json=body,
        headers=header)
    print("Dumping plain text response:", response.text)
    return {
        "status": response.status_code,
        "data": response.json(),
    }



