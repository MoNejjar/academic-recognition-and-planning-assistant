"""
LLM Prompt Templates for Analytics Service

Contains comprehensive prompts for:
- Learning outcome extraction (detailed, structured)
- Equivalence analysis (thorough, evidence-based)
- Explanation generation (clear, professional)

Designed to produce detailed, actionable analysis for academic recognition decisions.
"""

# ============================================
# Learning Outcome Extraction
# ============================================

EXTRACT_LEARNING_OUTCOMES_PROMPT = """You are an expert academic analyst specializing in extracting and structuring learning outcomes from course materials. Your analysis is used by TUM professors and staff for credit recognition decisions.

**TASK**: Extract comprehensive learning outcomes from the provided course content.

**Course Content to Analyze**:
{content}

**Extraction Guidelines**:

1. **Identify Explicit Outcomes**: Find any stated learning objectives, goals, or outcomes.

2. **Infer Implicit Outcomes**: From course content, topics, and assessments, determine what competencies students develop.

3. **Structure Each Outcome**:
   - Start with an action verb (Bloom's taxonomy: remember, understand, apply, analyze, evaluate, create)
   - Be specific about the subject matter
   - Include context about depth/level where possible

4. **Quality Standards**:
   - Extract 4-10 learning outcomes
   - Each outcome should be measurable and specific
   - Avoid vague terms like "understand basics" - be precise
   - Consider both theoretical knowledge and practical skills
   - Include both fundamental and advanced competencies

**Return your response as JSON**:
{{
  "learning_outcomes": [
    "Apply object-oriented design patterns to solve real-world software architecture problems",
    "Analyze algorithmic complexity using Big-O notation and select optimal solutions",
    ...
  ],
  "confidence": 0.85,
  "extraction_method": "explicit" | "inferred" | "mixed",
  "coverage_areas": ["programming", "algorithms", "data structures"],
  "notes": "Any observations about extraction quality or limitations"
}}
"""

# ============================================
# Learning Outcome Matching
# ============================================

MATCH_LEARNING_OUTCOMES_PROMPT = """You are a senior academic assessor specializing in course equivalence evaluation for credit recognition at TUM (Technical University of Munich).

**TASK**: Perform detailed matching analysis between external course learning outcomes and TUM module learning outcomes.

**TUM Module Reference**:
- Module: {tum_module_title} ({tum_module_nr})
- TUM Learning Outcomes:
{tum_outcomes}

**External Course Information**:
- Source: {source_courses_summary}
- External Learning Outcomes:
{external_outcomes}

**Matching Methodology**:

For each external learning outcome, conduct thorough analysis:

1. **Semantic Matching**: Identify the TUM learning outcome with the highest conceptual overlap.

2. **Match Quality Assessment** (use strict criteria):
   - **HIGH**: Covers identical concepts at equivalent or greater depth. Student would demonstrably achieve the TUM outcome.
   - **MEDIUM**: Covers substantially similar concepts but with notable differences in depth, scope, or approach.
   - **LOW**: Related topic area but significant gaps in coverage, depth, or methodology.
   - **NONE**: No meaningful pedagogical connection.

3. **Evidence-Based Justification**: Provide specific reasoning citing the actual content of both outcomes.

4. **Confidence Rating**: How certain are you about this match (0.0-1.0)?

**Important Considerations**:
- A "HIGH" match requires strong evidence that the learning objectives are pedagogically equivalent
- Consider cognitive complexity levels (Bloom's taxonomy)
- Account for practical vs theoretical emphasis differences
- Note any prerequisite knowledge assumptions

**Return your response as JSON**:
{{
  "matches": [
    {{
      "external_lo_index": 1,
      "external_lo": "Full text of the external learning outcome",
      "tum_lo_index": 3,
      "tum_lo": "Full text of the matched TUM learning outcome (or null)",
      "match_level": "high" | "medium" | "low" | "none",
      "explanation": "Specific reasoning: Both outcomes require students to implement design patterns in object-oriented code. The external course covers Strategy, Observer, and Factory patterns, while TUM focuses on these plus Decorator and Adapter.",
      "confidence": 0.9,
      "depth_comparison": "External is at APPLICATION level, TUM requires ANALYSIS level"
    }}
  ],
  "unmatched_tum_outcomes": [2, 5],
  "unmatched_tum_details": [
    {{
      "tum_lo_index": 2,
      "tum_lo": "The unmatched TUM outcome text",
      "why_unmatched": "The external course does not cover formal verification methods",
      "criticality": "critical" | "important" | "supplementary"
    }}
  ],
  "analysis_notes": "Overall assessment of the comparison quality and any limitations"
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
# Full Equivalence Analysis (Comprehensive)
# ============================================

FULL_EQUIVALENCE_ANALYSIS_PROMPT = """You are a senior academic expert at TUM (Technical University of Munich) conducting a comprehensive credit recognition analysis. Your assessment will directly inform professors and staff making recognition decisions.

