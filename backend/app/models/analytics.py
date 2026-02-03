"""
Analytics Models for Credit Recognition Analysis

Pydantic schemas for request/response structures used by the analytics service.
These models define the data structures for:
- Analysis requests (module pairs to compare)
- Learning outcome matches
- Bloom's taxonomy levels
- Coverage metrics
- Full analysis results

Also contains the SQLAlchemy database model for storing analytics results.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Float, JSON, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


# ============================================
# Enums
# ============================================

class MatchLevel(str, Enum):
    """Match level between learning outcomes."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    NONE = "none"


class BloomLevel(str, Enum):
    """Bloom's Taxonomy cognitive levels (ascending order)."""
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"


class DecisionHint(str, Enum):
    """AI-suggested decision classification."""
    HIGHLY_EQUIVALENT = "highly_equivalent"
    PARTIAL = "partial"
    INSUFFICIENT = "insufficient"


class FlagType(str, Enum):
    """Types of auto-detected issues."""
    CREDIT_MISMATCH = "credit_mismatch"
    MISSING_MANDATORY_LO = "missing_mandatory_lo"
    LEVEL_MISMATCH = "level_mismatch"
    LANGUAGE_MISMATCH = "language_mismatch"
    LOW_CONFIDENCE = "low_confidence"
    DEPTH_GAP = "depth_gap"


# ============================================
# Input Models
# ============================================

class SourceCourseInput(BaseModel):
    """A source course from external university to be analyzed."""
    source_course_no: str
    source_course_name: str
    source_credits: str
    source_grade: str
    source_content: Optional[str] = None  # Learning outcomes / description


class TUMModuleInput(BaseModel):
    """A TUM module to compare against."""
    tum_module_nr: str
    tum_module_title: str
    tum_ects: str
    tum_content: Optional[str] = None  # Module description
    tum_outcome: Optional[str] = None  # Learning outcomes
    source_courses: list[SourceCourseInput] = []


class AnalysisRequest(BaseModel):
    """Request to analyze module equivalence for credit recognition."""
    tum_modules: list[TUMModuleInput]
    # Optional metadata
    student_name: Optional[str] = None
    previous_university: Optional[str] = None
    previous_country: Optional[str] = None


# ============================================
# Output Models - Learning Outcome Analysis
# ============================================

class LearningOutcomeMatch(BaseModel):
    """A single learning outcome comparison result."""
    external_lo: str = Field(..., description="External course learning outcome")
    external_lo_index: int = Field(..., description="Index of external LO (1-based)")
    tum_lo: Optional[str] = Field(None, description="Matched TUM learning outcome")
    tum_lo_index: Optional[int] = Field(None, description="Index of TUM LO (1-based)")
    match_level: MatchLevel = Field(..., description="Quality of match")
    explanation: str = Field(..., description="Why this match level was assigned")
    confidence: float = Field(0.8, ge=0.0, le=1.0, description="Confidence in this match")


class TUMOutcomeCoverage(BaseModel):
    """Coverage status for a single TUM learning outcome."""
    tum_lo: str
    tum_lo_index: int
    is_covered: bool
    covered_by: list[int] = []  # Indices of external LOs that cover this
    coverage_quality: MatchLevel = MatchLevel.NONE


# ============================================
# Output Models - Depth Analysis
# ============================================

class DepthComparison(BaseModel):
    """Bloom's taxonomy comparison for a matched learning outcome pair."""
    external_lo_index: int
    tum_lo_index: Optional[int] = None
    external_bloom_level: BloomLevel
    tum_bloom_level: Optional[BloomLevel] = None
    depth_gap: int = Field(0, description="Positive = external deeper, negative = TUM deeper")
    has_depth_gap: bool = False
    note: Optional[str] = None


