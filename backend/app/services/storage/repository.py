"""
Database repository for storage-related data.
"""

from __future__ import annotations

from typing import Iterable, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.tum_course import TUMCourse


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


class TUMCoursesRepository:
    """Database operations for TUM courses"""

    def __init__(self, db: Session):
        self.db = db

    def upsert_courses(self, items: Iterable[dict]) -> int:
        """Insert or update modules from cached JSON. Returns number of upserted rows."""

        count = 0
        for item in items:
            module_id = item.get("module_id")
            module_code = item.get("module_code")
            if module_id is None or module_code is None:
                continue

            course = self.db.get(TUMCourse, module_id)
            if course is None:
                course = TUMCourse(module_id=module_id, module_code=module_code)
                self.db.add(course)

            course.module_code = module_code
            course.module_title = item.get("module_title") or module_code
            course.module_title_en = item.get("module_title_en")
            course.module_credits = self._parse_credits(item.get("module_credits"))
            course.description_id = item.get("description_id")
            course.description_version = item.get("description_version")
            course.module_content = item.get("module_content")
            course.module_content_en = item.get("module_content_en")
            course.module_outcome = item.get("module_outcome")
            course.module_outcome_en = item.get("module_outcome_en")
            count += 1

        self.db.commit()
        return count

    def list_all(self) -> Iterable[TUMCourse]:
        stmt = select(TUMCourse).order_by(TUMCourse.module_code.asc())
        return self.db.scalars(stmt).all()

    def get_by_code(self, module_code: str) -> Optional[TUMCourse]:
        stmt = select(TUMCourse).where(TUMCourse.module_code == module_code)
        return self.db.execute(stmt).scalar_one_or_none()

    def search_by_title(self, query: str, limit: int = 25) -> list[TUMCourse]:
        pattern = f"%{query}%"
        stmt = (
            select(TUMCourse)
            .where(TUMCourse.module_title.ilike(pattern))
            .order_by(TUMCourse.module_title.asc())
            .limit(limit)
        )
        return self.db.scalars(stmt).all()

    @staticmethod
    def _parse_credits(value: Optional[str]) -> Optional[int]:
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None


# Placeholders for future repositories
class UserRepository:
    """Database operations for users"""


class MatchResultRepository:
    """Database operations for match results"""


class ReportRepository:
    """Database operations for reports"""
