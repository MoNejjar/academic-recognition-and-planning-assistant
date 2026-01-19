"""
Prompt templates for PDF extraction.

Contains prompts for:
- Table extraction (course recognition tables) - TUM module-centric
- Course content extraction (descriptions, outcomes, objectives)
"""


def get_mapping_table_prompt(raw_text: str) -> str:
    """
    Generate the extraction prompt with embedded raw text data.
    
    Returns TUM module-centric structure: each TUM module with its source courses.
    
    Args:
        raw_text: Raw text extracted from the PDF page via pdfplumber
        
    Returns:
        Formatted prompt string for the LLM
    """
    return f"""Extract the course recognition table from this PDF page.

You have TWO sources of data:
1. The IMAGE of the PDF page (visual)
2. The RAW TEXT extracted from the PDF (may contain hidden/masked text not visible in image)

RAW PDF TEXT DATA:
---
{raw_text}
---

TASK: Extract mappings as TUM MODULE-CENTRIC structure.
Group all source courses by their TUM module number.

OUTPUT FORMAT - JSON array of TUM modules, each with source courses:
[
  {{
    "tum_module_nr": "INHN0001",
    "tum_module_title": "Introduction to Informatics",
    "tum_ects": "6",
    "source_courses": [
      {{ "source_course_no": "BIE-PA1", "source_course_name": "Programming 1", "source_credits": "7", "source_grade": "1.5" }},
      {{ "source_course_no": "BIE-PA2", "source_course_name": "Programming 2", "source_credits": "7", "source_grade": "1" }}
    ]
  }},
  {{
    "tum_module_nr": "INHN0011",
    "tum_module_title": "Fundamentals of Databases",
    "tum_ects": "6",
    "source_courses": [
      {{ "source_course_no": "BIE-DBS", "source_course_name": "Database Systems", "source_credits": "5", "source_grade": "1" }}
    ]
  }}
]

CRITICAL RULES:
1. GROUP by TUM module number - same TUM module = same object, even if appears multiple times
2. TUM modules with SAME MODULE NUMBER are the SAME module (ignore minor title typos)
3. Each source course appears ONCE under its TUM module
4. Multiple source courses can map to ONE TUM module (put all in source_courses array)
5. Use RAW TEXT for complete text that may be cut off in image
6. Extract ALL mappings from the table

If no table found: []
ONLY return JSON array, no markdown, no explanations."""


def get_course_content_prompt(raw_text: str) -> str:
    """
    Generate prompt for extracting course content from PDF.
    
    Extracts: module_number, module_name, module_content (all text about course)
    Handles both single-course syllabi and multi-course catalogs.
    
    Args:
        raw_text: Raw text extracted from the PDF page via pdfplumber
        
    Returns:
        Formatted prompt string for the LLM
    """
    return f"""Extract ALL courses from this PDF page.

You have TWO sources of data:
1. The IMAGE of the PDF page (visual layout)
2. The RAW TEXT extracted from the PDF below

RAW PDF TEXT DATA:
---
{raw_text}
---

For EACH course found, extract these 3 fields:
1. module_number: The course code/number (e.g., "CSE1300", "IN2000", "MATH101")
2. module_name: The course title/name
3. module_content: ALL text about the course - combine description, learning outcomes, objectives, prerequisites, topics, etc. into one text block

IMPORTANT:
- Extract ALL courses found on this page
- For module_content, include EVERYTHING about the course (don't split into separate fields)
- Use raw text to get complete text that may be cut off in image
- Return as JSON array of objects

Example output:
[
  {{
    "module_number": "CSE1300",
    "module_name": "Reasoning and Logic",
    "module_content": "This course covers propositional and predicate logic, proof techniques, and mathematical reasoning. Learning outcomes: Students will be able to construct formal proofs, analyze logical arguments, and apply logic to computer science problems. Prerequisites: None."
  }},
  {{
    "module_number": "CSE1400",
    "module_name": "Computer Organisation",
    "module_content": "Introduction to computer architecture and organization. Topics include CPU design, memory hierarchy, I/O systems. Learning outcomes: Understand how computers execute programs at hardware level."
  }}
]

If no courses found: []
ONLY return JSON array, no markdown, no explanations."""
