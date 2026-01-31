"""
Analytics Service for Credit Recognition

Core service that orchestrates the analysis of module equivalence using LLM.
Provides detailed comparison between external courses and TUM modules.
"""

import json
import logging
import re
from datetime import datetime
from typing import Optional

from app.models.analytics import (
    AnalysisRequest,
    AnalyticsResponse,
    ModuleAnalysisResult,
    TUMModuleInput,
    SourceCourseInput,
    LearningOutcomeMatch,
    TUMOutcomeCoverage,
    DepthComparison,
    CoverageMetrics,
    ConfidenceIndicators,
    AnalysisFlag,
    MatchLevel,
    BloomLevel,
    DecisionHint,
    FlagType,
)
from app.services.analytics.prompts import (
    FULL_EQUIVALENCE_ANALYSIS_PROMPT,
    format_source_courses,
)
from app.services.llm_service.client import BaseLLMClient

logger = logging.getLogger(__name__)


# ============================================
# Helper functions for robust enum parsing
# ============================================

def safe_parse_bloom_level(value: str, default: BloomLevel = BloomLevel.UNDERSTAND) -> BloomLevel:
    """
    Safely parse a BloomLevel from LLM output.
    Handles compound values like 'apply/analyze' by taking the first valid one.
    """
    if not value:
        return default
    
    # Normalize: lowercase, strip whitespace
    value = str(value).lower().strip()
    
    # Handle compound values (e.g., "apply/analyze", "understand/apply")
    if "/" in value:
        parts = value.split("/")
        for part in parts:
            part = part.strip()
            try:
                return BloomLevel(part)
            except ValueError:
                continue
        return default
    
    # Handle hyphenated values
    if "-" in value:
        parts = value.split("-")
        value = parts[0].strip()
    
    # Direct lookup
    try:
        return BloomLevel(value)
    except ValueError:
        # Try to fuzzy match common variations
        mappings = {
            "knowledge": BloomLevel.REMEMBER,
            "comprehension": BloomLevel.UNDERSTAND,
            "application": BloomLevel.APPLY,
            "analysis": BloomLevel.ANALYZE,
            "synthesis": BloomLevel.CREATE,
            "evaluation": BloomLevel.EVALUATE,
        }
        return mappings.get(value, default)


def safe_parse_match_level(value: str, default: MatchLevel = MatchLevel.NONE) -> MatchLevel:
    """Safely parse a MatchLevel from LLM output."""
    if not value:
        return default
    
    value = str(value).lower().strip()
    
    # Handle compound values
    if "/" in value:
        value = value.split("/")[0].strip()
    
    try:
        return MatchLevel(value)
    except ValueError:
        # Fuzzy matching
        if "high" in value:
            return MatchLevel.HIGH
        elif "med" in value:
            return MatchLevel.MEDIUM
        elif "low" in value:
            return MatchLevel.LOW
        return default


def safe_parse_decision_hint(value: str, default: DecisionHint = DecisionHint.PARTIAL) -> DecisionHint:
    """Safely parse a DecisionHint from LLM output."""
    if not value:
        return default
    
    value = str(value).lower().strip().replace(" ", "_").replace("-", "_")
    
    try:
        return DecisionHint(value)
    except ValueError:
        if "high" in value or "equiv" in value:
            return DecisionHint.HIGHLY_EQUIVALENT
        elif "insuff" in value or "reject" in value:
            return DecisionHint.INSUFFICIENT
        return default


def safe_parse_flag_type(value: str) -> Optional[FlagType]:
    """Safely parse a FlagType from LLM output. Returns None if invalid."""
    if not value:
        return None
    
    value = str(value).lower().strip().replace(" ", "_").replace("-", "_")
    
    try:
        return FlagType(value)
    except ValueError:
        return None


