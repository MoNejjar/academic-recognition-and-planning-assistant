"""
Submissions API Routes

Endpoints for managing student submissions:
- POST /submit - Submit student application with analytics
- GET /submissions - List all submissions (staff view)
- GET /submissions/{submission_id} - Get submission details
- PATCH /submissions/{submission_id}/status - Update submission status
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.submission import SubmissionData
from app.models.analytics_models import (
    AnalysisRequest, 
    AnalyticsResponse,
    TUMModuleInput, 
    SourceCourseInput
)
from app.services.submission.submission_service import SubmissionService
from app.services.analytics.analytics_service import AnalyticsService
from app.utils.llm_utils import get_llm_client

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/submit")
async def submit_application(
    submission: SubmissionData,
    db: Session = Depends(get_db)
):
    """
    Submit student application with analytics.
    
    This endpoint:
    1. Receives student submission data (personal info + module mappings)
    2. Triggers analytics analysis on the modules
    3. Stores both submission and analytics results in database
    4. Returns submission ID and analytics results
    
    The submission will be available for staff review in the /submissions endpoint.
    """
    try:
        logger.info(f"Processing submission for {submission.personal_data.first_name} {submission.personal_data.surname}")
        
        # Initialize analytics service
        llm_client = get_llm_client()
        analytics_service = AnalyticsService(llm_client)
        
        # Convert submission to analysis request
        tum_modules = [
            TUMModuleInput(
                tum_module_nr=mod.tum_module_nr,
                tum_module_title=mod.tum_module_title,
                tum_ects=mod.tum_ects,
                tum_content=mod.tum_content,
                tum_outcome=mod.tum_outcome,
                source_courses=[
                    SourceCourseInput(
                        source_course_no=sc.source_course_no,
                        source_course_name=sc.source_course_name,
                        source_credits=sc.source_credits,
                        source_grade=sc.source_grade,
                        source_content=sc.source_content
                    )
                    for sc in mod.source_courses
                ]
            )
            for mod in submission.tum_modules
        ]
        
        analysis_request = AnalysisRequest(
            tum_modules=tum_modules,
            student_name=f"{submission.personal_data.first_name} {submission.personal_data.surname}",
            previous_university=submission.personal_data.name_of_previous_university,
            previous_country=submission.personal_data.country_of_previous_university
        )
        
        # Run analytics
        logger.info(f"Running analytics for {len(tum_modules)} modules")
        analytics_response = await analytics_service.analyze_submission(analysis_request)
        
        # Store submission and analytics
        submission_service = SubmissionService(db)
        submission_id = submission_service.create_submission(submission, analytics_response)
        
        logger.info(f"Submission {submission_id} created successfully")
        
        return {
            "submission_id": submission_id,
            "status": "success",
            "message": "Application submitted successfully",
            "analytics": analytics_response
        }
        
    except Exception as e:
        logger.exception("Submission failed")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process submission: {str(e)}"
        )


@router.get("/submissions")
async def get_submissions(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all submissions for staff/professor view.
    
    Query parameters:
    - skip: Number of records to skip (for pagination)
    - limit: Maximum number of records to return
    - status: Filter by status (pending, in_review, approved, rejected)
    
    Returns list of submissions with summary information.
    """
    try:
        submission_service = SubmissionService(db)
        submissions = submission_service.get_all_submissions(skip, limit, status)
        total_count = submission_service.get_submission_count(status)
        
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "submissions": [
                {
                    "submission_id": sub.submission_id,
                    "student_name": sub.student_name,
                    "tum_email": sub.tum_email,
                    "previous_university": sub.previous_university,
                    "previous_country": sub.previous_country,
                    "submission_date": sub.submission_date.isoformat(),
                    "status": sub.status,
                    "modules_count": len(sub.analytics_results),
                    "average_score": sum(r.overall_score for r in sub.analytics_results) / len(sub.analytics_results) if sub.analytics_results else 0
                }
                for sub in submissions
            ]
        }
    except Exception as e:
        logger.exception("Failed to fetch submissions")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch submissions: {str(e)}"
        )


@router.get("/submissions/{submission_id}")
async def get_submission_detail(
    submission_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed submission with analytics for professor review.
    
    Returns:
    - Personal data
    - Submission metadata (date, status)
    - Complete analytics results for all modules
    """
    try:
        submission_service = SubmissionService(db)
        submission = submission_service.get_submission_by_id(submission_id)
        
        if not submission:
            raise HTTPException(
                status_code=404, 
                detail=f"Submission {submission_id} not found"
            )
        
        # Extract module results from analytics_results
        module_results = []
        for result in submission.analytics_results:
            # Include the module's individual status in the result data
            module_data = result.analysis_data.copy()
            module_data['status'] = result.status  # Add individual module status
            module_results.append(module_data)
        
        return {
            "submission_id": submission.submission_id,
            "personal_data": submission.personal_data,
            "status": submission.status,
            "submission_date": submission.submission_date.isoformat(),
            "student_name": submission.student_name,
            "tum_email": submission.tum_email,
            "previous_university": submission.previous_university,
            "previous_country": submission.previous_country,
            "mapping_file_name": submission.mapping_file_name,
            "analytics": {
                "total_modules_analyzed": len(module_results),
                "average_score": sum(r["overall_score"] for r in module_results) / len(module_results) if module_results else 0,
                "modules_highly_equivalent": sum(1 for r in module_results if r.get("decision_hint") == "highly_equivalent"),
                "modules_partial": sum(1 for r in module_results if r.get("decision_hint") == "partial"),
                "modules_insufficient": sum(1 for r in module_results if r.get("decision_hint") == "insufficient"),
                "module_results": module_results,
                "llm_model_used": module_results[0].get("llm_model_used") if module_results else None,
                "analysis_timestamp": module_results[0].get("analysis_timestamp") if module_results else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to fetch submission {submission_id}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch submission: {str(e)}"
        )


@router.patch("/submissions/{submission_id}/modules/{tum_module_nr}/status")
async def update_module_status(
    submission_id: str,
    tum_module_nr: str,
    status: str,
    db: Session = Depends(get_db)
):
    """
    Update individual module status within a submission.
    
    This allows approving/rejecting individual modules independently.
    
    Valid statuses:
    - pending: Initial state
    - approved: Module approved for credit recognition
    - rejected: Module rejected
    """
    valid_statuses = ["pending", "approved", "rejected"]
    
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        submission_service = SubmissionService(db)
        
        # Update module status (this also updates the corresponding task)
        updated_module = submission_service.update_module_status(
            submission_id, 
            tum_module_nr, 
            status
        )
        
        if not updated_module:
            raise HTTPException(
                status_code=404,
                detail=f"Module {tum_module_nr} in submission {submission_id} not found"
            )
        
        # Also update the task status to keep them in sync
        task_id = f"{submission_id}-{tum_module_nr}"
        submission_service.update_task_status(task_id, status)
        
        logger.info(f"Updated module {tum_module_nr} in submission {submission_id} to status: {status}")
        
        return {
            "submission_id": submission_id,
            "tum_module_nr": tum_module_nr,
            "status": updated_module.status,
            "message": f"Module {tum_module_nr} status updated to {status}"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to update module status")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update module status: {str(e)}"
        )
