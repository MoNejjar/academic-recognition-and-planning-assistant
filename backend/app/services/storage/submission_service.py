"""
Submission Service

Handles storage and retrieval of student submissions and analytics results.
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.db_models import StudentSubmission, AnalyticsResult
from app.models.submission import SubmissionData
from app.models.analytics_models import AnalyticsResponse
import uuid
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class SubmissionService:
    """Service for managing student submissions and analytics results."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_submission(
        self, 
        submission_data: SubmissionData,
        analytics_response: AnalyticsResponse
    ) -> str:
        """
        Store a new submission with analytics results.
        
        Args:
            submission_data: Student submission data including personal info and modules
            analytics_response: Analytics results from the analysis service
            
        Returns:
            submission_id: Unique identifier for the submission
        """
        submission_id = str(uuid.uuid4())
        
        logger.info(f"Creating submission {submission_id}")
        
        # Create submission record
        db_submission = StudentSubmission(
            submission_id=submission_id,
            student_name=f"{submission_data.personal_data.first_name} {submission_data.personal_data.surname}",
            tum_email=submission_data.personal_data.tum_email,
            previous_university=submission_data.personal_data.name_of_previous_university,
            previous_country=submission_data.personal_data.country_of_previous_university,
            personal_data=submission_data.personal_data.dict(),
            mapping_file_name=submission_data.mapping_file,
            status="pending"
        )
        
        self.db.add(db_submission)
        self.db.flush()
        
        # Store analytics results for each module
        for result in analytics_response.module_results:
            db_result = AnalyticsResult(
                submission_id=submission_id,
                tum_module_nr=result.tum_module_nr,
                tum_module_title=result.tum_module_title,
                tum_ects=result.tum_ects,
                analysis_data=result.dict(),
                overall_score=result.overall_score,
                decision_hint=result.decision_hint.value
            )
            self.db.add(db_result)
        
        self.db.commit()
        logger.info(f"Submission {submission_id} created with {len(analytics_response.module_results)} modules")
        
        return submission_id
    
    def get_all_submissions(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[StudentSubmission]:
        """
        Get all submissions for staff view.
        
        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            status: Optional filter by status
            
        Returns:
            List of StudentSubmission objects
        """
        query = self.db.query(StudentSubmission).order_by(desc(StudentSubmission.submission_date))
        
        if status:
            query = query.filter(StudentSubmission.status == status)
        
        return query.offset(skip).limit(limit).all()
    
    def get_submission_count(self, status: Optional[str] = None) -> int:
        """Get total count of submissions."""
        query = self.db.query(StudentSubmission)
        
        if status:
            query = query.filter(StudentSubmission.status == status)
        
        return query.count()
    
    def get_submission_by_id(self, submission_id: str) -> Optional[StudentSubmission]:
        """
        Get a specific submission with analytics results.
        
        Args:
            submission_id: Unique identifier for the submission
            
        Returns:
            StudentSubmission object or None if not found
        """
        return self.db.query(StudentSubmission).filter(
            StudentSubmission.submission_id == submission_id
        ).first()
    
    def get_module_result(
        self, 
        submission_id: str, 
        tum_module_nr: str
    ) -> Optional[AnalyticsResult]:
        """
        Get a specific module result from a submission.
        
        Args:
            submission_id: Unique identifier for the submission
            tum_module_nr: TUM module number
            
        Returns:
            AnalyticsResult object or None if not found
        """
        return self.db.query(AnalyticsResult).filter(
            AnalyticsResult.submission_id == submission_id,
            AnalyticsResult.tum_module_nr == tum_module_nr
        ).first()
    
    def update_submission_status(
        self, 
        submission_id: str, 
        status: str,
        notes: Optional[str] = None
    ) -> Optional[StudentSubmission]:
        """
        Update submission status.
        
        Args:
            submission_id: Unique identifier for the submission
            status: New status (pending, in_review, approved, rejected)
            notes: Optional notes about the status change
            
        Returns:
            Updated StudentSubmission object or None if not found
        """
        submission = self.get_submission_by_id(submission_id)
        
        if submission:
            logger.info(f"Updating submission {submission_id} status: {submission.status} -> {status}")
            submission.status = status
            self.db.commit()
            self.db.refresh(submission)
        
        return submission
    
    def update_module_status(
        self,
        submission_id: str,
        tum_module_nr: str,
        status: str
    ) -> Optional[AnalyticsResult]:
        """
        Update individual module status.
        
        Args:
            submission_id: Unique identifier for the submission
            tum_module_nr: TUM module number
            status: New status (pending, approved, rejected)
            
        Returns:
            Updated AnalyticsResult object or None if not found
        """
        module_result = self.get_module_result(submission_id, tum_module_nr)
        
        if module_result:
            logger.info(f"Updating module {tum_module_nr} in submission {submission_id}: {module_result.status} -> {status}")
            module_result.status = status
            self.db.commit()
            self.db.refresh(module_result)
        
        return module_result
    
    def delete_submission(self, submission_id: str) -> bool:
        """
        Delete a submission and all its analytics results.
        
        Args:
            submission_id: Unique identifier for the submission
            
        Returns:
            True if deleted, False if not found
        """
        submission = self.get_submission_by_id(submission_id)
        
        if submission:
            logger.info(f"Deleting submission {submission_id}")
            self.db.delete(submission)
            self.db.commit()
            return True
        
        return False
