from fastapi import FastAPI
from route_service.route_api import get_geojson_route_details
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Route API",
    version="1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/routes/geojson")
def route_geojson():
    return get_geojson_route_details()