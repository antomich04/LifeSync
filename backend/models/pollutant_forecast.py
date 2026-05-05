from pydantic import BaseModel

class PollutantForecast(BaseModel):
    predictedPeak: float
    trend: str
    unit: str