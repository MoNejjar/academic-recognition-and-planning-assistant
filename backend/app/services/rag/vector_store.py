"""Vector store using ChromaDB for semantic search."""

import logging
from pathlib import Path
from typing import TYPE_CHECKING

from pydantic import BaseModel

from app.services.rag.document_loader import DocumentChunk, load_all_documents


class VectorStoreError(Exception):
    """Raised when vector store operations fail."""


class SearchResult(BaseModel):
    """Result from a semantic search query."""

    text: str
    document_name: str
    page_number: int | None
    chunk_id: str
    score: float

    class Config:
        frozen = True


if TYPE_CHECKING:
    import chromadb

logger = logging.getLogger(__name__)

DEFAULT_CHROMA_PATH = Path(__file__).resolve().parents[3] / "data" / "chroma_db"
COLLECTION_NAME = "tum_anrechnung"


class VectorStore:
    def __init__(self, persist_path: Path | None = None):
        self.persist_path = persist_path or DEFAULT_CHROMA_PATH
        self._client: "chromadb.ClientAPI | None" = None
        self._collection: "chromadb.Collection | None" = None

    @property
    def client(self) -> "chromadb.ClientAPI":
        if self._client is None:
            try:
                import chromadb
                from chromadb.config import Settings
            except ImportError as e:
                raise ImportError("chromadb not installed. Run: pip install chromadb") from e

            self.persist_path.mkdir(parents=True, exist_ok=True)
            self._client = chromadb.PersistentClient(
                path=str(self.persist_path),
                settings=Settings(anonymized_telemetry=False),
            )
        return self._client

    @property
    def collection(self) -> "chromadb.Collection":
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"description": "TUM credit recognition documents"},
            )
        return self._collection

    def is_initialized(self) -> bool:
        """Check if the vector store has documents.

        Returns True if documents exist, False if empty.
        Raises VectorStoreError for connection/access issues.
        """
        try:
            return self.collection.count() > 0
        except Exception as e:
            # Log and re-raise - don't silently return False for real errors
            logger.error("Critical error checking vector store: %s", e, exc_info=True)
            raise VectorStoreError(f"Failed to access vector store: {e}") from e

    def initialize_from_documents(self, documents: list[DocumentChunk] | None = None) -> int:
        if documents is None:
            documents = load_all_documents()

        if not documents:
            logger.warning("No documents to index")
            return 0

        # Clear existing collection
        try:
            self.client.delete_collection(COLLECTION_NAME)
            self._collection = None
        except ValueError:
            pass  # Collection doesn't exist

        # Add documents in batches
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            self.collection.add(
                ids=[doc.id for doc in batch],
                documents=[doc.text for doc in batch],
                metadatas=[
                    {"document_name": doc.document_name, "page_number": doc.page_number or -1, "chunk_index": doc.chunk_index}
                    for doc in batch
                ],
            )

        logger.info("Indexed %d document chunks", len(documents))
        return len(documents)

    def search(self, query: str, top_k: int = 5) -> list[SearchResult]:
        """Search for relevant documents.

        Raises VectorStoreError if the store is not initialized or inaccessible.
        """
        if not self.is_initialized():
            logger.error("Vector store search called but store is not initialized - no RAG context available")
            raise VectorStoreError("Vector store is not initialized. Cannot perform semantic search.")

        results = self.collection.query(query_texts=[query], n_results=top_k, include=["documents", "metadatas", "distances"])

        docs = results.get("documents", [[]])[0] or []
        metas = results.get("metadatas", [[]])[0] or []
        dists = results.get("distances", [[]])[0] or []
        ids = results.get("ids", [[]])[0] or []

        def extract_page(meta: dict) -> int | None:
            page = meta.get("page_number", -1)
            return page if page > 0 else None

        return [
            SearchResult(
                text=doc,
                document_name=meta.get("document_name", "unknown"),
                page_number=extract_page(meta),
                chunk_id=chunk_id,
                score=1.0 / (1.0 + dist),
            )
            for doc, meta, dist, chunk_id in zip(docs, metas, dists, ids)
        ]

    def get_document_count(self) -> int:
        """Get the number of documents in the store.

        Returns -1 if the store is inaccessible (for health check differentiation).
        """
        try:
            return self.collection.count()
        except Exception as e:
            logger.error("Failed to get document count: %s", e, exc_info=True)
            return -1  # Distinguish from "zero documents" for health checks


_vector_store: VectorStore | None = None


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store


def initialize_vector_store_if_needed() -> bool:
    store = get_vector_store()
    if not store.is_initialized():
        logger.info("Initializing vector store...")
        count = store.initialize_from_documents()
        logger.info("Initialized with %d chunks", count)
        return True
    logger.info("Already initialized with %d chunks", store.get_document_count())
    return False
