"""
Database models for storing student submissions and analytics results.
"""

from sqlalchemy import Column, String, Float, JSON, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class StudentSubmission(Base):
    """Stores student submission data and metadata."""
    __tablename__ = "student_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(String(100), unique=True, index=True, nullable=False)
    student_name = Column(String(255), nullable=False)
    tum_email = Column(String(255), nullable=False, index=True)
    previous_university = Column(String(255))
    previous_country = Column(String(100))
    submission_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, in_review, approved, rejected
    
    # Store personal data as JSON
    personal_data = Column(JSON, nullable=False)
    
    # Store mapping file name if provided
    mapping_file_name = Column(String(255))
    
    # Relationships
    analytics_results = relationship("AnalyticsResult", back_populates="submission", cascade="all, delete-orphan")


class AnalyticsResult(Base):
    """Stores analytics results for each module in a submission."""
    __tablename__ = "analytics_results"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(String(100), ForeignKey("student_submissions.submission_id"), nullable=False, index=True)
    
    # Module identification
    tum_module_nr = Column(String(50), nullable=False)
    tum_module_title = Column(String(255), nullable=False)
    tum_ects = Column(String(20))
    
    # Store complete analysis results as JSON
    analysis_data = Column(JSON, nullable=False)
    
    # Quick access fields for filtering/sorting
    overall_score = Column(Float, nullable=False)
    decision_hint = Column(String(50), nullable=False)  # highly_equivalent, partial, insufficient
    
    # Individual module status (independent of submission status)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    submission = relationship("StudentSubmission", back_populates="analytics_results")


class Task(Base):
    """Stores review tasks for professors - one task per module in a submission."""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(100), unique=True, index=True, nullable=False)  # Generated ID for task
    
    # Foreign keys
    submission_id = Column(String(100), ForeignKey("student_submissions.submission_id"), nullable=False, index=True)
    analytics_result_id = Column(Integer, ForeignKey("analytics_results.id"), nullable=False, index=True)
    
    # Denormalized fields for quick access (copied from submission and analytics)
    student_name = Column(String(255), nullable=False)
    university = Column(String(255), nullable=False)
    tum_module_nr = Column(String(50), nullable=False)
    tum_module_title = Column(String(255), nullable=False)
    tum_ects = Column(String(20))
    score = Column(Float, nullable=False)
    decision = Column(String(50), nullable=False)  # Decision hint
    
    # Task-specific fields
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected
    is_manual_test = Column(Integer, default=0, nullable=False)  # 0=real submission, 1=manual test
    
    # Timestamps
    submission_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
