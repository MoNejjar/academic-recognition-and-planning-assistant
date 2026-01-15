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

For each row, extract these 7 values IN ORDER as a simple array:
1. Course No./Module Nr (source university)
2. Course Name/Titel (source university)  
3. Credit Points (source university)
4. Original Grade (source university)
5. Module Nr (TUM)
6. Titel (TUM)
7. ECTS (TUM)

IMPORTANT:
- Use the RAW TEXT DATA to get complete text that may be cut off in the image
- For combined courses like "CSE1500 + CSE1505", look in the raw text for FULL course codes
- The raw text may have the complete course names that appear truncated in the image
- Return as array of arrays: [["val1","val2",...],["val1","val2",...]]
- Extract ALL data rows (not headers)
- Keep combined values with + or / or , etc...

Example output:
[
  ["CSE1300", "Reasoning and Logic", "5", "9.5", "INHN0004", "Discrete Structures", "8"],
  ["CSE1500 + CSE1505", "Web and Database Technology + Information and Data Management", "5+5=10", "7.5, 9", "INHN0011", "Fundamentals of Databases", "6"]
]

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

