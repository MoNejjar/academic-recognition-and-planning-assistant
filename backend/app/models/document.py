"""
Document model and schema for stored files.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Document(Base):
    """SQLAlchemy model storing metadata for uploaded files."""

    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    relative_path: Mapped[str] = mapped_column(String(512), nullable=False)
    content_type: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:  # pragma: no cover - convenience
        return f"Document(id={self.id!r}, stored_filename={self.stored_filename!r})"


class DocumentRead(BaseModel):
    """Pydantic schema representing stored document metadata."""

    id: str
    original_filename: str
    stored_filename: str
    relative_path: str
    content_type: Optional[str]
    size_bytes: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }
