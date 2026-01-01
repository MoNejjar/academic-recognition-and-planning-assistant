"""
PDF Table Extractor

Extracts course recognition tables from PDF documents using vision-capable LLMs.
Combines visual analysis with raw text extraction for maximum accuracy.
"""

from __future__ import annotations

import base64
import io
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import pdfplumber

from app.models.pdf_extraction import CourseRecognitionRow, ExtractionResult
from app.services.pdf_extraction.prompts import get_extraction_prompt


class PDFTableExtractor:
    """
    Extracts course recognition tables from PDF files.
    
    Uses a vision-capable LLM to analyze PDF pages as images while also
    providing raw text data for complete accuracy.
    """
    
    def __init__(self, llm_client: Any):
        """
        Initialize the extractor.
        
        Args:
            llm_client: An LLM client with vision capabilities (e.g., OpenAIClient with GPT-4o)
        """
        self.llm_client = llm_client
    
    async def extract_from_file(self, pdf_path: str | Path) -> ExtractionResult:
        """
        Extract course recognition tables from a PDF file.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            ExtractionResult containing all extracted rows
        """
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        all_rows: List[CourseRecognitionRow] = []
        
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                try:
                    rows = await self._extract_from_page(page, page_num)
                    all_rows.extend(rows)
                except Exception as e:
                    # Log error but continue with other pages
                    print(f"Error extracting from page {page_num}: {e}")
        
        return ExtractionResult(
            filename=pdf_path.name,
            total_pages=len(pdf.pages) if hasattr(pdf, 'pages') else 0,
            rows=all_rows
        )
    
    async def extract_from_bytes(self, pdf_bytes: bytes, filename: str = "document.pdf") -> ExtractionResult:
        """
        Extract course recognition tables from PDF bytes.
        
        Stops extraction when a page following a table-containing page has no tables.
        This optimizes processing by assuming tables are contiguous in the document.
        
        Args:
            pdf_bytes: PDF file content as bytes
            filename: Original filename for reference
            
        Returns:
            ExtractionResult containing all extracted rows
        """
        all_rows: List[CourseRecognitionRow] = []
        total_pages = 0
        found_table = False  # Track if we've found any table
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            total_pages = len(pdf.pages)
            for page_num, page in enumerate(pdf.pages, start=1):
                try:
                    rows = await self._extract_from_page(page, page_num)
                    
                    if rows:
                        # Found table(s) on this page
                        all_rows.extend(rows)
                        found_table = True
                    elif found_table:
                        # Previously found tables, but this page has none
                        # Stop processing - tables section has ended
                        break
                    # else: Haven't found tables yet, keep looking
                    
                except Exception as e:
                    print(f"Error extracting from page {page_num}: {e}")
                    # If we already found tables and hit an error, stop
                    if found_table:
                        break
        
        return ExtractionResult(
            filename=filename,
            total_pages=total_pages,
            rows=all_rows
        )

    
    async def _extract_from_page(self, page: Any, page_num: int) -> List[CourseRecognitionRow]:
        """
        Extract tables from a single PDF page.
        
        Args:
            page: pdfplumber page object
            page_num: Page number for reference
            
        Returns:
            List of extracted course recognition rows
        """
        # Convert page to image
        image_bytes = self._page_to_image(page)
        image_b64 = base64.b64encode(image_bytes).decode()
        
        # Extract raw text
        raw_text = self._extract_raw_text(page)
        
        # Generate prompt
        prompt = get_extraction_prompt(raw_text)
        
        # Call LLM with vision
        response = await self._call_llm_with_vision(prompt, image_b64)
        
        # Parse response
        rows = self._parse_response(response, page_num)
        
        return rows
    
    def _page_to_image(self, page: Any, resolution: int = 300) -> bytes:
        """Convert PDF page to PNG image bytes."""
        img = page.to_image(resolution=resolution)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        return buf.getvalue()
    
    def _extract_raw_text(self, page: Any) -> str:
        """
        Extract all text from PDF page including potentially masked text.
        
        Combines multiple extraction methods for completeness.
        """
        text_parts = []
        
        # Get raw text
        text = page.extract_text() or ""
        if text:
            text_parts.append(text)
        
        # Also get text from tables (structured differently)
        tables = page.extract_tables()
        if tables:
            for table in tables:
                for row in table:
                    if row:
                        row_text = ' | '.join(str(cell or '') for cell in row)
                        text_parts.append(row_text)
        
        # Extract individual characters to catch masked text
        chars = page.chars
        if chars:
            lines: Dict[int, List[Any]] = {}
            for c in chars:
                y = round(c['top'] / 10) * 10
                if y not in lines:
                    lines[y] = []
                lines[y].append(c)
            
            char_text = []
            for y in sorted(lines.keys()):
                line_chars = sorted(lines[y], key=lambda c: c['x0'])
                line = ''.join(c['text'] for c in line_chars)
                if line.strip():
                    char_text.append(line)
            
            if char_text:
                text_parts.append("\n[Character-level extraction:]")
                text_parts.extend(char_text)
        
        return '\n'.join(text_parts)
    
    async def _call_llm_with_vision(self, prompt: str, image_b64: str) -> Optional[str]:
        """
        Call the LLM with vision capabilities.
        
        Args:
            prompt: The extraction prompt
            image_b64: Base64-encoded PNG image
            
        Returns:
            LLM response text or None on error
        """
        # Use chat_with_vision method if available
        if hasattr(self.llm_client, 'chat_with_vision'):
            response = await self.llm_client.chat_with_vision(
                prompt=prompt,
                image_base64=image_b64,
                max_tokens=4000,
                temperature=0.1
            )
            return response.get('message') or response.get('text')
        
        # Fallback: Use chat with structured content
        messages = [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}}
            ]
        }]
        
        response = await self.llm_client.chat(
            messages=messages,
            max_tokens=4000,
            temperature=0.1
        )
        return response.get('message') or response.get('text')
    
    def _parse_response(self, response: Optional[str], page_num: int) -> List[CourseRecognitionRow]:
        """
        Parse LLM response to extract course recognition rows.
        
        Args:
            response: Raw LLM response
            page_num: Page number for reference
            
        Returns:
            List of parsed CourseRecognitionRow objects
        """
        if not response:
            return []
        
        response = response.strip()
        
        # Remove markdown code blocks if present
        if response.startswith('```'):
            response = re.sub(r'^```\w*\n?', '', response)
            response = re.sub(r'\n?```$', '', response)
        
        rows: List[CourseRecognitionRow] = []
        
        try:
            data = json.loads(response)
            if isinstance(data, list):
                for item in data:
                    row = self._convert_to_row(item, page_num)
                    if row:
                        rows.append(row)
        except json.JSONDecodeError:
            # Try to find JSON array in response
            match = re.search(r'\[[\s\S]*\]', response)
            if match:
                try:
                    data = json.loads(match.group())
                    if isinstance(data, list):
                        for item in data:
                            row = self._convert_to_row(item, page_num)
                            if row:
                                rows.append(row)
                except json.JSONDecodeError:
                    pass
        
        return rows
    
    def _convert_to_row(self, item: Any, page_num: int) -> Optional[CourseRecognitionRow]:
        """
        Convert a parsed item to a CourseRecognitionRow.
        
        Args:
            item: Parsed JSON item (list or dict)
            page_num: Page number for reference
            
        Returns:
            CourseRecognitionRow or None if invalid
        """
        values: List[str] = []
        
        if isinstance(item, list) and len(item) == 7:
            values = [str(v).replace('\n', ' ').strip() for v in item]
        elif isinstance(item, dict):
            dict_values = list(item.values())
            if len(dict_values) == 7:
                values = [str(v).replace('\n', ' ').strip() for v in dict_values]
        
        if len(values) != 7:
            return None
        
        return CourseRecognitionRow(
            source_course_no=values[0],
            source_course_name=values[1],
            source_credits=values[2],
            source_grade=values[3],
            tum_module_nr=values[4],
            tum_module_title=values[5],
            tum_ects=values[6],
            page_number=page_num
        )
