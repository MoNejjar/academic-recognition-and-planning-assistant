"""
LLM Prompt Templates for Analytics Service

Contains all prompts used for:
- Learning outcome extraction
- Equivalence analysis
- Bloom's taxonomy classification
- Explanation generation
"""

# ============================================
# Learning Outcome Extraction
# ============================================

EXTRACT_LEARNING_OUTCOMES_PROMPT = """You are an expert at analyzing academic course descriptions and extracting learning outcomes.

Given the following course content, extract all learning outcomes as a numbered list.
If explicit learning outcomes are not stated, infer them from the course description, objectives, and content.

Course Content:
{content}

Instructions:
1. Extract or infer 3-8 learning outcomes
2. Each outcome should be a clear, actionable statement starting with a verb
3. Use Bloom's taxonomy verbs (understand, apply, analyze, evaluate, create)
4. Be specific about what students will be able to do

Return your response as a JSON object:
{{
  "learning_outcomes": [
    "Learning outcome 1...",
    "Learning outcome 2...",
    ...
  ],
  "confidence": 0.85,
  "notes": "Any notes about extraction quality"
}}
"""

# ============================================
# Learning Outcome Matching
# ============================================

MATCH_LEARNING_OUTCOMES_PROMPT = """You are an expert at comparing academic learning outcomes for credit recognition purposes.

Your task is to analyze how well the learning outcomes from an external course match those of a TUM (Technical University of Munich) module.

TUM Module: {tum_module_title} ({tum_module_nr})
TUM Learning Outcomes:
{tum_outcomes}

External Course(s): {source_courses_summary}
External Learning Outcomes:
{external_outcomes}

For each external learning outcome, determine:
1. Which TUM learning outcome it best matches (if any)
2. The quality of the match: "high", "medium", "low", or "none"
3. A brief explanation of why

Match Level Criteria:
- HIGH: Covers the same concepts at the same or deeper level
- MEDIUM: Covers similar concepts but at different depth or scope
- LOW: Tangentially related but significant gaps
- NONE: No meaningful connection

Return your response as a JSON object:
{{
  "matches": [
    {{
      "external_lo_index": 1,
      "external_lo": "The external learning outcome text",
      "tum_lo_index": 3,
      "tum_lo": "The matched TUM learning outcome text (or null if no match)",
      "match_level": "high",
      "explanation": "Both cover object-oriented design patterns at implementation level",
      "confidence": 0.9
    }},
    ...
  ],
  "unmatched_tum_outcomes": [2, 5],
  "analysis_notes": "Overall observations about the comparison"
}}
"""

# ============================================
# Bloom's Taxonomy Classification
# ============================================

CLASSIFY_BLOOM_LEVEL_PROMPT = """You are an expert in Bloom's Taxonomy for educational objectives.

Classify the cognitive level of each learning outcome according to Bloom's Taxonomy:
1. REMEMBER - Recall facts, terms, concepts
2. UNDERSTAND - Explain ideas, interpret meaning
3. APPLY - Use knowledge in new situations
4. ANALYZE - Draw connections, identify components
5. EVALUATE - Justify decisions, critique
6. CREATE - Design, construct, produce new work

Learning Outcomes to Classify:
{outcomes}

Return your response as a JSON object:
{{
  "classifications": [
    {{
      "outcome_index": 1,
      "outcome_text": "The learning outcome",
      "bloom_level": "apply",
      "key_verbs": ["implement", "use"],
      "reasoning": "The outcome focuses on practical application of concepts"
    }},
    ...
  ]
}}
"""

# ============================================
# Full Equivalence Analysis
# ============================================

