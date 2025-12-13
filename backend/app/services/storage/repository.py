"""
Database repository for storage-related data.
"""

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
        return self.db.get(Document, document_id)

    def get_by_stored_name(self, stored_filename: str) -> Optional[Document]:
        stmt = select(Document).where(Document.stored_filename == stored_filename)
        result = self.db.execute(stmt).scalar_one_or_none()
        return result

    def list(self) -> Iterable[Document]:
        stmt = select(Document).order_by(Document.created_at.desc())
        return self.db.scalars(stmt).all()

    def delete(self, document_id: str) -> bool:
        document = self.get(document_id)
        if document is None:
            return False
        self.db.delete(document)
        self.db.commit()
        return True


# Placeholders for future repositories
class UserRepository:
    """Database operations for users"""


class TUMCoursesRepository:
    """Database operations for TUM courses"""


class MatchResultRepository:
    """Database operations for match results"""


class ReportRepository:
    """Database operations for reports"""
