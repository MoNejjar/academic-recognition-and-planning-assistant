"""
Submission Service

Service layer for managing student submissions and analytics results.
Orchestrates multiple repositories with proper transaction management.
"""

import logging
import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.analytics import AnalyticsResponse, AnalyticsResult
from app.models.submission import SubmissionData, StudentSubmission
from app.models.task import Task
from app.repositories.analytics_result import AnalyticsResultRepository
from app.repositories.student_submission import StudentSubmissionRepository
from app.repositories.task import TaskRepository

logger = logging.getLogger(__name__)


class SubmissionService:
    """Service for managing student submissions with analytics results."""

    def __init__(self, db: Session):
        self.db = db
        self.submission_repo = StudentSubmissionRepository(db)
        self.analytics_repo = AnalyticsResultRepository(db)
        self.task_repo = TaskRepository(db)

    def create_submission(
        self, submission_data: SubmissionData, analytics_response: AnalyticsResponse
    ) -> str:
        """
        Create a new submission with analytics results and tasks.

        Args:
            submission_data: Student submission data including personal info and modules
            analytics_response: Analytics results from the analysis service

        Returns:
            submission_id: Unique identifier for the submission
        """
        submission_id = str(uuid.uuid4())

        try:
            logger.info(f"Creating submission {submission_id}")

            # Create submission record
            db_submission = StudentSubmission(
                submission_id=submission_id,
                student_name=f"{submission_data.personal_data.first_name} {submission_data.personal_data.surname}",
                tum_email=submission_data.personal_data.tum_email,
                previous_university=submission_data.personal_data.name_of_previous_university,
                previous_country=submission_data.personal_data.country_of_previous_university,
                personal_data=submission_data.personal_data.dict(),
                mapping_file_name=submission_data.mapping_file,
            )

            self.submission_repo.create(db_submission)

            # Store analytics results and create tasks for each module
            for result in analytics_response.module_results:
                # Create analytics result
                db_result = AnalyticsResult(
                    submission_id=submission_id,
                    tum_module_nr=result.tum_module_nr,
                    tum_module_title=result.tum_module_title,
                    tum_ects=result.tum_ects,
                    analysis_data=result.dict(),
                    overall_score=result.overall_score,
                    decision_hint=result.decision_hint.value,
                )
                self.analytics_repo.create(db_result)

                # Create a task for this module (lightweight - data fetched via joins)
                task_id = f"{submission_id}-{result.tum_module_nr}"
                db_task = Task(
                    task_id=task_id,
                    submission_id=submission_id,
                    analytics_result_id=db_result.id,
                    status="pending",
                    is_manual_test=0,
                    submission_date=db_submission.submission_date,
                )
                self.task_repo.create(db_task)

            # Commit the transaction
            self.db.commit()
            logger.info(
                f"Submission {submission_id} created with {len(analytics_response.module_results)} modules"
            )

            return submission_id

        except Exception as e:
            logger.exception(f"Failed to create submission {submission_id}")
            self.db.rollback()
            raise

    def get_all_submissions(
        self, skip: int = 0, limit: int = 100
    ) -> List[StudentSubmission]:
        """
        Get all submissions for staff view.

        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return

        Returns:
            List of StudentSubmission objects
        """
        return self.submission_repo.get_all(skip, limit)

    def get_submission_count(self) -> int:
        """Get total count of submissions."""
        return self.submission_repo.count()

    def get_submission_by_id(self, submission_id: str) -> Optional[StudentSubmission]:
        """
        Get a specific submission with analytics results.

        Args:
            submission_id: Unique identifier for the submission

        Returns:
            StudentSubmission object or None if not found
        """
        return self.submission_repo.get_by_id(submission_id)

    def get_module_result(
        self, submission_id: str, tum_module_nr: str
    ) -> Optional[AnalyticsResult]:
        """
        Get a specific module result from a submission.

        Args:
            submission_id: Unique identifier for the submission
            tum_module_nr: TUM module number

        Returns:
            AnalyticsResult object or None if not found
        """
        return self.analytics_repo.get_by_submission_and_module(submission_id, tum_module_nr)

    def update_module_status(
        self, submission_id: str, tum_module_nr: str, status: str
    ) -> Optional[AnalyticsResult]:
        """
        Update individual module status (now only updates the task status).

        Args:
            submission_id: Unique identifier for the submission
            tum_module_nr: TUM module number
            status: New status (pending, approved, rejected)

        Returns:
            AnalyticsResult object or None if not found
        """
        try:
            result = self.analytics_repo.get_by_submission_and_module(submission_id, tum_module_nr)
            if result:
                # Update only the corresponding task status
                task_id = f"{submission_id}-{tum_module_nr}"
                self.task_repo.update_status(task_id, status)
                self.db.commit()
            return result
        except Exception as e:
            logger.exception(f"Failed to update module status for {submission_id}/{tum_module_nr}")
            self.db.rollback()
            raise

    def delete_submission(self, submission_id: str) -> bool:
        """
        Delete a submission and all its analytics results.

        Args:
            submission_id: Unique identifier for the submission

        Returns:
            True if deleted, False if not found
        """
        try:
            deleted = self.submission_repo.delete(submission_id)
            if deleted:
                self.db.commit()
            return deleted
        except Exception as e:
            logger.exception(f"Failed to delete submission {submission_id}")
            self.db.rollback()
            raise

    def get_all_tasks(
        self, skip: int = 0, limit: int = 100, status: Optional[str] = None
    ) -> List[Task]:
        """
        Get all review tasks for professor view.

        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            status: Optional filter by status (pending, approved, rejected)

        Returns:
            List of Task objects
        """
        return self.task_repo.get_all(skip, limit, status)

    def get_task_count(self, status: Optional[str] = None) -> int:
        """Get total count of tasks."""
        return self.task_repo.count(status)

    def get_task_by_id(self, task_id: str) -> Optional[Task]:
        """
        Get a specific task by ID.

        Args:
            task_id: Unique identifier for the task

        Returns:
            Task object or None if not found
        """
        return self.task_repo.get_by_id(task_id)

    def update_task_status(self, task_id: str, status: str) -> Optional[Task]:
        """
        Update task status and sync with corresponding analytics result.

        Args:
            task_id: Unique identifier for the task
            status: New status (pending, approved, rejected)

        Returns:
            Updated Task object or None if not found
        """
        try:
            task = self.task_repo.update_status(task_id, status)

            if task:
                self.db.commit()

            return task
        except Exception as e:
            logger.exception(f"Failed to update task status for {task_id}")
            self.db.rollback()
            raise

    def clear_all_data(self) -> dict:
        """
        ⚠️ DANGER: Clear all submissions, analytics results, and tasks.
        
        This is a destructive operation for development/testing purposes only.
        
        Returns:
            Dictionary with count of deleted records
        """
        try:
            # Delete in correct order due to foreign key constraints:
            # 1. Tasks (references analytics_results and submissions)
            # 2. Analytics results (references submissions)
            # 3. Submissions
            
            tasks_count = self.task_repo.delete_all()
            analytics_count = self.analytics_repo.delete_all()
            submissions_count = self.submission_repo.delete_all()
            
            self.db.commit()
            
            logger.warning(
                f"Database cleared: {submissions_count} submissions, "
                f"{analytics_count} analytics results, {tasks_count} tasks"
            )
            
            return {
                "tasks": tasks_count,
                "analytics_results": analytics_count,
                "submissions": submissions_count,
                "total": tasks_count + analytics_count + submissions_count
            }
            
        except Exception as e:
            logger.exception("Failed to clear database")
            self.db.rollback()
            raise
