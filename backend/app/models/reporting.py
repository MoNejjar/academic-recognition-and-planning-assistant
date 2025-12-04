"""
Reporting Models

Pydantic models for reporting requests and responses
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ReportSummary(BaseModel):
    """Summary of a report"""
    id: str
    created_at: datetime
    status: str
    total_courses: int
    matched_courses: int


class ReportDetail(BaseModel):
    """Detailed report information"""
    id: str
    created_at: datetime
    # TODO: Add match results, explanations, etc.


class PDFExportRequest(BaseModel):
    """Request to export report as PDF"""
    report_id: str
    include_explanations: bool = True


# TODO: Add more models as needed
