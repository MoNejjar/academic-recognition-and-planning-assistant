"""
PDF Extraction Models

Pydantic models for PDF table extraction results.
TUM Module-centric approach: each TUM module contains a list of equivalent source courses.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from pydantic import BaseModel, Field


class SourceCourse(BaseModel):
    """A source university course that maps to a TUM module."""
    
    source_course_no: str = Field(..., description="Course number from source university")
    source_course_name: str = Field(..., description="Course name from source university")
    source_credits: str = Field(..., description="Credit points from source university")
    source_grade: str = Field(..., description="Original grade from source university")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "source_course_no": "BIE-PA1",
                "source_course_name": "Programming and Algorithmics 1",
                "source_credits": "7",
                "source_grade": "1.5"
            }
        }
    }


class TUMModuleMapping(BaseModel):
    """A TUM module with its equivalent source courses from external universities."""
    
    tum_module_nr: str = Field(..., description="TUM module number (primary identifier)")
    tum_module_title: str = Field(..., description="TUM module title")
    tum_ects: str = Field(..., description="TUM ECTS credits")
    source_courses: List[SourceCourse] = Field(
        default_factory=list, 
        description="List of source courses that map to this TUM module"
    )
    catalogue_content: str = Field(default="", description="Course content from catalogue")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "tum_module_nr": "INHN0001",
                "tum_module_title": "Introduction to Informatics",
                "tum_ects": "6",
                "source_courses": [
                    {
                        "source_course_no": "BIE-PA1",
                        "source_course_name": "Programming and Algorithmics 1",
                        "source_credits": "7",
                        "source_grade": "1.5"
                    },
                    {
                        "source_course_no": "BIE-PA2",
                        "source_course_name": "Programming and Algorithmics 2",
                        "source_credits": "7",
                        "source_grade": "1"
                    }
                ],
                "catalogue_content": ""
            }
        }
    }


class ExtractionResult(BaseModel):
    """Result of extracting tables from a PDF document."""
    
    filename: str = Field(..., description="Original PDF filename")
    total_pages: int = Field(..., description="Total number of pages in the PDF")
    tum_modules: List[TUMModuleMapping] = Field(
        default_factory=list, 
        description="TUM modules with their mapped source courses"
    )
    extracted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), 
        description="Extraction timestamp"
    )
    
    @property
    def module_count(self) -> int:
        """Number of TUM modules."""
        return len(self.tum_modules)
    
    @property
    def total_source_courses(self) -> int:
        """Total number of source courses across all TUM modules."""
        return sum(len(m.source_courses) for m in self.tum_modules)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "filename": "recognition_table.pdf",
                "total_pages": 2,
                "tum_modules": [
                    {
                        "tum_module_nr": "INHN0001",
                        "tum_module_title": "Introduction to Informatics",
                        "tum_ects": "6",
                        "source_courses": [
                            {
                                "source_course_no": "BIE-PA1",
                                "source_course_name": "Programming and Algorithmics 1",
                                "source_credits": "7",
                                "source_grade": "1.5"
                            },
                            {
                                "source_course_no": "BIE-PA2",
                                "source_course_name": "Programming and Algorithmics 2",
                                "source_credits": "7",
                                "source_grade": "1"
                            }
                        ],
                        "catalogue_content": ""
                    },
                    {
                        "tum_module_nr": "INHN0011",
                        "tum_module_title": "Fundamentals of Databases",
                        "tum_ects": "6",
                        "source_courses": [
                            {
                                "source_course_no": "BIE-DBS",
                                "source_course_name": "Database Systems",
                                "source_credits": "5",
                                "source_grade": "1"
                            }
                        ],
                        "catalogue_content": ""
                    }
                ],
                "extracted_at": "2026-01-19T13:00:00Z"
            }
        }
    }


class ExtractionRequest(BaseModel):
    """Request to extract tables from a document."""
    
    document_id: str = Field(..., description="ID of the uploaded document to process")


class ExtractionError(BaseModel):
    """Error response for extraction failures."""
    
    detail: str = Field(..., description="Error message")
