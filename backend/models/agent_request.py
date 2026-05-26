from pydantic import BaseModel
from typing import Dict
from models.pollutant_forecast import PollutantForecast

class AgentRequest(BaseModel):
    region: str
    forecast_data: Dict[str, PollutantForecast]
    language: str = "en"