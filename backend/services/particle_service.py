import json
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, extract
from config.redis_client import get_redis_client
from config.db_client import get_db_client
from models.historical_particles import HistoricalParticle 

HISTORICAL_DATA_CACHE_TTL = 900 #15 minutes

async def fetch_historical_particles(municipality: str, year: int) -> dict:
    redis_key = f"particles:historical:{municipality}:{year}"
    redis_client = get_redis_client()

    try:
        cached_data = await redis_client.get(redis_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        print(f"Redis cache error: {e}")

    
    engine = get_db_client()
    async with AsyncSession(engine) as session:
        query = (
            select(
                HistoricalParticle.date,
                HistoricalParticle.no2,
                HistoricalParticle.o3,
                HistoricalParticle.co,
                HistoricalParticle.so2
            )
            .where(HistoricalParticle.municipality == municipality)
            .where(extract('year', HistoricalParticle.date) == year)
            .order_by(HistoricalParticle.date)
        )
        
        result = await session.execute(query)
        rows = result.all()

        if not rows:
            raise HTTPException(status_code=404, detail="No historical particle data found.")

        #Formats data into parallel arrays for frontend charts
        dates = []
        no2 = []
        o3 = []
        co = []
        so2 = []

        for row in rows:
            dates.append(row.date.isoformat())
            no2.append(float(row.no2) if row.no2 is not None else None)
            o3.append(float(row.o3) if row.o3 is not None else None)
            co.append(float(row.co) if row.co is not None else None)
            so2.append(float(row.so2) if row.so2 is not None else None)

        response_data = {
            "region": municipality,
            "year": year,
            "dates": dates,
            "no2": no2,
            "o3": o3,
            "co": co,
            "so2": so2
        }

        try:
            await redis_client.setex(redis_key, HISTORICAL_DATA_CACHE_TTL, json.dumps(response_data))
        except Exception as e:
            print(f"Redis cache error: {e}")

        return response_data