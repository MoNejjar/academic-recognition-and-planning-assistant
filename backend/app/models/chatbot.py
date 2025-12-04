"""
Chatbot Models

Pydantic models for chatbot requests and responses
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatMessage(BaseModel):
    """A chat message"""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Request to send a chat message"""
    message: str
    context_ids: Optional[List[str]] = None


class ChatResponse(BaseModel):
    """Response from chatbot"""
    message: str
    sources: Optional[List[str]] = None


# TODO: Add more models as needed
