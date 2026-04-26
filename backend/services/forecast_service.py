import json
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from config.redis_client import get_redis_client
from config.db_client import get_db_client
from models.daily_air_forecast import DailyAirForecast

FORECAST_CACHE_TTL = 43200

async def fetch_forecast(municipality: str) -> dict:
    redis_key = f"forecast:{municipality}"
    
    try:
        redis_client = get_redis_client()
        
        cached_data = await redis_client.get(redis_key)
        if cached_data:
            return json.loads(cached_data)
            
    except Exception as e:
        print(f"Redis cache error: {e}")

    engine = get_db_client()
    async with AsyncSession(engine) as session:
        query = (
            select(DailyAirForecast)
            .where(DailyAirForecast.municipality == municipality)
        )
        result = await session.execute(query)
        forecast_rows = result.scalars().all()

    if not forecast_rows:
        raise HTTPException(
            status_code=404, 
            detail=f"No predictive forecast found for region: {municipality}"
        )

    response_data = {
        "region": municipality,
        "generatedAt": datetime.utcnow().isoformat(),
        "predictions": {}
    }

    for row in forecast_rows:
        #row.pollutant will be 'no2', 'o3', 'co', or 'so2'
        response_data["predictions"][row.pollutant] = {
            "currentValue": row.current_value,
            "predictedPeak": row.predicted_peak,
            "trend": row.trend,
            "confidenceScore": row.confidence_score,
            "unit": row.unit,
            "historicalDates": row.historical_dates,
            "historicalData": row.historical_data,
            "futureDates": row.future_dates,
            "futureData": row.future_data
        }

    try:
        await redis_client.setex(
            name=redis_key, 
            time=FORECAST_CACHE_TTL, 
            value=json.dumps(response_data)
        )
    except Exception as e:
        print(f"Redis cache set error: {e}")

    return response_data
