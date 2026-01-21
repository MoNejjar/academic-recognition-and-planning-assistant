"""
Mapping Table Extractor

Extracts course recognition tables from PDF documents using vision-capable LLMs.
Combines visual analysis with raw text extraction for maximum accuracy.

Returns TUM module-centric structure: each TUM module with its source courses.

⚠️ REQUIRES VISION-CAPABLE LLM (uses chat_with_vision)
   Supported: gpt-4o, gpt-4o-mini, gpt-4-turbo, gemini-2.5-flash, gemini-2.5-pro
"""

from __future__ import annotations

import base64
import io
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import pdfplumber

from app.models.pdf_extraction import SourceCourse, TUMModuleMapping, ExtractionResult
from app.services.pdf_extraction.prompts import get_mapping_table_prompt


class MappingTableExtractor:
    """
    Extracts course recognition tables from PDF files.
    
    Uses a vision-capable LLM to analyze PDF pages as images while also
    providing raw text data for complete accuracy.
    
    Returns TUM module-centric structure.
    """
    
    def __init__(self, llm_client: Any):
        """
        Initialize the extractor.
        
        Args:
            llm_client: An LLM client with chat_with_vision() method.
                        Must use vision-capable model (gpt-4o, gemini-2.5-flash, etc.)
        """
        self.llm_client = llm_client
    
    async def extract_from_file(self, pdf_path: str | Path) -> ExtractionResult:
        """
        Extract course recognition tables from a PDF file.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            ExtractionResult with TUM modules and their source courses
        """
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        all_modules: Dict[str, TUMModuleMapping] = {}
        
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                try:
                    page_modules = await self._extract_from_page(page, page_num)
                    self._merge_modules(all_modules, page_modules)
                except Exception as e:
                    print(f"Error extracting from page {page_num}: {e}")
        
        return ExtractionResult(
            filename=pdf_path.name,
            total_pages=len(pdf.pages) if hasattr(pdf, 'pages') else 0,
            tum_modules=list(all_modules.values())
        )
    
    async def extract_from_bytes(self, pdf_bytes: bytes, filename: str = "document.pdf") -> ExtractionResult:
        """
        Extract course recognition tables from PDF bytes.
        
        Stops extraction when a page following a table-containing page has no tables.
        
        Args:
            pdf_bytes: PDF file content as bytes
            filename: Original filename for reference
            
        Returns:
            ExtractionResult with TUM modules and their source courses
        """
        all_modules: Dict[str, TUMModuleMapping] = {}
        total_pages = 0
        found_table = False
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            total_pages = len(pdf.pages)
            for page_num, page in enumerate(pdf.pages, start=1):
                try:
                    page_modules = await self._extract_from_page(page, page_num)
                    
                    if page_modules:
                        self._merge_modules(all_modules, page_modules)
                        found_table = True
                    elif found_table:
                        # Stop processing - tables section has ended
                        break
                        
                except Exception as e:
                    print(f"Error extracting from page {page_num}: {e}")
                    if found_table:
                        break
        
        return ExtractionResult(
            filename=filename,
            total_pages=total_pages,
            tum_modules=list(all_modules.values())
        )
    
    def _merge_modules(self, all_modules: Dict[str, TUMModuleMapping], new_modules: List[TUMModuleMapping]):
        """Merge new modules into existing, grouping by TUM module number."""
        for module in new_modules:
            key = module.tum_module_nr.strip().upper()
            if key in all_modules:
                # Add source courses to existing module
                existing_sources = {
                    (s.source_course_no, s.source_course_name) 
                    for s in all_modules[key].source_courses
                }
                for sc in module.source_courses:
                    if (sc.source_course_no, sc.source_course_name) not in existing_sources:
                        all_modules[key].source_courses.append(sc)
            else:
                all_modules[key] = module
    
    async def _extract_from_page(self, page: Any, page_num: int) -> List[TUMModuleMapping]:
        """
        Extract tables from a single PDF page.
        
        Args:
            page: pdfplumber page object
            page_num: Page number for reference
            
        Returns:
            List of TUM module mappings
        """
        # Convert page to image
        image_bytes = self._page_to_image(page)
        image_b64 = base64.b64encode(image_bytes).decode()
        
        # Extract raw text
        raw_text = self._extract_raw_text(page)
        
        # Generate prompt
        prompt = get_mapping_table_prompt(raw_text)
        
        # Call LLM with vision
        response = await self._call_llm_with_vision(prompt, image_b64)
        
        # Parse response
        modules = self._parse_response(response)
        
        return modules
    
    def _page_to_image(self, page: Any, resolution: int = 300) -> bytes:
        """Convert PDF page to PNG image bytes."""
        img = page.to_image(resolution=resolution)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        return buf.getvalue()
    
    def _extract_raw_text(self, page: Any) -> str:
        """
        Extract all text from PDF page including potentially masked text.
        """
        text_parts = []
        
        # Get raw text
        text = page.extract_text() or ""
        if text:
            text_parts.append(text)
        
        # Also get text from tables
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
        """
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
    
    def _parse_response(self, response: Optional[str]) -> List[TUMModuleMapping]:
        """
        Parse LLM response to extract TUM module mappings.
        
        Args:
            response: Raw LLM response (JSON array of TUM modules)
            
        Returns:
            List of TUMModuleMapping objects
        """
        if not response:
            return []
        
        response = response.strip()
        
        # Remove markdown code blocks if present
        if response.startswith('```'):
            response = re.sub(r'^```\w*\n?', '', response)
            response = re.sub(r'\n?```$', '', response)
        
        modules: List[TUMModuleMapping] = []
        
        try:
            data = json.loads(response)
            if isinstance(data, list):
                for item in data:
                    module = self._convert_to_module(item)
                    if module:
                        modules.append(module)
        except json.JSONDecodeError:
            # Try to find JSON array in response
            match = re.search(r'\[[\s\S]*\]', response)
            if match:
                try:
                    data = json.loads(match.group())
                    if isinstance(data, list):
                        for item in data:
                            module = self._convert_to_module(item)
                            if module:
                                modules.append(module)
                except json.JSONDecodeError:
                    pass
        
        return modules
    
    def _convert_to_module(self, item: Any) -> Optional[TUMModuleMapping]:
        """
        Convert a parsed JSON item to a TUMModuleMapping.
        
        Args:
            item: Parsed JSON object with TUM module and source courses
            
        Returns:
            TUMModuleMapping or None if invalid
        """
        if not isinstance(item, dict):
            return None
        
        # Extract TUM module info
        tum_nr = str(item.get('tum_module_nr', '')).strip()
        tum_title = str(item.get('tum_module_title', '')).strip()
        tum_ects = str(item.get('tum_ects', '')).strip()
        
        if not tum_nr:
            return None
        
        # Extract source courses
        source_courses: List[SourceCourse] = []
        raw_sources = item.get('source_courses', [])
        
        if isinstance(raw_sources, list):
            for sc in raw_sources:
                if isinstance(sc, dict):
                    source_courses.append(SourceCourse(
                        source_course_no=str(sc.get('source_course_no', '')).strip(),
                        source_course_name=str(sc.get('source_course_name', '')).strip(),
                        source_credits=str(sc.get('source_credits', '')).strip(),
                        source_grade=str(sc.get('source_grade', '')).strip()
                    ))
        
        return TUMModuleMapping(
            tum_module_nr=tum_nr,
            tum_module_title=tum_title,
            tum_ects=tum_ects,
            source_courses=source_courses,
            catalogue_content=""
        )
