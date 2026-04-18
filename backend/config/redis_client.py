import os
import redis.asyncio as redis

_redis_client: redis.Redis | None = None

def get_redis_client() -> redis.Redis:
    global _redis_client

    if _redis_client is None:
        redis_url = os.getenv("REDIS_URL")
        if not redis_url:
            raise RuntimeError("REDIS_URL is not configured.")

        _redis_client = redis.from_url(redis_url, decode_responses=True)

    return _redis_client
