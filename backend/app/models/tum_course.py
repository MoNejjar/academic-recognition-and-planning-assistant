"""
TUM Course model storing cached module metadata.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TUMCourse(Base):
    """SQLAlchemy model representing a TUM module."""

    __tablename__ = "tum_courses"

    module_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    module_code: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    module_title: Mapped[str] = mapped_column(String(512), nullable=False)
    module_title_en: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    module_credits: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    description_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    description_version: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    module_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    module_content_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    module_outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    module_outcome_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:  # pragma: no cover - convenience
        return f"TUMCourse(module_id={self.module_id!r}, module_code={self.module_code!r})"


class TUMCourseRead(BaseModel):
    """Pydantic schema for returning TUM course data."""

    module_id: int
    module_code: str
    module_title: str
    module_title_en: Optional[str]
    module_credits: Optional[float]
    description_id: Optional[int]
    description_version: Optional[str]
    module_content: Optional[str]
    module_content_en: Optional[str]
    module_outcome: Optional[str]
    module_outcome_en: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }
