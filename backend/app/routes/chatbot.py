"""Chatbot routes with streaming SSE support."""

import html as html_module
import json
import os
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.chatbot import ChatHistoryResponse, ChatRequest
from app.services.chatbot.engine import ChatService
from app.utils.rate_limiter import RateLimitExceeded, get_chat_rate_limiter

router = APIRouter()

# Trusted proxy IPs (add your load balancer IPs here)
TRUSTED_PROXIES: set[str] = set(os.environ.get("TRUSTED_PROXIES", "127.0.0.1").split(","))


def get_chat_service(db: Session = Depends(get_db)) -> ChatService:
    return ChatService(db)


def get_client_ip(request: Request) -> str:
    """Extract client IP, only trusting X-Forwarded-For from known proxies."""
    client_ip = request.client.host if request.client else "unknown"

    # Only trust forwarded headers if request comes from trusted proxy
    if client_ip in TRUSTED_PROXIES:
        if forwarded := request.headers.get("X-Forwarded-For"):
            return forwarded.split(",")[0].strip()
        if real_ip := request.headers.get("X-Real-IP"):
            return real_ip

    return client_ip


ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]


@router.post("/chat")
async def chat(request_body: ChatRequest, request: Request, chat_service: ChatServiceDep) -> StreamingResponse:
    client_ip = get_client_ip(request)

    async def event_generator():
        async for chunk in chat_service.stream_chat(
            message=request_body.message,
            chat_id=request_body.chat_id,
            client_ip=client_ip,
        ):
            yield f"data: {json.dumps(chunk)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@router.get("/history/{chat_id}")
async def get_history(chat_id: str, request: Request, chat_service: ChatServiceDep) -> ChatHistoryResponse:
    # Rate limit history requests too
    try:
        get_chat_rate_limiter().check(get_client_ip(request))
    except RateLimitExceeded as e:
        raise HTTPException(status_code=429, detail=e.message, headers={"Retry-After": str(int(e.retry_after))})

    session = chat_service.repo.get_session(chat_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return ChatHistoryResponse(
        chat_id=chat_id,
        messages=chat_service.get_history(chat_id),
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.get("/health")
async def chatbot_health() -> dict[str, str | bool | int]:
    from app.services.rag.vector_store import get_vector_store

    doc_count = get_vector_store().get_document_count()

    # -1 indicates vector store access error (not just empty)
    if doc_count < 0:
        return {
            "status": "unhealthy",
            "rag_initialized": False,
            "document_count": 0,
            "error": "Vector store unavailable",
        }

    is_initialized = doc_count > 0
    status = "healthy" if is_initialized else "degraded"

    return {
        "status": status,
        "rag_initialized": is_initialized,
        "document_count": doc_count,
    }


# Document serving
RAG_SOURCES_DIR = Path(__file__).resolve().parents[2] / "data" / "rag_sources"
ALLOWED_EXTENSIONS = {".pdf", ".rtf"}


def _validate_document_path(filename: str) -> Path:
    """Validate filename and return the resolved file path."""
    # Prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    # Only allow specific file extensions
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_path = (RAG_SOURCES_DIR / filename).resolve()

    # Verify resolved path is still within allowed directory
    if not file_path.is_relative_to(RAG_SOURCES_DIR.resolve()):
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")

    return file_path


@router.get("/documents/{filename}")
async def get_document(filename: str):
    """Serve PDF/RTF documents from the RAG sources directory."""
    file_path = _validate_document_path(filename)

    media_types = {".pdf": "application/pdf", ".rtf": "application/rtf"}
    media_type = media_types.get(file_path.suffix.lower(), "application/octet-stream")

    return FileResponse(
        path=file_path,
        media_type=media_type,
        headers={"Content-Disposition": "inline"},
    )


@router.get("/view/{filename}")
async def view_document(filename: str):
    """Serve an HTML page that displays the PDF in an embedded viewer."""
    file_path = _validate_document_path(filename)

    # For RTF files, just serve directly
    if file_path.suffix.lower() == ".rtf":
        return FileResponse(path=file_path, media_type="application/rtf")

    # Escape filename for safe HTML embedding
    safe_filename = html_module.escape(filename)

    # HTML page with embedded PDF viewer
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>{safe_filename}</title>
    <style>
        body {{ margin: 0; padding: 0; height: 100vh; }}
        embed {{ width: 100%; height: 100%; }}
    </style>
</head>
<body>
    <embed src="/api/chatbot/documents/{safe_filename}" type="application/pdf" />
</body>
</html>"""
    return HTMLResponse(content=html)
