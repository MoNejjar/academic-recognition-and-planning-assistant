"""
PDF Extraction Models

Pydantic models for PDF table extraction results.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List

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
    
    # Matching type: 1:1, n:1 (multiple source -> one TUM), 1:n (one source -> multiple TUM)
    matching_type: str = Field(default="1:1", description="Matching type: 1:1, n:1, or 1:n")
    
    # Group ID to link related rows together (for n:1 or 1:n mappings)
    group_id: str = Field(default="none", description="Group ID to link related rows. 'none' for 1:1 mappings")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "source_course_no": "CSE1100",
                "source_course_name": "Object Oriented Programming",
                "source_credits": "5",
                "source_grade": "8",
                "tum_module_nr": "INHN0002",
                "tum_module_title": "Fundamentals of Programming",
                "tum_ects": "6",
                "matching_type": "n:1",
                "group_id": "group1"
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
                "filename": "recognition_table.pdf",
                "total_pages": 2,
                "rows": [
                    {
                        "source_course_no": "BVNSD 1.2",
                        "source_course_name": "Problem Solving Techniques and C Programming",
                        "source_credits": "4",
                        "source_grade": "9.29",
                        "tum_module_nr": "INHN0002",
                        "tum_module_title": "Fundamentals of Programming",
                        "tum_ects": "6",
                        "matching_type": "1:1",
                        "group_id": "none"
                    },
                    {
                        "source_course_no": "BVNSD 2.1",
                        "source_course_name": "Data Structures Using C",
                        "source_credits": "4",
                        "source_grade": "9.0",
                        "tum_module_nr": "INHN0008",
                        "tum_module_title": "Fundamentals of Algorithms and Data Structures",
                        "tum_ects": "6",
                        "matching_type": "n:1",
                        "group_id": "group1"
                    },
                    {
                        "source_course_no": "BVNSD 2.2",
                        "source_course_name": "Lab on Data Structures and C Programming",
                        "source_credits": "4",
                        "source_grade": "9.11",
                        "tum_module_nr": "INHN0008",
                        "tum_module_title": "Fundamentals of Algorithms and Data Structures",
                        "tum_ects": "6",
                        "matching_type": "n:1",
                        "group_id": "group1"
                    }
                ],
                "extracted_at": "2026-01-18T01:00:00Z"
            }
        }
    }


class ExtractionRequest(BaseModel):
    """Request to extract tables from a document."""
    
    document_id: str = Field(..., description="ID of the uploaded document to process")


class ExtractionError(BaseModel):
    """Error response for extraction failures."""
    
    detail: str = Field(..., description="Error message")
