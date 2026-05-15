import json
import re
from typing import Dict, List
from langchain_core.messages import HumanMessage
from agents.graph import master_graph
from models.pollutant_forecast import PollutantForecast

def extract_json_object(content: str) -> str:
    match = re.search(r"\{.*\}", content, re.DOTALL)
    return match.group() if match else content


async def run_hermes_agent(region: str, forecast_data: Dict[str, PollutantForecast]) -> List[dict]:
    #Converts to simple dictionaries for the llm
    formatted_forecast = {k: v.model_dump() for k, v in forecast_data.items()}

    initial_state = {
        "messages": [HumanMessage(content="Find me protection products.")],
        "region": region,
        "forecast_data": formatted_forecast,
        "target_agent": "hermes"
    }

    final_state = await master_graph.ainvoke(initial_state)
    response_content = final_state["messages"][-1].content

    try:
        parsed_data = json.loads(extract_json_object(response_content))
        return parsed_data.get("products", [])
    except json.JSONDecodeError:
        print("Failed to parse Hermes JSON output.")
        return []