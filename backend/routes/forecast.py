from fastapi import APIRouter, Query
from services.forecast_service import fetch_forecast

router = APIRouter(prefix="/api")

@router.get("/forecast")
async def get_forecast(municipality:str = Query(..., description="Name of the municipality to get the forecast for")):
    return await fetch_forecast(municipality)