FULL_EQUIVALENCE_ANALYSIS_PROMPT = """You are an academic expert helping TUM staff and professors evaluate credit recognition applications.

Your task is to provide a comprehensive equivalence analysis between an external course and a TUM module.

## TUM Module Information
Module Code: {tum_module_nr}
Module Title: {tum_module_title}
ECTS Credits: {tum_ects}
Module Content/Description:
{tum_content}

Learning Outcomes:
{tum_outcome}

## External Course(s) Information
{source_courses_details}

## Your Analysis Task

Provide a detailed equivalence analysis including:

1. **Overall Equivalence Score (0-100)**
   - 80-100: Strong equivalence, suitable for recognition
   - 60-79: Partial equivalence, manual review recommended
   - 0-59: Insufficient equivalence

2. **Learning Outcome Mapping**
   - Match each external LO to TUM LOs
   - Identify gaps and excess coverage

3. **Depth Analysis**
   - Compare cognitive levels (Bloom's Taxonomy)
   - Identify depth gaps

4. **Explanation**
   - Clear, non-technical explanation of why this score
   - Key strengths and gaps

5. **Flags/Warnings**
   - Credit mismatches
   - Missing mandatory outcomes
   - Level mismatches

Return your response as a JSON object:
{{
  "overall_score": 78,
  "decision_hint": "partial",
  "decision_hint_text": "Partially equivalent – manual review recommended",
  
  "learning_outcome_matches": [
    {{
      "external_lo": "Learning outcome text",
      "external_lo_index": 1,
      "tum_lo": "Matched TUM outcome or null",
      "tum_lo_index": 2,
      "match_level": "high",
      "explanation": "Why this match level",
      "confidence": 0.85
    }}
  ],
  
  "coverage_metrics": {{
    "tum_outcomes_covered_percent": 75,
    "tum_outcomes_missing_percent": 25,
    "external_outcomes_excess_percent": 10,
    "total_tum_outcomes": 4,
    "total_external_outcomes": 5,
    "covered_count": 3,
    "missing_count": 1
  }},
  
  "depth_analysis": [
    {{
      "external_lo_index": 1,
      "tum_lo_index": 2,
      "external_bloom_level": "apply",
      "tum_bloom_level": "analyze",
      "has_depth_gap": true,
      "depth_gap": -1,
      "note": "TUM requires deeper analytical skills"
    }}
  ],
  
  "explanation": "A clear 2-3 sentence explanation of why this score was assigned, written for non-technical staff.",
  
  "key_strengths": [
    "Strong coverage of core programming concepts",
    "Both require practical implementation projects"
  ],
  
  "key_gaps": [
    "Missing advanced algorithm analysis",
    "No coverage of formal verification methods"
  ],
  
  "flags": [
    {{
      "flag_type": "credit_mismatch",
      "severity": "warning",
      "message": "Credit difference of 2 ECTS",
      "details": "External: 6 ECTS, TUM: 8 ECTS"
    }}
  ],
  
  "confidence": {{
    "overall_confidence": 0.82,
    "input_quality": "adequate",
    "uncertainty_areas": ["External course description lacks detail on assessment methods"],
    "llm_reasoning_notes": "Analysis based on clear learning outcome statements from both sources"
  }},
  
  "detailed_reasoning": "Extended analysis for professors: [detailed text]",
  
  "ambiguity_notes": ["The term 'advanced' in external LO #3 is subjective"],
  
  "recognition_suggestions": ["Consider partial recognition with supplementary exam on topic X"]
}}
"""

# ============================================
# Explanation Generation
# ============================================

GENERATE_EXPLANATION_PROMPT = """Based on the following analysis results, write a clear, concise explanation for TUM staff reviewing this credit recognition application.

Analysis Data:
- Overall Score: {score}%
- TUM Module: {tum_module_title}
- External Course(s): {source_courses}
- Covered Outcomes: {covered_count}/{total_tum_outcomes}
- Key Gaps: {key_gaps}

Write 2-3 sentences explaining:
1. Why this score was assigned
2. The main strength or concern
3. A recommendation (recognize, review further, or reject)

Use plain language. Avoid technical jargon. Be direct but professional.
"""

# ============================================
# Utility function
# ============================================

def format_outcomes_list(outcomes: list[str]) -> str:
    """Format a list of outcomes as a numbered list."""
    return "\n".join(f"{i+1}. {outcome}" for i, outcome in enumerate(outcomes))


def format_source_courses(courses: list[dict]) -> str:
    """Format source courses for the prompt."""
    parts = []
    for i, course in enumerate(courses, 1):
        parts.append(f"""
Course {i}: {course.get('source_course_name', 'Unknown')} ({course.get('source_course_no', 'N/A')})
Credits: {course.get('source_credits', 'N/A')}
Grade: {course.get('source_grade', 'N/A')}
Content/Learning Outcomes:
{course.get('source_content', 'No content provided')}
""")
    return "\n---\n".join(parts)
