"""
Prompt templates for PDF extraction.

Contains prompts for:
- Table extraction (course recognition tables)
- Course content extraction (descriptions, outcomes, objectives)
"""


def get_mapping_table_prompt(raw_text: str) -> str:
    """
    Generate the extraction prompt with embedded raw text data.
    
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

Look for tables mapping source university courses to TUM courses.

CRITICAL: When you find combined courses (multiple source courses → one TUM module, or one source → multiple TUM modules), 
you MUST split them into SEPARATE rows, each with the same group_id to link them together.

For each row, extract these 9 values IN ORDER as a simple array:
1. Course No./Module Nr (source university) - ONE course per row
2. Course Name/Titel (source university) - ONE course name per row
3. Credit Points (source university) - credits for THIS course only
4. Original Grade (source university) - grade for THIS course only
5. Module Nr (TUM) - ONE TUM module per row
6. Titel (TUM) - ONE TUM module name per row
7. ECTS (TUM) - ECTS for THIS TUM module only
8. Matching Type:
   - "1:1" = single source course maps to single TUM module
   - "n:1" = this is ONE OF multiple source courses mapping to the SAME TUM module
   - "1:n" = this source course maps to ONE OF multiple TUM modules
9. Group ID - a unique string to link related rows together (e.g., "group1", "group2"). 
   Use the same group_id for all rows that belong together. Use "none" for 1:1 mappings.

EXAMPLE: If PDF shows "CSE1500 + CSE1505 → INHN0011", extract as TWO separate rows:
[
  ["CSE1500", "Web and Database Technology", "5", "7.5", "INHN0011", "Fundamentals of Databases", "6", "n:1", "group1"],
  ["CSE1505", "Information and Data Management", "5", "9", "INHN0011", "Fundamentals of Databases", "6", "n:1", "group1"],
  ["CSE1300", "Reasoning and Logic", "5", "9.5", "INHN0004", "Discrete Structures", "8", "1:1", "none"]
]

IMPORTANT:
- SPLIT combined courses into separate rows, don't keep + or / in course codes
- Use the RAW TEXT DATA to get complete text that may be cut off in the image
- Each row must have ONE source course and ONE TUM module
- Related rows share the same group_id
- Return as array of arrays
- Extract ALL data rows (not headers)

If no table: []
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

