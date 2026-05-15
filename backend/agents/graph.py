from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from agents.state import AgentState
from agents.iris.tools import iris_tools_list
from agents.iris.node import iris_think, iris_should_continue
from agents.hermes.node import hermes_think, hermes_should_continue
from agents.hermes.tools import hermes_tools_list
from agents.lucy.tools import lucy_tools_list
from agents.lucy.node import lucy_think, lucy_should_continue

def route_start(state: AgentState) -> str:
    """Routes directly to the intended agent based on the explicit state field."""
    #Reads the target_agent passed from the corresponding service
    return state.get("target_agent", "lucy")

workflow = StateGraph(AgentState)

workflow.add_node("iris", iris_think)
workflow.add_node("iris_tools", ToolNode(iris_tools_list))
workflow.add_node("hermes", hermes_think)
workflow.add_node("hermes_tools", ToolNode(hermes_tools_list))
workflow.add_node("lucy", lucy_think)
workflow.add_node("lucy_tools", ToolNode(lucy_tools_list))

workflow.add_conditional_edges(START, route_start, ["iris", "hermes", "lucy"])

workflow.add_conditional_edges("iris", iris_should_continue, ["iris_tools", END])
workflow.add_edge("iris_tools", "iris")
workflow.add_conditional_edges("hermes", hermes_should_continue, ["hermes_tools", END])
workflow.add_edge("hermes_tools", "hermes")
workflow.add_conditional_edges("lucy", lucy_should_continue, ["lucy_tools", END])
workflow.add_edge("lucy_tools", "lucy")

master_graph = workflow.compile()