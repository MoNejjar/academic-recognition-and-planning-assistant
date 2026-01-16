"""
Application Configuration

Environment variables and settings
"""

from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

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
    # Defaults to OpenAI gpt-4o, but can be overridden in .env:
    #   LLM_PROVIDER=gemini, openrouter, ollama, groq
    #   LLM_MODEL=gemini-2.5-flash, llava, etc.
    # For PDF extraction, use vision-capable models (see pdf_extraction/README.md)
    LLM_PROVIDER: str = "groq"  # Options: openai, gemini, groq, openrouter, ollama
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "llama-3.3-70b-versatile"  # Default to vision-capable model
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
print("=" * 50)
print("⚙️  Configuration loaded:")
print(f"   LLM_PROVIDER: {settings.LLM_PROVIDER}")
print(f"   LLM_API_KEY: {'✅ Set' if settings.LLM_API_KEY else '❌ NOT SET'}")
print(f"   LLM_MODEL: {settings.LLM_MODEL}")
print("=" * 50)