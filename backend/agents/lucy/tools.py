import os
from langchain_core.tools import tool
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# NEW: Import your SQLAlchemy model
from models.daily_air_forecast import DailyAirForecast

# Ensure we have the DB URL (adjust this to match your app's actual DB config)
load_dotenv()
db_url_raw = os.getenv('DB_URL', '')
SYNC_DB_URL = db_url_raw.replace("+asyncpg", "") if db_url_raw else ""
engine = create_engine(SYNC_DB_URL) if SYNC_DB_URL else None

@tool
def get_air_quality_forecast(region: str) -> str:
    """
    Fetches the current and forecasted air quality data for a given region.
    Use this tool ONLY when the user asks for recommendations about outdoor activities,
    health risks, or the general air quality in their area.
    """
    if not engine:
        return "Error: Database connection is not configured."

    try:
        with Session(engine) as session:
            # NEW: Use SQLAlchemy ORM instead of raw string SQL!
            stmt = select(DailyAirForecast).where(DailyAirForecast.municipality == region)
            
            # Execute and extract the model instances
            results = session.execute(stmt).scalars().all()
            
            if not results:
                return f"I couldn't find any recent air quality data for {region}."

            # Format the data into a clean string for Lucy to read
            report_lines = [f"Live & Forecasted Air Quality Data for {region}:"]
            
            for row in results:
                pollutant = row.pollutant.upper()
                current = row.current_value
                peak = row.predicted_peak
                trend = row.trend
                unit = row.unit
                
                report_lines.append(
                    f"- {pollutant}: Currently at {current} {unit}. "
                    f"Predicted to peak at {peak} {unit} in the next 7 days. "
                    f"(Trend: {trend})"
                )

            # Join it all together for the LLM
            return "\n".join(report_lines)

    except Exception as e:
        return f"An error occurred while fetching the air quality data: {str(e)}"

lucy_tools_list = [get_air_quality_forecast]