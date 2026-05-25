import json
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from config.redis_client import get_redis_client
from config.db_client import get_db_client
from models.historical_wqi import HistoricalWqi

WQI_CACHE_TTL = 86400 #24 hours 

async def fetch_historical_wqi(municipality: str, year: int) -> dict:
    redis_key = f"historical_wqi:{municipality}:{year}"
    
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
            select(HistoricalWqi)
            .where(HistoricalWqi.municipality == municipality)
            .where(HistoricalWqi.year == year)
            .order_by(HistoricalWqi.month.asc())
        )
        result = await session.execute(query)
        records = result.scalars().all()

    if not records:
        return {"data": []}

    #Formats the response for the frontend
    formatted_data = []
    for row in records:
        formatted_data.append({
            "month": row.month,
            "wqi_score": row.wqi_score,
            "ph": row.ph,
            "chlorides": row.chlorides,
            "turbidity": row.turbidity,
            "aluminum": row.aluminum,
            "conductivity": row.conductivity
        })

    response_data = {"data": formatted_data}

    try:
        if redis_client:
            await redis_client.setex(
                name=redis_key,
                time=WQI_CACHE_TTL,
                value=json.dumps(response_data)
            )
    except Exception as e:
        print(f"Redis cache set error: {e}")

    return response_data