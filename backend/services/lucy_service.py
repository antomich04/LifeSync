from typing import List, Optional
from langchain_core.messages import HumanMessage, AIMessage
from models.lucy_request import ChatMessage
from agents.graph import master_graph

async def run_lucy_agent(base_messages: List[ChatMessage], region: Optional[str] = None) -> str:
    """
    Invokes the master graph, routing explicitly to Lucy with a limited context window.
    """
    
    messages = []
    for msg in base_messages:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        else:
            messages.append(AIMessage(content=msg.content))
            
    #Keeps only the last 6 messages
    MAX_CONTEXT = 6
    if len(messages) > MAX_CONTEXT:
        messages = messages[-MAX_CONTEXT:]

    current_region = region if region else "Unknown"

    initial_state = {
        "messages": messages,
        "region": current_region,
        "forecast_data": {}, 
        "target_agent": "lucy"
    }

    final_state = await master_graph.ainvoke(initial_state)
    
    return final_state["messages"][-1].content