import json
import asyncio
import os
import httpx
from config.redis_client import get_redis_client
from config.db_client import get_db_client
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from models.historical_aqi import HistoricalAqi


LIVE_DATA_CACHE_TTL = 3600
HISTORICAL_DATA_CACHE_TTL = 900

async def fetch_live_data(lat: float, lon: float) -> dict:
    redis_key = f"aqi:live:{lat}:{lon}"

    try:
        redis_client = get_redis_client()
        #Checks the cache
        cached_data = await redis_client.get(redis_key)
        if cached_data:
            return json.loads(cached_data)

        # Fetches from OpenWeather in cache miss scenario
        api_key = os.getenv("OPENWEATHER_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenWeather API key is not configured.")

        base_url = os.getenv("BASE_OPENWEATHER_API_URL")
        if not base_url:
            raise HTTPException(status_code=500, detail="OpenWeather base URL is not configured.")

        owm_url = f"{base_url}?lat={lat}&lon={lon}&appid={api_key}"

        async with httpx.AsyncClient() as client:
            response = await client.get(owm_url)
            response.raise_for_status()
            owm_data = response.json()

        #OpenWeather puts data inside a "list" array
        if not owm_data.get("list") or len(owm_data["list"]) == 0:
            raise HTTPException(status_code=404, detail="No air quality data found for these coordinates.")

        current_data = owm_data["list"][0]
        aqi_index = current_data["main"]["aqi"]
        components = current_data["components"]

        #Maps it to the expected interface
        frontend_payload = {
            "aqiScore": calculate_visual_score(aqi_index),
            "status": get_aqi_status(aqi_index),
            "particles": {
                "pm10": clean_value(components.get("pm10")),
                "pm25": clean_value(components.get("pm2_5")),
                "no": clean_value(components.get("no")),
                "no2": clean_value(components.get("no2")),
                "co": clean_value(components.get("co")),
                "o3": clean_value(components.get("o3"))
            }
        }

        await redis_client.setex(
            name=redis_key,
            time=LIVE_DATA_CACHE_TTL,
            value=json.dumps(frontend_payload)
        )

        return frontend_payload

    except httpx.HTTPStatusError:
        raise HTTPException(status_code=502, detail="Failed to fetch data from OpenWeather.")

    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error while processing air quality data.")

#Helper function to clear out missing data or fallback values from OpenWeather
def clean_value(val):
    return val if val is not None and val > 0 else None

#Helper function to generate a standard EPA score based on the 1-5 index
def calculate_visual_score(aqi_index: int) -> int:
    score_mapping = {
        1: 25,   # Middle of 0-50
        2: 75,   # Middle of 51-100
        3: 125,  # Middle of 101-150
        4: 175,  # Middle of 151-200
        5: 250   # Middle of 201-300
    }
    return score_mapping.get(aqi_index, 0)

#Helper function to map OpenWeather's 1-5 AQI index to a readable status
def get_aqi_status(aqi_index: int) -> str:
    status_mapping = {
        1: "Good",
        2: "Fair",
        3: "Moderate",
        4: "Unhealthy",
        5: "Very Unhealthy"
    }
    return status_mapping.get(aqi_index, "Unknown")


async def fetch_historical_aqi(municipality: str, year: int) -> dict:
    redis_key = f"aqi:historical:{municipality}:{year}"
    redis_client = get_redis_client()

    try:
        #Checks the cache first
        cached_data = await redis_client.get(redis_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redis cache error: {e}")

    #Runs db query in a separate thread to avoid blocking the event loop
    result = await asyncio.to_thread(fetch_from_db, municipality, year)

    if not result:
        raise HTTPException(status_code=404, detail="No historical AQI data found.")

    monthly_data = [None] * 12
    for row in result:
        month_index = int(row.month) - 1
        monthly_data[month_index] = float(row.mean_aqi)

    response_data = {
        "region": municipality,
        "year": year,
        "data": monthly_data
    }

    try:
        await redis_client.setex(redis_key, HISTORICAL_DATA_CACHE_TTL, json.dumps(response_data))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redis cache error: {e}")

    return response_data

#Helper function to run the query in a separate thread
def fetch_from_db(municipality: str, year: int):
        engine = get_db_client()
        with Session(engine) as session:
            query = (
                select(HistoricalAqi.month, HistoricalAqi.mean_aqi)
                .where(HistoricalAqi.municipality == municipality)
                .where(HistoricalAqi.year == year)
                .order_by(HistoricalAqi.month)
            )   
            return session.execute(query).fetchall()
