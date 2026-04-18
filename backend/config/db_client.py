from sqlalchemy import create_engine, Engine
from dotenv import load_dotenv
import os

_db_client: Engine | None = None

def get_db_client() -> Engine:
    global _db_client

    if _db_client is None:
        load_dotenv()
        db_url = os.getenv("DB_URL")
        if not db_url:
            raise RuntimeError("DB_URL is not configured.")

        _db_client = create_engine(db_url)

    return _db_client