"""
Prompt templates for PDF table extraction.

The extraction prompt guides the LLM to extract course recognition tables
from PDF pages using both visual (image) and textual data.
"""


def get_extraction_prompt(raw_text: str) -> str:
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
