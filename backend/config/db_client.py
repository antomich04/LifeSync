from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from dotenv import load_dotenv
import os

_db_client: AsyncEngine | None = None

def get_db_client() -> AsyncEngine:
    global _db_client

    if _db_client is None:
        load_dotenv()
        db_url = os.getenv("DB_URL")
        if not db_url:
            raise RuntimeError("DB_URL is not configured.")

        _db_client = create_async_engine(db_url)

    return _db_client