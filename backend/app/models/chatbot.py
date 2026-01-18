"""Chatbot Pydantic models."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Role = Literal["user", "assistant", "system"]
ChunkType = Literal["text", "sources", "done", "error"]


class SourceReference(BaseModel):
    document: str
    page: int | None = None
    chunk_text: str
    url: str | None = None


class ChatMessage(BaseModel):
    role: Role
    content: str
    timestamp: datetime | None = None
    sources: list[SourceReference] | None = None


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    chat_id: str | None = None


class ChatHistoryResponse(BaseModel):
    chat_id: str
    messages: list[ChatMessage]
    created_at: datetime
    updated_at: datetime
