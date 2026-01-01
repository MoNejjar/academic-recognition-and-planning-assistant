"""
PDF Extraction Models

Pydantic models for PDF table extraction results.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field


class CourseRecognitionRow(BaseModel):
    """A single row from a course recognition table."""
    
    # Source university course info
    source_course_no: str = Field(..., description="Course number from source university")
    source_course_name: str = Field(..., description="Course name from source university")
    source_credits: str = Field(..., description="Credit points from source university")
    source_grade: str = Field(..., description="Original grade from source university")
    
    # TUM course info
    tum_module_nr: str = Field(..., description="TUM module number")
    tum_module_title: str = Field(..., description="TUM module title")
    tum_ects: str = Field(..., description="TUM ECTS credits")
    
    # Metadata
    page_number: Optional[int] = Field(None, description="PDF page number where this row was found")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "source_course_no": "CSE1300",
                "source_course_name": "Reasoning and Logic",
                "source_credits": "5",
                "source_grade": "9.5",
                "tum_module_nr": "INHN0004",
                "tum_module_title": "Discrete Structures",
                "tum_ects": "8",
                "page_number": 1
            }
        }
    }


class ExtractionResult(BaseModel):
    """Result of extracting tables from a PDF document."""
    
    filename: str = Field(..., description="Original PDF filename")
    total_pages: int = Field(..., description="Total number of pages in the PDF")
    rows: List[CourseRecognitionRow] = Field(default_factory=list, description="Extracted course recognition rows")
    extracted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Extraction timestamp")
    
    @property
    def row_count(self) -> int:
        """Number of extracted rows."""
        return len(self.rows)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "filename": "transcript.pdf",
                "total_pages": 3,
                "rows": [
                    {
                        "source_course_no": "CSE1300",
                        "source_course_name": "Reasoning and Logic",
                        "source_credits": "5",
                        "source_grade": "9.5",
                        "tum_module_nr": "INHN0004",
                        "tum_module_title": "Discrete Structures",
                        "tum_ects": "8",
                        "page_number": 1
                    }
                ],
                "extracted_at": "2026-01-01T14:00:00Z"
            }
        }
    }


class ExtractionRequest(BaseModel):
    """Request to extract tables from a document."""
    
    document_id: str = Field(..., description="ID of the uploaded document to process")


class ExtractionError(BaseModel):
    """Error response for extraction failures."""
    
    detail: str = Field(..., description="Error message")
    document_id: Optional[str] = Field(None, description="Document ID if available")
