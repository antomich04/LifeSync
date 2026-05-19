from fastapi import APIRouter, Query, Request
from services.forecast_service import fetch_forecast
from config.rate_limiter import limiter

router = APIRouter(prefix="/api")

@router.get("/forecast")
@limiter.limit("30/minute")
async def get_forecast(request: Request, municipality:str = Query(..., description="Name of the municipality to get the forecast for")):
    return await fetch_forecast(municipality)