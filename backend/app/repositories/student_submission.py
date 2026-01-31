"""Student submission repository for CRUD operations."""

from __future__ import annotations

import logging
from typing import List, Optional

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.submission import StudentSubmission

logger = logging.getLogger(__name__)


class StudentSubmissionRepository:
    """Repository for managing student submissions."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, submission: StudentSubmission) -> StudentSubmission:
        """Create a new student submission."""
        self.db.add(submission)
        self.db.flush()  # Flush to get the ID without committing
        return submission

    def get_by_id(self, submission_id: str) -> Optional[StudentSubmission]:
        """Get a submission by ID."""
        stmt = select(StudentSubmission).where(StudentSubmission.submission_id == submission_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(
        self, skip: int = 0, limit: int = 100
    ) -> List[StudentSubmission]:
        """Get all submissions."""
        stmt = select(StudentSubmission).order_by(desc(StudentSubmission.submission_date))
        stmt = stmt.offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def count(self) -> int:
        """Get total count of submissions."""
        return self.db.query(StudentSubmission).count()

    def delete(self, submission_id: str) -> bool:
        """Delete a submission."""
        submission = self.get_by_id(submission_id)

        if submission:
            self.db.delete(submission)
            self.db.flush()
            return True

        return False
