"""
Test Configuration

Pytest fixtures and configuration
"""

import pytest
from fastapi.testclient import TestClient

# TODO: Add fixtures for test database
# TODO: Add fixtures for mock LLM client
# TODO: Add fixtures for authenticated users


@pytest.fixture
def client():
    """Create test client"""
    from app.main import app
    return TestClient(app)


@pytest.fixture
def mock_llm_client():
    """Create mock LLM client for testing"""
    # TODO: Implement
    pass
