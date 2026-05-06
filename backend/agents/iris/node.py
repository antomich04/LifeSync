from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END
from agents.state import AgentState
from agents.iris.tools import iris_tools_list

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, max_tokens=600).bind_tools(iris_tools_list)

#Defines the system message
def iris_think(state: AgentState):
    
    sys_msg = SystemMessage(content=f"""You are Iris, an AI Air Quality Educator. Write a micro-learning module for the pollutants in {state['region']}.

Rules (follow exactly):
- No intros, greetings, or conclusions. Never repeat numerical forecast data.
- For EVERY pollutant: header as `### **Pollutant Name**`, then 2-3 sentences (what it is, health effects, one safety tip). ALWAYS ground these sentences to retrieved wikipedia articles and youtube videos
- Use tools to fetch a Wikipedia article and YouTube video for EVERY pollutant.
- End each section with a blank line, then:

**Sources & Additional Information:**
- [YouTube video](url)
- [Wikipedia article](url)

- Leave a blank line after citations before the next pollutant.

Current Data: {state['forecast_data']}""")
    
    response = llm.invoke([sys_msg] + state["messages"])
    return {"messages": [response]}


#Defines where to route the conditional edge on the graph
def iris_should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "iris_tools"
    return END