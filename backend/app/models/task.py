"""
Database model for review tasks.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Task(Base):
    """Stores review tasks for professors - one task per module in a submission.
    
    This is a lightweight work queue that references AnalyticsResult and StudentSubmission.
    All display data is fetched via joins to avoid data duplication.
    """
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(100), unique=True, index=True, nullable=False)  # Generated ID for task
    
    # Foreign keys with cascade delete
    submission_id = Column(String(100), ForeignKey("student_submissions.submission_id", ondelete="CASCADE"), nullable=False, index=True)
    analytics_result_id = Column(Integer, ForeignKey("analytics_results.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Task-specific fields
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected
    is_manual_test = Column(Integer, default=0, nullable=False)  # 0=real submission, 1=manual test
    
    # Timestamps
    submission_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships - fetch data via joins instead of denormalization
    submission = relationship("StudentSubmission", foreign_keys=[submission_id])
    analytics_result = relationship("AnalyticsResult", foreign_keys=[analytics_result_id])
