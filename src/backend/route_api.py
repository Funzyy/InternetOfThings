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
