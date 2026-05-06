from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from agents.state import AgentState
from agents.iris.tools import iris_tools_list
from agents.iris.node import iris_think, iris_should_continue


workflow = StateGraph(AgentState)

workflow.add_node("iris", iris_think)
workflow.add_node("iris_tools", ToolNode(iris_tools_list))

workflow.add_edge(START, "iris")
workflow.add_conditional_edges("iris", iris_should_continue, ["iris_tools", END])
workflow.add_edge("iris_tools", "iris")

master_graph = workflow.compile()