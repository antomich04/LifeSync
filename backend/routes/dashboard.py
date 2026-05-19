from fastapi import APIRouter, Query, Request
from services.aqi_service import fetch_live_data, fetch_historical_aqi, fetch_available_years
from services.particle_service import fetch_historical_particles
from config.rate_limiter import limiter

router = APIRouter(prefix="/api")

@router.get("/available-years")
@limiter.limit("30/minute")
async def fetch_available_years_endpoint(
    request: Request,
    municipality: str = Query(..., description="Name of the municipality")
):
    return await fetch_available_years(municipality)

@router.get("/region-live")
@limiter.limit("30/minute")
async def fetch_live_data_endpoint(
    request: Request,
    lat: float = Query(..., description="Latitude of the region"),
    lon: float = Query(..., description="Longitude of the region")
):
    return await fetch_live_data(lat, lon)

@router.get("/historical-aqi")
@limiter.limit("30/minute")
async def fetch_historical_aqi_endpoint(
    request: Request,
    municipality: str = Query(..., description="Name of the municipality"),
    year: int = Query(..., description="Year for which to fetch historical AQI data")
):
    return await fetch_historical_aqi(municipality, year)

@router.get("/historical-particles")
@limiter.limit("30/minute")
async def fetch_historical_particles_endpoint(
    request: Request,
    municipality: str = Query(..., description="Name of the municipality"),
    year: int = Query(..., description="Year for which to fetch historical particle data")
):
    return await fetch_historical_particles(municipality, year)