"""TUM courses repository for course catalog operations."""

from __future__ import annotations

from typing import Iterable, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tum_course import TUMCourse


class TUMCoursesRepository:
    """Database operations for TUM courses."""

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
        """List all TUM courses ordered by module code."""
        stmt = select(TUMCourse).order_by(TUMCourse.module_code.asc())
        return self.db.scalars(stmt).all()

    def get_by_code(self, module_code: str) -> Optional[TUMCourse]:
        """Get a TUM course by module code."""
        stmt = select(TUMCourse).where(TUMCourse.module_code == module_code)
        return self.db.execute(stmt).scalar_one_or_none()

    def search_by_title(self, query: str, limit: int = 25) -> list[TUMCourse]:
        """Search TUM courses by title (case-insensitive)."""
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
        """Parse credit value from string to integer."""
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None