class ContentGranularity(BaseModel):
    """Content characteristics comparison."""
    theoretical_balance: float = Field(0.5, ge=0.0, le=1.0, description="0=practical, 1=theoretical")
    mathematical_rigor: float = Field(0.5, ge=0.0, le=1.0)
    has_lab_component: bool = False
    has_project_component: bool = False
    assessment_types: list[str] = []


# ============================================
# Output Models - Coverage Metrics
# ============================================

class CoverageMetrics(BaseModel):
    """Summary coverage statistics."""
    tum_outcomes_covered_percent: float = Field(0.0, ge=0.0, le=100.0)
    tum_outcomes_missing_percent: float = Field(0.0, ge=0.0, le=100.0)
    external_outcomes_excess_percent: float = Field(0.0, ge=0.0, le=100.0)
    total_tum_outcomes: int = 0
    total_external_outcomes: int = 0
    covered_count: int = 0
    missing_count: int = 0


# ============================================
# Output Models - Flags & Confidence
# ============================================

class AnalysisFlag(BaseModel):
    """An auto-detected issue or warning."""
    flag_type: FlagType
    severity: str = "warning"  # "warning" or "critical"
    message: str
    details: Optional[str] = None


class ConfidenceIndicators(BaseModel):
    """Confidence and quality indicators for the analysis."""
    overall_confidence: float = Field(0.8, ge=0.0, le=1.0)
    input_quality: str = "adequate"  # "poor", "adequate", "rich"
    uncertainty_areas: list[str] = []
    llm_reasoning_notes: Optional[str] = None


# ============================================
# Output Models - Full Results
# ============================================

class ModuleAnalysisResult(BaseModel):
    """Complete analysis result for one TUM module vs its source courses."""
    # Module identification
    tum_module_nr: str
    tum_module_title: str
    tum_ects: str
    source_summary: str = Field(..., description="Summary of source courses analyzed")
    
    # Primary metrics
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Equivalence score 0-100")
    decision_hint: DecisionHint
    decision_hint_text: str = Field(..., description="Human-readable decision suggestion")
    
    # Learning outcome analysis
    learning_outcome_matches: list[LearningOutcomeMatch] = []
    tum_outcome_coverage: list[TUMOutcomeCoverage] = []
    coverage_metrics: CoverageMetrics
    
    # Depth analysis
    depth_analysis: list[DepthComparison] = []
    content_granularity: Optional[ContentGranularity] = None
    
    # Explainability
    explanation: str = Field(..., description="Human-readable 'Why this score?' explanation")
    key_strengths: list[str] = []
    key_gaps: list[str] = []
    
    # Confidence & flags
    confidence: ConfidenceIndicators
    flags: list[AnalysisFlag] = []
    
    # Professor deep-dive
    detailed_reasoning: Optional[str] = None
    ambiguity_notes: list[str] = []
    recognition_suggestions: list[str] = []


class AnalyticsResponse(BaseModel):
    """Complete analytics response for all modules in a submission."""
    # Summary
    total_modules_analyzed: int
    average_score: float
    modules_highly_equivalent: int
    modules_partial: int
    modules_insufficient: int
    
    # Individual results
    module_results: list[ModuleAnalysisResult]
    
    # Metadata
    analysis_timestamp: str
    llm_model_used: Optional[str] = None


# ============================================
# Database Models
# ============================================

class AnalyticsResult(Base):
    """Stores analytics results for each module in a submission."""
    __tablename__ = "analytics_results"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(String(100), ForeignKey("student_submissions.submission_id"), nullable=False, index=True)
    
    # Module identification
    tum_module_nr = Column(String(50), nullable=False)
    tum_module_title = Column(String(255), nullable=False)
    tum_ects = Column(String(20))
    
    # Store complete analysis results as JSON
    analysis_data = Column(JSON, nullable=False)
    
    # Quick access fields for filtering/sorting
    overall_score = Column(Float, nullable=False)
    decision_hint = Column(String(50), nullable=False)  # highly_equivalent, partial, insufficient
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    submission = relationship("StudentSubmission", back_populates="analytics_results")
