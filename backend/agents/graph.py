from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from agents.state import AgentState
from agents.iris.tools import iris_tools_list
from agents.iris.node import iris_think, iris_should_continue
from agents.hermes.node import hermes_think, hermes_should_continue
from agents.hermes.tools import hermes_tools_list

#Temporary router
def route_start(state: AgentState) -> str:
    """Routes to the correct agent based on the initial human message."""
    initial_message = state["messages"][0].content.lower()
    
    if "products" in initial_message:
        return "hermes"
    
    #Defaults to iris for reports
    return "iris"

workflow = StateGraph(AgentState)

workflow.add_node("iris", iris_think)
workflow.add_node("iris_tools", ToolNode(iris_tools_list))
workflow.add_node("hermes", hermes_think)
workflow.add_node("hermes_tools", ToolNode(hermes_tools_list))

workflow.add_conditional_edges(START, route_start, ["iris", "hermes"])

workflow.add_conditional_edges("iris", iris_should_continue, ["iris_tools", END])
workflow.add_edge("iris_tools", "iris")
workflow.add_conditional_edges("hermes", hermes_should_continue, ["hermes_tools", END])
workflow.add_edge("hermes_tools", "hermes")

master_graph = workflow.compile()