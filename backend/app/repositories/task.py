"""Task repository for CRUD operations on review tasks."""

from __future__ import annotations

import logging
from typing import List, Optional

from sqlalchemy import desc, select
from sqlalchemy.orm import Session, joinedload

from app.models.task import Task

logger = logging.getLogger(__name__)


class TaskRepository:
    """Repository for managing review tasks."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, task: Task) -> Task:
        """Create a new task."""
        self.db.add(task)
        self.db.flush()  # Flush to get the ID without committing
        return task

    def get_by_id(self, task_id: str) -> Optional[Task]:
        """Get a task by ID with relationships loaded."""
        stmt = (
            select(Task)
            .where(Task.task_id == task_id)
            .options(
                joinedload(Task.submission),
                joinedload(Task.analytics_result)
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(
        self, skip: int = 0, limit: int = 100, status: Optional[str] = None
    ) -> List[Task]:
        """Get all tasks with optional filtering and relationships loaded."""
        stmt = (
            select(Task)
            .order_by(desc(Task.submission_date))
            .options(
                joinedload(Task.submission),
                joinedload(Task.analytics_result)
            )
        )

        if status:
            stmt = stmt.where(Task.status == status)

        stmt = stmt.offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def count(self, status: Optional[str] = None) -> int:
        """Get total count of tasks."""
        stmt = select(Task)

        if status:
            stmt = stmt.where(Task.status == status)

        return len(list(self.db.scalars(stmt).all()))

    def update_status(self, task_id: str, status: str) -> Optional[Task]:
        """Update task status."""
        task = self.get_by_id(task_id)

        if task:
            logger.info(f"Updating task {task_id} status: {task.status} -> {status}")
            task.status = status
            self.db.flush()

        return task
