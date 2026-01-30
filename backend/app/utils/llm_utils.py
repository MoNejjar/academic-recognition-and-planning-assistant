"""
LLM Client Utilities

Shared utilities for creating and configuring LLM clients across the application.
"""

import logging
from fastapi import HTTPException

from app.core.config import settings
from app.services.llm_service.client import (
    LLMProvider,
    create_llm_client,
    BaseLLMClient,
    get_default_model
)

logger = logging.getLogger(__name__)


def get_llm_client(use_case: str = "chat") -> BaseLLMClient:
    """
    Get configured LLM client based on environment settings.
    
    This is the centralized function for creating LLM clients across the application.
    
    Args:
        use_case: Either "chat" or "vision" to select appropriate default model
    
    Returns:
        Configured LLM client instance
        
    Raises:
        HTTPException: If provider is unknown or API key is missing
        
    Environment variables used:
        LLM_PROVIDER: Provider name (openai, gemini, groq, openrouter, ollama)
        LLM_API_KEY: API key for the provider (not needed for ollama)
        LLM_MODEL: Model name (optional, uses provider defaults if not set)
        LLM_BASE_URL: Base URL for ollama (optional, defaults to localhost)
    """
    # Map provider string to enum
    provider_map = {
        "openai": LLMProvider.OPENAI,
        "gemini": LLMProvider.GEMINI,
        "groq": LLMProvider.GROQ,
        "openrouter": LLMProvider.OPENROUTER,
        "ollama": LLMProvider.OLLAMA,
    }
    
    provider = provider_map.get(settings.LLM_PROVIDER.lower())
    if not provider:
        logger.error(f"Unknown LLM_PROVIDER: {settings.LLM_PROVIDER}")
        raise HTTPException(
            status_code=500,
            detail=f"Unknown LLM_PROVIDER: {settings.LLM_PROVIDER}"
        )
    
    # Ollama doesn't require API key
    if provider != LLMProvider.OLLAMA and not settings.LLM_API_KEY:
        logger.error("LLM_API_KEY not configured")
        raise HTTPException(
            status_code=500,
            detail="LLM_API_KEY not configured"
        )
    
    # Build kwargs for client creation
    model = settings.LLM_MODEL or get_default_model(settings.LLM_PROVIDER, use_case)
    kwargs = {
        "provider": provider,
        "api_key": settings.LLM_API_KEY,
        "model": model,
    }
    
    # Only pass base_url for Ollama
    if provider == LLMProvider.OLLAMA and settings.LLM_BASE_URL:
        kwargs["base_url"] = settings.LLM_BASE_URL
    
    logger.debug(f"Creating LLM client: provider={settings.LLM_PROVIDER}, model={model}")
    return create_llm_client(**kwargs)
