"""Analytics result repository for CRUD operations."""

from __future__ import annotations

import logging
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analytics import AnalyticsResult

logger = logging.getLogger(__name__)


class AnalyticsResultRepository:
    """Repository for managing analytics results."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, result: AnalyticsResult) -> AnalyticsResult:
        """Create a new analytics result."""
        self.db.add(result)
        self.db.flush()  # Flush to get the ID without committing
        return result

    def get_by_submission_and_module(
        self, submission_id: str, tum_module_nr: str
    ) -> Optional[AnalyticsResult]:
        """Get an analytics result by submission ID and module number."""
        stmt = select(AnalyticsResult).where(
            AnalyticsResult.submission_id == submission_id,
            AnalyticsResult.tum_module_nr == tum_module_nr,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all_by_submission(self, submission_id: str) -> List[AnalyticsResult]:
        """Get all analytics results for a submission."""
        stmt = select(AnalyticsResult).where(AnalyticsResult.submission_id == submission_id)
        return list(self.db.scalars(stmt).all())

    def update_status(
        self, submission_id: str, tum_module_nr: str, status: str
    ) -> Optional[AnalyticsResult]:
        """Update the status of an analytics result."""
        result = self.get_by_submission_and_module(submission_id, tum_module_nr)

        if result:
            logger.info(
                f"Updating analytics result for {submission_id}/{tum_module_nr}: {result.status} -> {status}"
            )
            result.status = status
            self.db.flush()

        return result
