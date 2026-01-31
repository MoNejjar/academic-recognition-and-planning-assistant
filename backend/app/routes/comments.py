"""
Comments API Routes

Endpoints for managing task comments (professor-staff communication):
- GET /tasks/{task_id}/comments - List all comments on a task
- POST /tasks/{task_id}/comments - Add a new comment
- DELETE /tasks/{task_id}/comments/{comment_id} - Delete a comment
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.comment import Comment, CommentCreate, CommentResponse, CommentListResponse
from app.models.task import Task

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/tasks/{task_id}/comments", response_model=CommentListResponse)
async def get_task_comments(
    task_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all comments for a task.
    
    Returns comments in chronological order, with any final verdict comment
    highlighted separately.
    """
    # Verify task exists
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    
    # Get all comments, ordered by creation time
    comments = db.query(Comment).filter(
        Comment.task_id == task_id
    ).order_by(Comment.created_at.asc()).all()
    
    # Separate final verdict from regular comments
    final_verdict = None
    regular_comments = []
    
    for comment in comments:
        comment_data = CommentResponse(
            id=comment.id,
            task_id=comment.task_id,
            author_role=comment.author_role,
            author_name=comment.author_name,
            content=comment.content,
            is_final_verdict=comment.is_final_verdict,
            created_at=comment.created_at
        )
        
        if comment.is_final_verdict:
            final_verdict = comment_data
        else:
            regular_comments.append(comment_data)
    
    return CommentListResponse(
        task_id=task_id,
        total=len(comments),
        final_verdict=final_verdict,
        comments=regular_comments
    )


@router.post("/tasks/{task_id}/comments", response_model=CommentResponse)
async def create_comment(
    task_id: str,
    comment_data: CommentCreate,
    db: Session = Depends(get_db)
):
    """
    Add a new comment to a task.
    
    Rules:
    - Both professors and staff can add regular comments
    - Only professors can mark a comment as final_verdict
    - Only one final_verdict comment allowed per task
    """
    # Verify task exists
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    
    # Only professors can create final verdict comments
    if comment_data.is_final_verdict and comment_data.author_role != "professor":
        raise HTTPException(
            status_code=403, 
            detail="Only professors can add final verdict comments"
        )
    
    # Check if final verdict already exists
    if comment_data.is_final_verdict:
        existing_verdict = db.query(Comment).filter(
            Comment.task_id == task_id,
            Comment.is_final_verdict == True
        ).first()
        
        if existing_verdict:
            raise HTTPException(
                status_code=400,
                detail="A final verdict comment already exists for this task"
            )
    
    # Create the comment
    comment = Comment(
        task_id=task_id,
        author_role=comment_data.author_role,
        author_name=comment_data.author_name,
        content=comment_data.content,
        is_final_verdict=comment_data.is_final_verdict
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    logger.info(f"Comment added to task {task_id} by {comment_data.author_role}: {comment_data.author_name}")
    
    return CommentResponse(
        id=comment.id,
        task_id=comment.task_id,
        author_role=comment.author_role,
        author_name=comment.author_name,
        content=comment.content,
        is_final_verdict=comment.is_final_verdict,
        created_at=comment.created_at
    )


@router.delete("/tasks/{task_id}/comments/{comment_id}")
async def delete_comment(
    task_id: str,
    comment_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a comment.
    
    In production, this should verify the requester is the comment author
    or has admin privileges.
    """
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.task_id == task_id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()
    
    return {"status": "success", "message": "Comment deleted"}
