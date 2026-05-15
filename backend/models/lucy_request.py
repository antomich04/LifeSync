from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str     
    content: str


class LucyRequest(BaseModel):
    messages: List[ChatMessage]
    region: Optional[str] = None