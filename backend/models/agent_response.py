from pydantic import BaseModel

class AgentResponse(BaseModel):
    status: str
    data: dict