"""
Database configuration and session management.
"""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
	"""Base class for SQLAlchemy models."""


engine = create_engine(
	settings.DATABASE_URL,
	echo=settings.DEBUG,
	future=True,
	pool_pre_ping=True,
)

SessionLocal = sessionmaker(
	autocommit=False,
	autoflush=False,
	bind=engine,
	future=True,
)


def get_db():
	"""Provide a transactional scope for request handlers."""
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


def init_db() -> None:
	"""Create database tables if they do not exist."""
	# Import models for metadata registration
	from app.models.document import Document  # noqa: F401
	from app.models.tum_course import TUMCourse  # noqa: F401
	from app.models.chat_history import ChatSession  # noqa: F401
	from app.models.submission import StudentSubmission  # noqa: F401
	from app.models.analytics import AnalyticsResult  # noqa: F401
	from app.models.task import Task  # noqa: F401

	Base.metadata.create_all(bind=engine)
