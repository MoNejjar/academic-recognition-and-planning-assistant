"""
Application Configuration

Environment variables and settings
"""

from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    # .env is used in local testing and development
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App settings
    APP_NAME: str = "ARIP"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./arip.db"
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_PORT: int = 5432

    # LLM settings
    # Provider-specific defaults are used if LLM_MODEL/CHATBOT_MODEL not set
    # See llm_service/client.py PROVIDER_DEFAULTS for default models
    LLM_PROVIDER: str = "openai"  # Options: openai, gemini, groq, openrouter, ollama
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: Optional[str] = None  # If None, uses provider-specific default (e.g. gpt-4o for openai)
    CHATBOT_MODEL: Optional[str] = None  # If None, uses provider-specific default (e.g. gpt-4o-mini for openai)
    LLM_BASE_URL: Optional[str] = None  # For Ollama: http://localhost:11434
    LLM_RATE_LIMIT_RPM: int = 60
    LLM_MAX_RETRIES: int = 3

    # Auth settings
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Storage settings
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB


settings = Settings()
