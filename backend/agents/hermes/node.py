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

    WORKFLOW & STRATEGY:
    1. Check the Pollutant Data below.
    2. If there is ONLY ONE elevated pollutant: 
       - Call `search_greek_marketplaces` for that specific pollutant.
       - Output EXACTLY TWO recommended products for it in the JSON.
    3. If there are MULTIPLE elevated pollutants: 
       - Call `search_greek_marketplaces` for EACH pollutant (make multiple tool calls).
       - Output EXACTLY ONE recommended product for EACH pollutant in the JSON.
    4. You must strictly use the exact URLs, Names, and Prices returned by the tool.

    JSON SCHEMA:
    {{
      "thought_process": "Brief explanation of the pollutant(s) and your strategy.",
      "products": [
        {{
          "name": "Product Name from search results",
          "reason": "One short sentence explaining how it mitigates [Insert Pollutant Name]",
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
