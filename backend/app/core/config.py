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
    # NOTE: For PDF table extraction, use a VISION-CAPABLE model:
    #   OpenAI: gpt-4o, gpt-4o-mini, gpt-4-turbo
    #   Gemini: gemini-2.5-flash, gemini-2.5-pro, gemini-3-flash-preview, gemini-3-pro-preview
    # Non-vision models (gpt-4, gpt-3.5-turbo, llama, etc.) will NOT work for extraction.
    LLM_PROVIDER: str = "openai"  # Options: openai, gemini, groq, openrouter, ollama
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o"  # Default to vision-capable model
    LLM_BASE_URL: Optional[str] = None
    LLM_RATE_LIMIT_RPM: int = 60
    LLM_MAX_RETRIES: int = 3

    # Auth settings
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Storage settings
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB


settings = Settings()
