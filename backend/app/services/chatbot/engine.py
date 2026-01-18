"""Chatbot Engine - RAG + Groq streaming."""

import asyncio
import logging
import os
from typing import AsyncGenerator, TypedDict

from dotenv import load_dotenv

if os.environ.get("ENVIRONMENT") != "production":
    load_dotenv()

from sqlalchemy.orm import Session

from app.models.chatbot import ChatMessage, ChunkType, Role, SourceReference
from app.repositories.chat import ChatRepository
from app.services.chatbot.guardrails import check_guardrails
from app.services.rag.vector_store import SearchResult, VectorStoreError, get_vector_store
from app.utils.rate_limiter import RateLimitExceeded, get_chat_rate_limiter

logger = logging.getLogger(__name__)

# Mapping von Dateinamen zu Metadaten (display name)
SOURCE_METADATA: dict[str, dict[str, str]] = {
    "GesNot05.pdf": {"name": "Bayerische Formel (Notenumrechnung)"},
    "Informatik_MA_FPSO_Lesb._Fassung_19082024.pdf": {"name": "FPSO Master Informatik"},
    "OLA_Guide_CIT_Informatics.pdf": {"name": "OLA Guide CIT Informatics"},
    "Structure_MasterInfo_fromOct2018.pdf": {"name": "Programmstruktur Master Informatik"},
    "TUM_CIT_Informatics_Outgoing_Application_for_recognition.pdf": {"name": "Anrechnungsantrag CIT Informatik"},
    "WS25_26_MasterInformatik_Vorstellung.pdf": {"name": "Master Informatik Vorstellung WS25/26"},
    "Example_1_TU_Delft_Netherlands.pdf": {"name": "Beispiel: TU Delft (Niederlande)"},
    "Overview.rtf": {"name": "Credit Recognition Overview"},
}


def get_source_display_name(filename: str) -> str:
    """Gibt den lesbaren Namen für eine Quelldatei zurück."""
    meta = SOURCE_METADATA.get(filename)
    return meta["name"] if meta else filename


def get_document_path(filename: str) -> str:
    """Returns the API path to view this document."""
    return f"/api/chatbot/view/{filename}"


SYSTEM_PROMPT = """You are an academic advisor assistant for TUM Master's students in Informatics.
You help with questions about credit recognition from study abroad and exchange programs.

Base your answers ONLY on the following sources:
{context}

Your style:
- Advisory and guiding: Explain step by step what needs to be done
- Structured: Use numbered lists and checklists for processes
- Factual and precise: No filler words, get straight to the point
- Proactive: Point out important deadlines, common mistakes, or prerequisites

Formatting:
- Use numbered steps (1., 2., 3.) for instructions and processes
- Use checklists (- [ ]) when students need to prepare something
- Use bullet points for listing information
- Highlight important notes (e.g., "Important:", "Note:")

Rules:
- LANGUAGE: Respond in English by default. If the question is asked in another language, respond EXCLUSIVELY in that language. Never mix languages! No English terms in German answers and vice versa.
- Cite the source by name only (e.g., "According to OLA Guide, page 2..."). NEVER generate URLs or hyperlinks - sources with links will be displayed separately.
- Be honest if you cannot find something in the sources
- For complex questions: First give an overview, then details

Topics you know about:
- OLA (Online Learning Agreement) process
- Credit recognition and requirements
- FPSO (Examination regulations for Master Informatics)
- Grade conversion (Bavarian Formula)
- Program structure Master Informatics"""

GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # Llama 4, 500K tokens/day


class StreamChunk(TypedDict, total=False):
    type: ChunkType
    content: str | list[dict]
    chat_id: str | None
    retry_after: float


class ChatService:
    def __init__(self, db: Session):
        self.repo = ChatRepository(db)
        self.vector_store = get_vector_store()
        self.rate_limiter = get_chat_rate_limiter()
        self._groq = None

    @property
    def groq(self):
        if self._groq is None:
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                raise RuntimeError("GROQ_API_KEY environment variable not set")
            from groq import Groq
            self._groq = Groq(api_key=api_key)
        return self._groq

    def _build_context(self, results: list[SearchResult]) -> str:
        if not results:
            return "Keine relevanten Quellen gefunden."
        parts = []
        for i, r in enumerate(results, 1):
            display_name = get_source_display_name(r.document_name)
            page = f", Seite {r.page_number}" if r.page_number else ""
            parts.append(f"[Quelle {i}: {display_name}{page}]\n{r.text}")
        return "\n\n---\n\n".join(parts)

    def _to_sources(self, results: list[SearchResult]) -> list[SourceReference]:
        return [
            SourceReference(
                document=get_source_display_name(r.document_name),
                page=r.page_number,
                chunk_text=r.text,
                url=get_document_path(r.document_name),
            )
            for r in results
        ]

    async def stream_chat(
        self, message: str, chat_id: str | None = None, client_ip: str = "unknown"
    ) -> AsyncGenerator[StreamChunk, None]:
        try:
            # Rate limit
            try:
                self.rate_limiter.check(client_ip)
            except RateLimitExceeded as e:
                yield StreamChunk(type="error", content=e.message, retry_after=e.retry_after)
                return

            # Guardrails
            allowed, rejection = check_guardrails(message)
            if not allowed:
                logger.info("Guardrail blocked message from %s (first 100 chars: %s)", client_ip, message[:100])
                yield StreamChunk(type="text", content=rejection, chat_id=chat_id)
                yield StreamChunk(type="done", chat_id=chat_id)
                return

            # Session & context
            session_id = self.repo.get_or_create_session(chat_id)

            # RAG search - handle gracefully if vector store is unavailable
            try:
                context_results = self.vector_store.search(message, top_k=5)
            except VectorStoreError as e:
                logger.warning("RAG unavailable, continuing without context: %s", e)
                context_results = []

            history = self.repo.get_history(session_id)

            # Build messages
            messages: list[dict[str, str]] = [
                {"role": m.role, "content": m.content}
                for m in history
                if m.role in ("user", "assistant")
            ]
            messages.append({"role": "user", "content": message})
            self.repo.add_message(session_id, "user", message)

            # Stream from Groq (run sync client in thread pool to avoid blocking)
            full_response = ""
            groq_messages = [
                {"role": "system", "content": SYSTEM_PROMPT.format(context=self._build_context(context_results))},
                *messages,
            ]

            def create_stream():
                return self.groq.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=groq_messages,
                    max_tokens=2048,
                    temperature=0.3,
                    stream=True,
                )

            # Run sync Groq call in thread pool to avoid blocking event loop
            stream = await asyncio.to_thread(create_stream)

            # Process stream chunks (sync iteration in thread)
            def iterate_stream():
                chunks = []
                for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        chunks.append(chunk.choices[0].delta.content)
                return chunks

            text_chunks = await asyncio.to_thread(iterate_stream)
            for text in text_chunks:
                full_response += text
                yield StreamChunk(type="text", content=text, chat_id=session_id)

            # Sources & save
            sources = self._to_sources(context_results)
            yield StreamChunk(type="sources", content=[s.model_dump() for s in sources], chat_id=session_id)
            self.repo.add_message(session_id, "assistant", full_response, sources)
            yield StreamChunk(type="done", chat_id=session_id)

        except Exception as e:
            logger.exception("Error in stream_chat")
            # Sanitize error message - don't expose internal details to users
            yield StreamChunk(type="error", content="Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")

    def get_history(self, chat_id: str) -> list[ChatMessage]:
        return self.repo.get_history(chat_id)
