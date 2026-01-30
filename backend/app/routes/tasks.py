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
                    "studentName": task.student_name,
                    "university": task.university,
                    "tumModuleNr": task.tum_module_nr,
                    "tumModuleTitle": task.tum_module_title,
                    "tumEcts": task.tum_ects,
                    "score": task.score,
                    "decision": task.decision,
                    "status": task.status,
                    "submissionId": task.submission_id,
                    "submissionDate": task.submission_date.isoformat(),
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
        
        # Get the analytics result
        module_result = submission_service.get_module_result(
            task.submission_id,
            task.tum_module_nr
        )
        
        # Get submission for personal data
        submission = submission_service.get_submission_by_id(task.submission_id)
        
        return {
            "id": task.task_id,
            "studentName": task.student_name,
            "university": task.university,
            "tumModuleNr": task.tum_module_nr,
            "tumModuleTitle": task.tum_module_title,
            "tumEcts": task.tum_ects,
            "score": task.score,
            "decision": task.decision,
            "status": task.status,
            "submissionId": task.submission_id,
            "submissionDate": task.submission_date.isoformat(),
            "isManualTest": bool(task.is_manual_test),
            "result": module_result.analysis_data if module_result else None,
            "submission": {
                "personalData": submission.personal_data,
                "status": submission.status
            } if submission else None
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
    - approved: Task approved
    - rejected: Task rejected
    """
    valid_statuses = ["pending", "approved", "rejected"]
    
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
