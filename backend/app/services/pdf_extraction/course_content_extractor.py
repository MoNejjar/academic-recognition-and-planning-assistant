"""
Course Content Extractor

Extracts course information (module_number, module_name, module_content)
from external university PDFs for AI matching with TUM modules.

⚠️ REQUIRES VISION-CAPABLE LLM (uses chat_with_vision)
   Supported: gpt-4o, gpt-4o-mini, gpt-4-turbo, gemini-2.5-flash, gemini-2.5-pro
"""

from __future__ import annotations

import base64
import io
import json
import re
from typing import Any, Dict, List, Optional

import pdfplumber

from app.models.course_info import CourseInfo, CourseContentResult
from app.services.pdf_extraction.prompts import get_course_content_prompt


class CourseContentExtractor:
    """
    Extracts course content from PDF files.
    
    Handles both:
    - Single-course PDFs (syllabi)
    - Multi-course PDFs (catalogs)
    
    The LLM automatically detects how many courses are on each page.
    """
    
    def __init__(self, llm_client: Any):
        """
        Initialize the extractor.
        
        Args:
            llm_client: An LLM client with chat_with_vision() method.
                        Must use vision-capable model (gpt-4o, gemini-2.5-flash, etc.)
        """
        self.llm_client = llm_client
    
    async def extract_from_bytes(self, pdf_bytes: bytes, filename: str = "document.pdf") -> CourseContentResult:
        """
        Extract course content from PDF bytes.
        
        Args:
            pdf_bytes: PDF file content as bytes
            filename: Original filename for reference
            
        Returns:
            CourseContentResult with all extracted courses
        """
        all_courses: List[CourseInfo] = []
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                try:
                    courses = await self._extract_from_page(page, page_num)
                    all_courses.extend(courses)
                except Exception as e:
                    print(f"Error extracting from page {page_num}: {e}")
        
        return CourseContentResult(
            filename=filename,
            courses=all_courses
        )
    
    async def _extract_from_page(self, page: Any, page_num: int) -> List[CourseInfo]:
        """Extract courses from a single PDF page."""
        # Convert page to image
        image_bytes = self._page_to_image(page)
        image_b64 = base64.b64encode(image_bytes).decode()
        
        # Extract raw text
        raw_text = self._extract_raw_text(page)
        
        # Generate prompt
        prompt = get_course_content_prompt(raw_text)
        
        # Call LLM with vision
        response = await self._call_llm_with_vision(prompt, image_b64)
        
        # Parse response
        courses = self._parse_response(response, page_num)
        
        return courses
    
    def _page_to_image(self, page: Any, resolution: int = 300) -> bytes:
        """Convert PDF page to PNG image bytes."""
        img = page.to_image(resolution=resolution)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        return buf.getvalue()
    
    def _extract_raw_text(self, page: Any) -> str:
        """Extract all text from PDF page."""
        text_parts = []
        
        # Get raw text
        text = page.extract_text() or ""
        if text:
            text_parts.append(text)
        
        # Extract individual characters for masked text
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
        """Call the LLM with vision capabilities."""
        if hasattr(self.llm_client, 'chat_with_vision'):
            response = await self.llm_client.chat_with_vision(
                prompt=prompt,
                image_base64=image_b64,
                max_tokens=4000,
                temperature=0.1
            )
            return response.get('message') or response.get('text')
        
        # Fallback
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
    
    def _parse_response(self, response: Optional[str], page_num: int) -> List[CourseInfo]:
        """Parse LLM response to extract course info."""
        if not response:
            return []
        
        response = response.strip()
        
        # Remove markdown code blocks
        if response.startswith('```'):
            response = re.sub(r'^```\w*\n?', '', response)
            response = re.sub(r'\n?```$', '', response)
        
        courses: List[CourseInfo] = []
        
        try:
            data = json.loads(response)
            if isinstance(data, list):
                for item in data:
                    course = self._convert_to_course(item, page_num)
                    if course:
                        courses.append(course)
        except json.JSONDecodeError:
            # Try to find JSON array in response
            match = re.search(r'\[[\s\S]*\]', response)
            if match:
                try:
                    data = json.loads(match.group())
                    if isinstance(data, list):
                        for item in data:
                            course = self._convert_to_course(item, page_num)
                            if course:
                                courses.append(course)
                except json.JSONDecodeError:
                    pass
        
        return courses
    
    def _convert_to_course(self, item: Any, page_num: int) -> Optional[CourseInfo]:
        """Convert parsed JSON to CourseInfo."""
        if not isinstance(item, dict):
            return None
        
        module_number = item.get('module_number', '').strip()
        module_name = item.get('module_name', '').strip()
        module_content = item.get('module_content', '').strip()
        
        if not module_number or not module_name:
            return None
        
        return CourseInfo(
            module_number=module_number,
            module_name=module_name,
            module_content=module_content
        )
