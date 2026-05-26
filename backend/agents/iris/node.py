from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END
from agents.state import AgentState
from agents.iris.tools import iris_tools_list

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.2, max_tokens=2500).bind_tools(iris_tools_list)

def iris_think(state: AgentState):
    language = state.get("language", "en")
    response_language = "Greek" if language == "el" else "English"
    pollutant_codes = [pollutant.upper() for pollutant in state["forecast_data"].keys()]
    
    sys_msg = SystemMessage(content=f"""You are Iris, an AI Air Quality Educator. Write a micro-learning module for the pollutants in {state['region']}.

Rules (follow exactly):
- Write the explanatory insight text in {response_language}.
- Source titles, Wikipedia article titles, and YouTube video titles must stay in English.
- No intros, greetings, or conclusions. Never repeat numerical forecast data.
- For EVERY pollutant in this list: {", ".join(pollutant_codes)}, you MUST call BOTH tools (`search_web_for_health_effects` and `search_youtube_for_lesson`) using the pollutant code as the argument before writing the final report.
- Once you have gathered the tool outputs for all pollutants, assemble the final report.
- Cover EVERY pollutant in this exact order: {", ".join(pollutant_codes)}.
- For EVERY pollutant: header as `### **POLLUTANT_CODE**`, then 2-3 sentences explaining what it is, health effects, and one safety tip.
- End each section with a blank line, then append the sources using this format:

**Sources & Additional Information:**
- [YouTube video](URL_FROM_YOUTUBE_TOOL)
- [Wikipedia article](URL_FROM_WIKIPEDIA_TOOL)

- Leave a blank line after citations before starting the next pollutant.

Current Data: {state['forecast_data']}""")
    
    response = llm.invoke([sys_msg] + state["messages"])
    return {"messages": [response]}

def iris_should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "iris_tools"
    return END