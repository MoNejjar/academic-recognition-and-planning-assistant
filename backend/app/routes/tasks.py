"""
Tasks API Routes

Endpoints for managing review tasks for professors:
- GET /tasks - List all tasks
- GET /tasks/{task_id} - Get task details with full analytics
- PATCH /tasks/{task_id}/status - Update task status
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.submission.submission_service import SubmissionService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/tasks")
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all review tasks for professor view.
    
    Query parameters:
    - skip: Number of records to skip (for pagination)
    - limit: Maximum number of records to return
    - status: Filter by status (pending, approved, rejected)
    
    Returns list of tasks with summary information.
    """
    try:
        submission_service = SubmissionService(db)
        tasks = submission_service.get_all_tasks(skip, limit, status)
        total_count = submission_service.get_task_count(status)
        
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "tasks": [
                {
                    "id": task.task_id,
                    "studentName": task.submission.student_name,
                    "university": task.submission.previous_university,
                    "tumModuleNr": task.analytics_result.tum_module_nr,
                    "tumModuleTitle": task.analytics_result.tum_module_title,
                    "tumEcts": task.analytics_result.tum_ects,
                    "score": task.analytics_result.overall_score,
                    "decision": task.analytics_result.decision_hint,
                    "status": task.status,
                    "submissionId": task.submission_id,
                    "submissionDate": task.submission_date.isoformat(),
                    "createdAt": task.created_at.isoformat(),
                    "decisionDate": task.decision_date.isoformat() if task.decision_date else None,
                    "isManualTest": bool(task.is_manual_test)
                }
                for task in tasks
            ]
        }
    except Exception as e:
        logger.exception("Failed to fetch tasks")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch tasks: {str(e)}"
        )


@router.get("/tasks/{task_id}")
async def get_task_detail(
    task_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed task information with full analytics results.
    
    Returns:
    - Task metadata (student, module info, status)
    - Complete analytics result for the module
    - Submission metadata
    """
    try:
        submission_service = SubmissionService(db)
        task = submission_service.get_task_by_id(task_id)
        
        if not task:
            raise HTTPException(
                status_code=404,
                detail=f"Task {task_id} not found"
            )
        
        # Analytics result and submission already loaded via relationships
        return {
            "id": task.task_id,
            "studentName": task.submission.student_name,
            "university": task.submission.previous_university,
            "tumModuleNr": task.analytics_result.tum_module_nr,
            "tumModuleTitle": task.analytics_result.tum_module_title,
            "tumEcts": task.analytics_result.tum_ects,
            "score": task.analytics_result.overall_score,
            "decision": task.analytics_result.decision_hint,
            "status": task.status,
            "submissionId": task.submission_id,
            "submissionDate": task.submission_date.isoformat(),
            "createdAt": task.created_at.isoformat(),
            "decisionDate": task.decision_date.isoformat() if task.decision_date else None,
            "isManualTest": bool(task.is_manual_test),
            "result": task.analytics_result.analysis_data,
            "submission": {
                "personalData": task.submission.personal_data,
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to fetch task {task_id}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch task: {str(e)}"
        )


@router.patch("/tasks/{task_id}/status")
async def update_task_status(
    task_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    """
    Update task status.
    
    Valid statuses:
    - pending: Initial state
    - on_hold: Task put on hold
    - approved: Task approved
    - rejected: Task rejected
    """
    valid_statuses = ["pending", "on_hold", "approved", "rejected"]
    
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        submission_service = SubmissionService(db)
        task = submission_service.update_task_status(task_id, status)
        
        if not task:
            raise HTTPException(
                status_code=404,
                detail=f"Task {task_id} not found"
            )
        
        return {
            "task_id": task.task_id,
            "status": task.status,
            "message": f"Task status updated to {status}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to update task status for {task_id}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update task status: {str(e)}"
        )
