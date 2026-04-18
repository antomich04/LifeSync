from fastapi import APIRouter, Query
from services.aqi_service import fetch_live_data, fetch_historical_aqi

router = APIRouter(prefix="/api")

@router.get("/region-live")
async def fetch_live_data_endpoint(
    lat: float = Query(..., description="Latitude of the region"),
    lon: float = Query(..., description="Longitude of the region")
):
    return await fetch_live_data(lat, lon)

@router.get("/historical-aqi")
async def fetch_historical_aqi_endpoint(
    municipality: str = Query(..., description="Name of the municipality"),
    year: int = Query(..., description="Year for which to fetch historical AQI data")
):
    return await fetch_historical_aqi(municipality, year)