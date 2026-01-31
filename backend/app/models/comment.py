"""
Database model for task comments - enables professor-staff communication.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class CommentAuthorRole(str, Enum):
    """Role of the comment author."""
    PROFESSOR = "professor"
    STAFF = "staff"


class Comment(Base):
    """Stores comments/discussion on tasks for professor-staff communication.
    
    Comments form a chronological discussion thread on each task.
    Final verdicts are special comments that appear at the top.
    """
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(100), ForeignKey("tasks.task_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Author information
    author_role = Column(String(50), nullable=False)  # "professor" or "staff"
    author_name = Column(String(255), nullable=False)
    
    # Comment content
    content = Column(Text, nullable=False)
    
    # Special comment type
    is_final_verdict = Column(Boolean, default=False, nullable=False)  # Only professors can set this
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship back to task
    task = relationship("Task", backref="comments")


# ============================================
# Pydantic Schemas for API
# ============================================

class CommentCreate(BaseModel):
    """Schema for creating a new comment."""
    content: str = Field(..., min_length=1, max_length=5000)
    author_role: str = Field(..., pattern="^(professor|staff)$")
    author_name: str = Field(..., min_length=1, max_length=255)
    is_final_verdict: bool = False


class CommentResponse(BaseModel):
    """Schema for comment API responses."""
    id: int
    task_id: str
    author_role: str
    author_name: str
    content: str
    is_final_verdict: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """Schema for listing comments on a task."""
    task_id: str
    total: int
    final_verdict: Optional[CommentResponse] = None
    comments: list[CommentResponse]
