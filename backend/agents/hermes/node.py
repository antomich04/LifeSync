from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END
from agents.hermes.tools import hermes_tools_list
from agents.state import AgentState
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, max_tokens=800).bind_tools(hermes_tools_list, strict=True).bind(response_format={"type": "json_object"})

def hermes_think(state: AgentState):

    sys_msg = SystemMessage(
        content=f"""
    You are Hermes, an air quality shopping assistant.

    WORKFLOW:
    1. Identify the most elevated pollutant from the data below.
    2. Call `search_greek_marketplaces` with that exact pollutant name (e.g., "NO2").
    3. Output exactly TWO recommended products as a JSON object, strictly using the results provided by the tool.

    JSON SCHEMA:
    {{
      "thought_process": "Brief explanation of the pollutant and chosen product.",
      "products": [
        {{
          "name": "Product Name from search results",
          "reason": "One short sentence explaining how it mitigates the pollutant",
          "price": "Price if listed, or 'Check site'",
          "icon": "shield", 
          "url": "Exact URL from search results, or null if none found"
        }}
      ]
    }}

    *Note: For 'icon', choose either 'shield' or 'filter'. Do not generate raw SVG paths.*

    Current Pollutant Data: {state['forecast_data']}
    """
    )

    response = llm.invoke([sys_msg] + state["messages"])
    return {"messages": [response]}


def hermes_should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "hermes_tools"
    return END
