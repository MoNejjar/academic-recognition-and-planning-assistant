"""
ARIP - Academic Recognition and Planning Assistant
FastAPI Backend Application Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import SessionLocal, init_db
from app.services.storage.data_cache import load_tum_modules_from_cache
from app.services.rag.vector_store import initialize_vector_store_if_needed

# Import routers
from app.routes import course_matching, reporting, chatbot

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:     [%(name)s] %(message)s",
    force=True,
)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize database, load cached TUM modules, and initialize RAG on startup."""

    # Validate required environment variables early
    from app.core.config import settings
    if not settings.LLM_API_KEY and settings.LLM_PROVIDER.lower() != "ollama":
        logger.warning(
            "LLM_API_KEY not set - chatbot will fail on first request. "
            "Set LLM_API_KEY in your .env file to enable the chatbot."
        )

    init_db()

    # Load TUM modules from cache
    db = SessionLocal()
    try:
        inserted = load_tum_modules_from_cache(db)
        if inserted and inserted > 0:
            logger.info("Loaded %s TUM modules from cache", inserted)
        else:
            logger.info("No TUM modules loaded from cache (inserted=%r)", inserted)
    except Exception:  # pragma: no cover - defensive logging only
        logger.exception("Failed to load TUM modules during startup")
    finally:
        db.close()

    # Initialize RAG vector store
    try:
        initialize_vector_store_if_needed()
    except Exception:
        logger.exception("Failed to initialize RAG vector store during startup")

    yield


app = FastAPI(
    title="ARIP API",
    description="Academic Recognition and Planning Assistant API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "ARIP API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Include routers
app.include_router(course_matching.router, prefix="/api/course-matching", tags=["PDF Extraction"])
app.include_router(reporting.router, prefix="/api/reports", tags=["Reporting"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
