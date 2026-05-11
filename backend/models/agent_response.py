from pydantic import BaseModel
from typing import Dict, Any

class AgentResponse(BaseModel):
    status: str
    data: Dict[str, Any]