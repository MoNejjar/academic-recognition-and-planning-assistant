"""
Test Configuration

Pytest fixtures and configuration
"""

from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base
from app.models.document import Document  # noqa: F401
from app.services.storage.file_storage import FileStorage


@pytest.fixture
def client():
    """Create test client"""
    from app.main import app
    return TestClient(app)


@pytest.fixture
def storage(tmp_path: Path) -> FileStorage:
    """Provide a temporary FileStorage instance."""
    return FileStorage(upload_dir=str(tmp_path))


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Provide an in-memory SQLite DB session for tests."""
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def mock_llm_client():
    """Create mock LLM client for testing"""
    # TODO: Implement
    pass
