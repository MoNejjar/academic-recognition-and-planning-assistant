"""PDF Extraction Service - extracts course recognition tables from PDFs."""

from app.services.pdf_extraction.extractor import PDFTableExtractor
from app.services.pdf_extraction.prompts import get_extraction_prompt

__all__ = ["PDFTableExtractor", "get_extraction_prompt"]
