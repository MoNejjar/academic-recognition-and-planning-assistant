"""
Course Matching Models

Pydantic models for course matching requests and responses
"""

from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class GradeResult(str, Enum):
    PASSING = "passing"
    NOT_PASSING = "not_passing"


class CourseInfo(BaseModel):
    """Course information from external university"""
    name: str
    credits: float
    description: str
    university: str
    grade: Optional[float] = None


class TUMCourse(BaseModel):
    """TUM course/module information"""
    id: str
    name: str
    credits: float
    description: str
    curriculum: str  # 'garching' or 'heilbronn'


class CourseMatchRequest(BaseModel):
    """Request for course matching"""
    source_course: CourseInfo
    target_curriculum: str
    # TODO: Add more fields as needed


class CourseMatchResponse(BaseModel):
    """Response for course matching"""
    match_score: float
    is_transferable: bool
    matched_tum_course: Optional[TUMCourse] = None
    explanation: Optional[str] = None
    # TODO: Add more fields as needed


# TODO: Add more models for credit matching, grade calculation, etc.
