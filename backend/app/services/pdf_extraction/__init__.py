"""PDF Extraction Service - extracts data from PDFs using vision-capable LLMs (requires chat_with_vision)."""

from app.services.pdf_extraction.mapping_table_extractor import MappingTableExtractor
from app.services.pdf_extraction.course_content_extractor import CourseContentExtractor
from app.services.pdf_extraction.prompts import get_mapping_table_prompt, get_course_content_prompt

__all__ = [
    "MappingTableExtractor",
    "CourseContentExtractor",
    "get_mapping_table_prompt",
    "get_course_content_prompt",
]

