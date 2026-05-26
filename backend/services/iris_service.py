from typing import Dict
from models.pollutant_forecast import PollutantForecast
from langchain_core.messages import HumanMessage
from agents.graph import master_graph

async def run_iris_agent(region: str, forecast_data: Dict[str, PollutantForecast], language: str = "en") -> str:
    
    #Converts pydantic models to dictionaries so the llm can parse them easier in the prompt
    formatted_forecast = {k: v.model_dump() for k, v in forecast_data.items()}
    
    initial_state = {
        "messages": [HumanMessage(content="Please write my air quality report.")],
        "region": region,
        "forecast_data": formatted_forecast,
        "target_agent": "iris",
        "language": language
    }
    
    #Runs the graph asynchronously
    final_state = await master_graph.ainvoke(initial_state)
    
    #Extracts the final text from the last message in the state
    final_markdown = final_state["messages"][-1].content
    
    return final_markdown