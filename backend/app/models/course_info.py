"""
Course Info Models

Models for extracted course content from external university PDFs.
Used for AI matching with TUM modules.
"""

from datetime import datetime, timezone
from typing import List

from pydantic import BaseModel, Field


class CourseInfo(BaseModel):
    """
    Extracted course information from PDF.
    
    Contains the 3 essential fields for matching:
    - module_number: Course code (e.g., "CSE1300")
    - module_name: Course title
    - module_content: All text about the course
    """
    
    module_number: str = Field(..., description="Course code/number (e.g., CSE1300)")
    module_name: str = Field(..., description="Course title/name")
    module_content: str = Field(..., description="All course text (description, outcomes, objectives, etc.)")


class CourseContentResult(BaseModel):
    """Result of course content extraction from a PDF."""
    
    filename: str = Field(..., description="Original PDF filename")
    courses: List[CourseInfo] = Field(default_factory=list, description="Extracted courses")
    extracted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Extraction timestamp"
    )
    document_id: str | None = Field(default=None, description="ID of stored document for later retrieval")
