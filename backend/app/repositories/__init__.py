"""Repository pattern implementations for database access."""

from app.repositories.analytics_result import AnalyticsResultRepository
from app.repositories.chat import ChatRepository
from app.repositories.document import DocumentRepository
from app.repositories.student_submission import StudentSubmissionRepository
from app.repositories.task import TaskRepository
from app.repositories.tum_courses import TUMCoursesRepository

__all__ = [
    "AnalyticsResultRepository",
    "ChatRepository",
    "DocumentRepository",
    "StudentSubmissionRepository",
    "TaskRepository",
    "TUMCoursesRepository",
]
