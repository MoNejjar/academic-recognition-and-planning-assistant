"""
Analytics API Routes

Endpoints for credit recognition analysis:
- POST /analyze - Analyze module equivalence
"""

import logging
from fastapi import APIRouter, HTTPException

from app.models.analytics_models import AnalysisRequest, AnalyticsResponse
from app.services.analytics.analytics_service import AnalyticsService
from app.utils.llm_utils import get_llm_client

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=AnalyticsResponse)
async def analyze_submission(request: AnalysisRequest) -> AnalyticsResponse:
    """
    Analyze module equivalence for credit recognition.
    
    This endpoint performs comprehensive analysis comparing external courses
    to TUM modules, including:
    - Learning outcome alignment
    - Coverage metrics
    - Bloom's taxonomy depth analysis
    - Confidence indicators
    - Auto-detected flags/warnings
    
    Input: List of TUM modules with their associated source courses
    Output: Detailed equivalence analysis with scores, alignments, and explanations
    
    Example request body:
    ```json
    {
      "tum_modules": [
        {
          "tum_module_nr": "IN2001",
          "tum_module_title": "Algorithms and Data Structures",
          "tum_ects": "8",
          "tum_content": "Module description...",
          "tum_outcome": "Learning outcomes...",
          "source_courses": [
            {
              "source_course_no": "CS101",
              "source_course_name": "Introduction to Algorithms",
              "source_credits": "3",
              "source_grade": "1.7",
              "source_content": "Course learning outcomes..."
            }
          ]
        }
      ],
      "student_name": "John Doe",
      "previous_university": "Example University",
      "previous_country": "Germany"
    }
    ```
    """
    if not request.tum_modules:
        raise HTTPException(
            status_code=400,
            detail="At least one TUM module is required for analysis"
        )
    
    try:
        llm_client = get_llm_client()
        service = AnalyticsService(llm_client)
        result = await service.analyze_submission(request)
        return result
    except Exception as e:
        logger.exception("Analytics analysis failed")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
