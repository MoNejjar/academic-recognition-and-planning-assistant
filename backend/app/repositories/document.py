"""Document repository for CRUD operations on document metadata."""

from __future__ import annotations

from typing import Iterable, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document


class DocumentRepository:
    """CRUD operations for document metadata."""

    def __init__(self, db: Session):
        self.db = db

    def create_document(
        self,
        *,
        original_filename: str,
        stored_filename: str,
        relative_path: str,
        size_bytes: int,
        content_type: Optional[str] = None,
    ) -> Document:
        """Create a new document record."""
        document = Document(
            original_filename=original_filename,
            stored_filename=stored_filename,
            relative_path=relative_path,
            size_bytes=size_bytes,
            content_type=content_type,
        )
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get(self, document_id: str) -> Optional[Document]:
        """Get a document by ID."""
        return self.db.get(Document, document_id)

    def get_by_stored_name(self, stored_filename: str) -> Optional[Document]:
        """Get a document by its stored filename."""
        stmt = select(Document).where(Document.stored_filename == stored_filename)
        result = self.db.execute(stmt).scalar_one_or_none()
        return result

    def list(self) -> Iterable[Document]:
        """List all documents ordered by creation date."""
        stmt = select(Document).order_by(Document.created_at.desc())
        return self.db.scalars(stmt).all()

    def get_by_ids(self, document_ids: list[str]) -> list[Document]:
        """Get multiple documents by their IDs."""
        if not document_ids:
            return []
        stmt = select(Document).where(Document.id.in_(document_ids))
        return list(self.db.scalars(stmt).all())

    def delete(self, document_id: str) -> bool:
        """Delete a document by ID. Returns True if deleted, False if not found."""
        document = self.get(document_id)
        if document is None:
            return False
        self.db.delete(document)
        self.db.commit()
        return True