**CRITICAL**: Provide thorough, evidence-based analysis. Vague or superficial assessments are not acceptable.

---

## 📘 TUM MODULE (TARGET)

**Module Code**: {tum_module_nr}
**Module Title**: {tum_module_title}
**ECTS Credits**: {tum_ects}

**Module Content/Description**:
{tum_content}

**Learning Outcomes**:
{tum_outcome}

---

## 📗 EXTERNAL COURSE(S) (SOURCE)

{source_courses_details}

---

## YOUR COMPREHENSIVE ANALYSIS

Conduct a rigorous analysis addressing each area below:

### 1. OVERALL EQUIVALENCE SCORE (0-100)

Calculate based on weighted factors:
- Learning outcome coverage (40% weight)
- Cognitive depth alignment (25% weight)
- Content scope and topics (20% weight)
- Credit hours / workload comparison (15% weight)

**Score Interpretation**:
- **85-100**: Strong equivalence – Recognition recommended
- **70-84**: Substantial equivalence – Recognition recommended with minor considerations
- **55-69**: Partial equivalence – Manual review required, possible conditional recognition
- **40-54**: Limited equivalence – Significant gaps, supplementary requirements likely
- **0-39**: Insufficient equivalence – Recognition not recommended

### 2. LEARNING OUTCOME MAPPING

