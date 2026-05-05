from typing import Dict
from models.pollutant_forecast import PollutantForecast

async def run_iris_agent(region: str, forecast_data: Dict[str, PollutantForecast]) -> str:

    pollutants_list = ", ".join(forecast_data.keys())
    
    #Mock Response
    mock_markdown = f"""### 🌬️ Iris Report for {region}
    
I have analyzed the predictions for: **{pollutants_list}**.

Once the LangGraph agent is built, I will replace this text with a real educational summary and YouTube links based on the specific `predictedPeak` and `trend` of these pollutants!
    """
    
    return mock_markdown