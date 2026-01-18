"""Chat session repository."""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.chat_history import ChatSession
from app.models.chatbot import ChatMessage, Role, SourceReference


class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(self) -> str:
        session_id = str(uuid4())
        self.db.add(ChatSession(id=session_id, messages=[]))
        self.db.commit()
        return session_id

    def get_session(self, session_id: str) -> ChatSession | None:
        return self.db.get(ChatSession, session_id)

    def get_or_create_session(self, session_id: str | None) -> str:
        if session_id and self.get_session(session_id):
            return session_id
        return self.create_session()

    def get_history(self, session_id: str) -> list[ChatMessage]:
        session = self.get_session(session_id)
        if not session:
            return []
        return [
            ChatMessage(
                role=msg["role"],
                content=msg["content"],
                timestamp=msg.get("timestamp"),
                sources=[SourceReference(**s) for s in msg.get("sources", [])] or None,
            )
            for msg in session.messages
        ]

    def add_message(
        self, session_id: str, role: Role, content: str, sources: list[SourceReference] | None = None
    ) -> bool:
        session = self.get_session(session_id)
        if not session:
            return False

        msg: dict = {"role": role, "content": content, "timestamp": datetime.now(timezone.utc).isoformat()}
        if sources:
            msg["sources"] = [s.model_dump() for s in sources]

        session.messages = [*session.messages, msg]
        session.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        return True
