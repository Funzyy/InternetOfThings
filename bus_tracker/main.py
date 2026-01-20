from fastapi import FastAPI
from route_service.route_api import get_geojson_route_details

app = FastAPI(
    title="Route API",
    version="1.0",
)

@app.get("/routes/geojson")
def route_geojson():
    return get_geojson_route_details()