class AnalyticsService:
    """
    Service for analyzing module equivalence for credit recognition.
    
    Uses LLM to compare learning outcomes, assess depth, and generate
    human-readable explanations for TUM staff and professors.
    """
    
    def __init__(self, llm_client: BaseLLMClient):
        self.llm_client = llm_client
    
    async def analyze_submission(
        self, 
        request: AnalysisRequest
    ) -> AnalyticsResponse:
        """
        Analyze all module pairs in a submission.
        
        Args:
            request: Analysis request with TUM modules and their source courses
            
        Returns:
            Complete analytics response with results for each module
        """
        module_results: list[ModuleAnalysisResult] = []
        
        for tum_module in request.tum_modules:
            try:
                result = await self.analyze_module_pair(tum_module)
                module_results.append(result)
            except Exception as e:
                logger.error(f"Failed to analyze module {tum_module.tum_module_nr}: {e}")
                # Create a fallback result with error
                module_results.append(self._create_error_result(tum_module, str(e)))
        
        # Calculate summary statistics
        scores = [r.overall_score for r in module_results]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        highly_equivalent = sum(1 for r in module_results if r.decision_hint == DecisionHint.HIGHLY_EQUIVALENT)
        partial = sum(1 for r in module_results if r.decision_hint == DecisionHint.PARTIAL)
        insufficient = sum(1 for r in module_results if r.decision_hint == DecisionHint.INSUFFICIENT)
        
        return AnalyticsResponse(
            total_modules_analyzed=len(module_results),
            average_score=round(avg_score, 1),
            modules_highly_equivalent=highly_equivalent,
            modules_partial=partial,
            modules_insufficient=insufficient,
            module_results=module_results,
            analysis_timestamp=datetime.utcnow().isoformat(),
            llm_model_used=getattr(self.llm_client, 'model', 'unknown')
        )
    
    async def analyze_module_pair(
        self, 
        tum_module: TUMModuleInput
    ) -> ModuleAnalysisResult:
        """
        Analyze equivalence between one TUM module and its source courses.
        
        Args:
            tum_module: TUM module with associated source courses
            
        Returns:
            Detailed analysis result
        """
        # Build source courses summary
        source_summary = ", ".join(
            f"{sc.source_course_name} ({sc.source_course_no})" 
            for sc in tum_module.source_courses
        )
        
        source_courses_details = format_source_courses([
            {
                "source_course_name": sc.source_course_name,
                "source_course_no": sc.source_course_no,
                "source_credits": sc.source_credits,
                "source_grade": sc.source_grade,
                "source_content": sc.source_content or "No content provided"
            }
            for sc in tum_module.source_courses
        ])
        
        # Build the prompt
        prompt = FULL_EQUIVALENCE_ANALYSIS_PROMPT.format(
            tum_module_nr=tum_module.tum_module_nr,
            tum_module_title=tum_module.tum_module_title,
            tum_ects=tum_module.tum_ects,
            tum_content=tum_module.tum_content or "No content provided",
            tum_outcome=tum_module.tum_outcome or "No learning outcomes provided",
            source_courses_details=source_courses_details
        )
        
        try:
            # Call LLM using chat API (required for GPT-4+ models)
            messages = [
                {"role": "system", "content": "You are an expert academic credit recognition analyst. You analyze course equivalences between universities and provide structured JSON responses."},
                {"role": "user", "content": prompt}
            ]
            response = await self.llm_client.chat(messages, temperature=1.0)
            
            # Extract text from response dict
            response_text = response.get("message", "") or response.get("text", "")
            
            logger.info(f"LLM response received for {tum_module.tum_module_nr}: {len(response_text)} chars")
            
            # Parse JSON response
            analysis_data = self._parse_llm_response(response_text)
            
            # Convert to result model
            return self._build_result(tum_module, source_summary, analysis_data)
            
        except Exception as e:
            logger.error(f"LLM analysis failed for {tum_module.tum_module_nr}: {e}")
            raise
    
    def _parse_llm_response(self, response: str) -> dict:
        """Parse JSON from LLM response, handling markdown code blocks."""
        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*\n?([\s\S]*?)\n?```', response)
        if json_match:
            json_str = json_match.group(1).strip()
        else:
            # Try direct JSON parsing
            json_str = response.strip()
        
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse LLM response as JSON: {e}")
            # Return default structure
            return self._get_default_analysis()
    
    def _get_default_analysis(self) -> dict:
        """Return default analysis structure when parsing fails."""
        return {
            "overall_score": 50,
            "decision_hint": "partial",
            "decision_hint_text": "Analysis could not be completed reliably",
            "learning_outcome_matches": [],
            "coverage_metrics": {
                "tum_outcomes_covered_percent": 0,
                "tum_outcomes_missing_percent": 100,
                "external_outcomes_excess_percent": 0,
                "total_tum_outcomes": 0,
                "total_external_outcomes": 0,
                "covered_count": 0,
                "missing_count": 0
            },
            "depth_analysis": [],
            "explanation": "Analysis could not be completed. Please review manually.",
            "key_strengths": [],
            "key_gaps": ["Unable to analyze - manual review required"],
            "flags": [{
                "flag_type": "low_confidence",
                "severity": "critical",
                "message": "Analysis parsing failed",
                "details": "LLM response could not be parsed"
            }],
            "confidence": {
                "overall_confidence": 0.2,
                "input_quality": "poor",
                "uncertainty_areas": ["Analysis failed to complete"],
                "llm_reasoning_notes": None
            },
            "detailed_reasoning": None,
            "ambiguity_notes": [],
            "recognition_suggestions": ["Manual review required"]
        }
    
    def _build_result(
        self, 
        tum_module: TUMModuleInput, 
        source_summary: str,
        data: dict
    ) -> ModuleAnalysisResult:
        """Convert parsed LLM data to ModuleAnalysisResult."""
        
        # Helper to safely parse integers
        def safe_int(val, default=0):
            try:
                return int(val) if val is not None else default
            except (ValueError, TypeError):
                return default
        
        # Helper to safely parse floats
        def safe_float_pct(val, default=0.0):
            try:
                result = float(val) if val is not None else default
                return max(0.0, min(100.0, result))
            except (ValueError, TypeError):
                return default
        
        def safe_confidence_val(val, default=0.5):
            try:
                result = float(val) if val is not None else default
                return max(0.0, min(1.0, result))
            except (ValueError, TypeError):
                return default
        
        # Parse learning outcome matches with validation
        lo_matches = []
        lo_match_data = data.get("learning_outcome_matches", [])
        if isinstance(lo_match_data, list):
            for match in lo_match_data:
                if not isinstance(match, dict):
                    continue
                try:
                    lo_matches.append(LearningOutcomeMatch(
                        external_lo=str(match.get("external_lo", "")),
                        external_lo_index=safe_int(match.get("external_lo_index"), 0),
                        tum_lo=str(match.get("tum_lo")) if match.get("tum_lo") else None,
                        tum_lo_index=safe_int(match.get("tum_lo_index")) if match.get("tum_lo_index") is not None else None,
                        match_level=safe_parse_match_level(match.get("match_level", "none")),
                        explanation=str(match.get("explanation", "")),
                        confidence=safe_confidence_val(match.get("confidence"), 0.5)
                    ))
                except Exception as e:
                    logger.warning(f"Failed to parse learning outcome match: {e}")
                    continue
        
        # Parse coverage metrics with validation
        cm_data = data.get("coverage_metrics", {}) or {}
        coverage_metrics = CoverageMetrics(
            tum_outcomes_covered_percent=safe_float_pct(cm_data.get("tum_outcomes_covered_percent"), 0),
            tum_outcomes_missing_percent=safe_float_pct(cm_data.get("tum_outcomes_missing_percent"), 0),
            external_outcomes_excess_percent=safe_float_pct(cm_data.get("external_outcomes_excess_percent"), 0),
            total_tum_outcomes=safe_int(cm_data.get("total_tum_outcomes"), 0),
            total_external_outcomes=safe_int(cm_data.get("total_external_outcomes"), 0),
            covered_count=safe_int(cm_data.get("covered_count"), 0),
            missing_count=safe_int(cm_data.get("missing_count"), 0)
        )
        
        # Parse depth analysis with validation
        depth_analysis = []
        depth_data = data.get("depth_analysis", [])
        if isinstance(depth_data, list):
            for da in depth_data:
                if not isinstance(da, dict):
                    continue
                try:
                    depth_analysis.append(DepthComparison(
                        external_lo_index=safe_int(da.get("external_lo_index"), 0),
                        tum_lo_index=safe_int(da.get("tum_lo_index")) if da.get("tum_lo_index") is not None else None,
                        external_bloom_level=safe_parse_bloom_level(da.get("external_bloom_level", "understand")),
                        tum_bloom_level=safe_parse_bloom_level(da.get("tum_bloom_level")) if da.get("tum_bloom_level") else None,
                        has_depth_gap=bool(da.get("has_depth_gap", False)),
                        depth_gap=safe_int(da.get("depth_gap"), 0),
                        note=str(da.get("note")) if da.get("note") else None
                    ))
                except Exception as e:
                    logger.warning(f"Failed to parse depth analysis item: {e}")
                    continue
        
        # Parse confidence with validation
        conf_data = data.get("confidence", {}) or {}
        
        def safe_confidence(val, default=0.5):
            try:
                result = float(val) if val is not None else default
                return max(0.0, min(1.0, result))
            except (ValueError, TypeError):
                return default
        
        # Ensure uncertainty_areas is a list of strings
        uncertainty_areas = conf_data.get("uncertainty_areas", [])
        if not isinstance(uncertainty_areas, list):
            uncertainty_areas = [str(uncertainty_areas)] if uncertainty_areas else []
        else:
            uncertainty_areas = [str(item) for item in uncertainty_areas if item]
        
        # Validate input_quality
        input_quality = str(conf_data.get("input_quality", "adequate")).lower()
        if input_quality not in ("poor", "adequate", "rich"):
            input_quality = "adequate"
        
        confidence = ConfidenceIndicators(
            overall_confidence=safe_confidence(conf_data.get("overall_confidence"), 0.5),
            input_quality=input_quality,
            uncertainty_areas=uncertainty_areas,
            llm_reasoning_notes=str(conf_data.get("llm_reasoning_notes")) if conf_data.get("llm_reasoning_notes") else None
        )
        
        # Parse flags
        flags = []
        for flag in data.get("flags", []):
            flag_type = safe_parse_flag_type(flag.get("flag_type", "low_confidence"))
            if flag_type:
                flags.append(AnalysisFlag(
                    flag_type=flag_type,
                    severity=flag.get("severity", "warning"),
                    message=flag.get("message", ""),
                    details=flag.get("details")
                ))
        
        # Map decision hint using safe parser
        decision_hint = safe_parse_decision_hint(data.get("decision_hint", "partial"))
        
        # Safely parse numeric fields
        def safe_float(val, default=50.0, min_val=0.0, max_val=100.0):
            try:
                result = float(val) if val is not None else default
                return max(min_val, min(max_val, result))
            except (ValueError, TypeError):
                return default
        
        overall_score = safe_float(data.get("overall_score"), default=50.0, min_val=0.0, max_val=100.0)
        
        return ModuleAnalysisResult(
            tum_module_nr=tum_module.tum_module_nr,
            tum_module_title=tum_module.tum_module_title,
            tum_ects=tum_module.tum_ects,
            source_summary=source_summary,
            overall_score=overall_score,
            decision_hint=decision_hint,
            decision_hint_text=str(data.get("decision_hint_text", "Manual review recommended")),
            learning_outcome_matches=lo_matches,
            tum_outcome_coverage=[],  # Can be computed from matches if needed
            coverage_metrics=coverage_metrics,
            depth_analysis=depth_analysis,
            content_granularity=None,  # Optional advanced feature
            explanation=str(data.get("explanation", "Analysis complete.")),
            key_strengths=data.get("key_strengths", []) or [],
            key_gaps=data.get("key_gaps", []) or [],
            confidence=confidence,
            flags=flags,
            detailed_reasoning=data.get("detailed_reasoning"),
            ambiguity_notes=data.get("ambiguity_notes", []) or [],
            recognition_suggestions=data.get("recognition_suggestions", []) or []
        )
    
    def _create_error_result(
        self, 
        tum_module: TUMModuleInput, 
        error_message: str
    ) -> ModuleAnalysisResult:
        """Create a result indicating analysis failure."""
        return ModuleAnalysisResult(
            tum_module_nr=tum_module.tum_module_nr,
            tum_module_title=tum_module.tum_module_title,
            tum_ects=tum_module.tum_ects,
            source_summary="Error during analysis",
            overall_score=0,
            decision_hint=DecisionHint.INSUFFICIENT,
            decision_hint_text="Analysis failed - manual review required",
            learning_outcome_matches=[],
            tum_outcome_coverage=[],
            coverage_metrics=CoverageMetrics(),
            depth_analysis=[],
            explanation=f"Analysis could not be completed: {error_message}",
            key_strengths=[],
            key_gaps=["Analysis failed"],
            confidence=ConfidenceIndicators(
                overall_confidence=0,
                input_quality="poor",
                uncertainty_areas=["Analysis failed completely"]
            ),
            flags=[
                AnalysisFlag(
                    flag_type=FlagType.LOW_CONFIDENCE,
                    severity="critical",
                    message="Analysis failed",
                    details=error_message
                )
            ],
            detailed_reasoning=None,
            ambiguity_notes=[],
            recognition_suggestions=["Manual review required"]
        )
