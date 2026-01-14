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
ors_api_url_car = "https://api.openrouteservice.org/v2/matrix/foot-walking"