For EACH external learning outcome:
- Identify the best-matching TUM learning outcome
- Assess match quality (high/medium/low/none) with specific justification
- Note cognitive level differences (using Bloom's taxonomy as reference)

Also identify which TUM outcomes are NOT covered and assess their criticality.

### 3. CONTENT DEPTH ANALYSIS

Compare the depth of treatment for major topics:
- Are foundational concepts covered at appropriate depth?
- Are advanced topics present in both?
- Are practical/applied elements comparable?
- Are assessment methods similar in rigor?

### 4. PROFESSIONAL EXPLANATION

Write a clear, 3-4 sentence explanation suitable for:
- Staff members (non-technical, process-focused)
- Professors (technical, academic rigor-focused)

Explain WHY you assigned this score. Be specific about strengths and gaps.

### 5. KEY STRENGTHS (be specific)

List 2-4 specific strengths with evidence. Examples:
- "Both courses require implementation of recursive algorithms with O(n log n) complexity analysis"
- "The external course includes a capstone project comparable to TUM's practical component"

### 6. KEY GAPS (be specific and actionable)

List specific gaps with suggested remediation:
- "Missing: Formal verification methods (TUM LO #4) – Suggest supplementary exam or module"
- "Depth gap: External covers sorting at APPLY level; TUM requires ANALYZE level"

### 7. FLAGS AND WARNINGS

Identify critical issues:
- Credit hour mismatches (≥2 ECTS difference)
- Missing mandatory outcomes
- Significant level/depth mismatches
- Quality concerns with source documentation

### 8. RECOGNITION SUGGESTIONS

Provide actionable recommendations:
- Full recognition? Partial recognition?
- If partial: what supplementary requirements?
- Alternative TUM modules if better match exists?
- Conditions or caveats for the decision?

### 9. DETAILED REASONING (for professors)

Extended technical analysis for academic review:
- Pedagogical alignment assessment
- Specific content comparison
- Assessment methodology comparison
- Any nuanced considerations

---

**Return your response as JSON**:
{{
  "overall_score": 78,
  "score_breakdown": {{
    "learning_outcome_coverage": 82,
    "cognitive_depth_alignment": 70,
    "content_scope": 80,
    "credit_workload": 75
  }},
  "decision_hint": "partial" | "full" | "reject",
  "decision_hint_text": "Clear statement of recommendation",
  
  "learning_outcome_matches": [
    {{
      "external_lo": "Full learning outcome text from external course",
      "external_lo_index": 1,
      "tum_lo": "Full matched TUM learning outcome text (or null)",
      "tum_lo_index": 2,
      "match_level": "high" | "medium" | "low" | "none",
      "explanation": "Detailed explanation with specific evidence from both outcomes",
      "confidence": 0.85,
      "cognitive_comparison": "External: APPLY, TUM: ANALYZE - Gap of 1 level"
    }}
  ],
  
  "unmatched_tum_outcomes": [
    {{
      "tum_lo_index": 4,
      "tum_lo": "The unmatched TUM learning outcome",
      "criticality": "critical" | "important" | "supplementary",
      "remediation": "Suggested supplementary requirement or alternative"
    }}
  ],
  
  "coverage_metrics": {{
    "tum_outcomes_covered_percent": 75,
    "tum_outcomes_missing_percent": 25,
    "external_outcomes_excess_percent": 10,
    "total_tum_outcomes": 4,
    "total_external_outcomes": 5,
    "covered_count": 3,
    "missing_count": 1,
    "high_matches": 2,
    "medium_matches": 1,
    "low_matches": 0
  }},
  
  "depth_analysis": [
    {{
      "topic": "Algorithm Analysis",
      "external_depth": "Introductory/Applied",
      "tum_depth": "Intermediate/Analytical", 
      "has_depth_gap": true,
      "gap_severity": "moderate",
      "note": "TUM requires formal complexity proofs; external focuses on practical application"
    }}
  ],
  
  "explanation": "This course achieves 78% equivalence with TUM's module. The external course strongly covers core programming concepts (3 of 4 learning outcomes matched at HIGH level) and includes comparable practical assignments. However, a critical gap exists in formal algorithm analysis – the TUM module requires students to prove algorithmic correctness, which the external course does not address. Credit hours are equivalent (6 ECTS each). Recommend partial recognition with a supplementary assessment on formal verification methods.",
  
  "key_strengths": [
    "Strong coverage of object-oriented design patterns with comparable project work",
    "Both courses require implementation of complex data structures (trees, graphs)",
    "Assessment includes similar practical programming components",
    "Credit hours and workload expectations are equivalent"
  ],
  
  "key_gaps": [
    "Missing: Formal algorithm verification and correctness proofs (Critical - TUM LO #4)",
    "Depth gap: Complexity analysis covered at introductory level vs. TUM's intermediate requirement",
    "No coverage of concurrent programming fundamentals"
  ],
  
  "flags": [
    {{
      "flag_type": "missing_critical_outcome",
      "severity": "high",
      "message": "Critical TUM learning outcome not covered",
      "details": "TUM LO #4 (formal verification) is a mandatory outcome with no external coverage",
      "remediation": "Recommend supplementary oral exam on algorithm correctness proofs"
    }},
    {{
      "flag_type": "depth_mismatch",
      "severity": "medium", 
      "message": "Cognitive depth gap in algorithm analysis",
      "details": "External course focuses on APPLY level; TUM requires ANALYZE level",
      "remediation": "Consider if practical experience compensates"
    }}
  ],
  
  "confidence": {{
    "overall_confidence": 0.82,
    "input_quality": "good" | "adequate" | "limited",
    "input_quality_details": "External course description provides clear learning outcomes but limited assessment details",
    "uncertainty_areas": ["External assessment methods not fully specified", "Practical project scope unclear"],
    "llm_reasoning_notes": "Analysis based on explicit learning outcome statements; some inference required for depth assessment"
  }},
  
  "detailed_reasoning": "**For Academic Review**:\\n\\nThis equivalence assessment is based on systematic comparison of stated learning outcomes and course content. The external course from [University] demonstrates strong pedagogical alignment in core areas...\\n\\n**Outcome Mapping Analysis**: Of the 4 TUM learning outcomes, 3 show direct correspondence with external outcomes at HIGH match level...\\n\\n**Cognitive Level Assessment**: Using Bloom's taxonomy as a framework, the external course primarily operates at the APPLICATION level, while TUM expectations include ANALYSIS level competencies...\\n\\n**Recommendation Rationale**: Partial recognition is appropriate because...",
  
  "ambiguity_notes": [
    "Term 'advanced algorithms' in external LO #3 is subjective - interpreted as intermediate level",
    "TUM module mentions 'practical component' without specifying weight - assumed 40% based on ECTS breakdown"
  ],
  
  "recognition_suggestions": [
    "Recommend PARTIAL recognition (6 of 8 ECTS)",
    "Required: Supplementary written exam on formal verification methods (covers TUM LO #4)",
    "Alternative: Full recognition if student can demonstrate algorithm analysis competency through portfolio",
    "Consider: If student has additional coursework in theoretical CS, full recognition may be appropriate"
  ]
}}
"""

# ============================================
# Explanation Generation
# ============================================

GENERATE_EXPLANATION_PROMPT = """You are writing a clear, professional summary for TUM staff reviewing a credit recognition application. Your explanation will help them understand the analysis results quickly.

**Analysis Summary**:
- Overall Equivalence Score: {score}%
- TUM Module: {tum_module_title}
- External Course(s): {source_courses}
- Learning Outcomes Covered: {covered_count} of {total_tum_outcomes}
- Key Gaps Identified: {key_gaps}

**Write a 3-4 sentence explanation that**:

1. **States the verdict clearly**: Start with whether this is recommended for full recognition, partial recognition, or rejection.

2. **Highlights the main evidence**: What specific factors led to this score? Mention the most important strength or gap.

3. **Provides actionable guidance**: What should the reviewer do next? Are there conditions for approval?

**Tone Guidelines**:
- Professional and objective
- Clear and jargon-free
- Direct and actionable
- Avoid hedging language ("might", "could", "somewhat")

**Example Good Explanation**:
"This application achieves 78% equivalence and is recommended for partial recognition. The external course strongly covers 3 of 4 required learning outcomes, including practical programming skills comparable to TUM's requirements. However, formal algorithm verification (TUM LO #4) is not addressed. Recommend approval with a supplementary oral exam on algorithmic correctness proofs."
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
