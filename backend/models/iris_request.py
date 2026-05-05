from typing import Dict
from pydantic import BaseModel
from models.pollutant_forecast import PollutantForecast

class IrisRequest(BaseModel):
    region: str
    #The key is the pollutant name and the value is the forecast
    forecast_data: Dict[str, PollutantForecast]