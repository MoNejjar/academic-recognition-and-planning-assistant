"""
Course Matching Routes

Handles credit transfer evaluation endpoints:
- PDF table extraction (recognition tables)
- PDF course content extraction (for AI matching)
- Course matching
- Credit matching
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.pdf_extraction import ExtractionResult
from app.models.course_info import CourseContentResult
from app.repositories.document import DocumentRepository
from app.services.storage.file_storage import FileStorage
from app.services.pdf_extraction.mapping_table_extractor import MappingTableExtractor
from app.services.pdf_extraction.course_content_extractor import CourseContentExtractor
from app.utils.llm_utils import get_llm_client

router = APIRouter()

# Initialize file storage
file_storage = FileStorage(upload_dir=settings.UPLOAD_DIR)


# Vision-capable models for PDF extraction:
# ┌─────────────┬──────────────────────────────────────────────────────────────┐
# │ Provider    │ Vision Models                                                │
# ├─────────────┼──────────────────────────────────────────────────────────────┤
# │ OpenAI      │ gpt-4o, gpt-4o-mini, gpt-4-turbo                             │
# │ Gemini      │ gemini-2.5-flash, gemini-2.5-pro, gemini-3-flash-preview     │
# │ Groq        │ ❌ No vision models available                                │
# │ OpenRouter  │ openai/gpt-4o, anthropic/claude-3-opus                       │
# │ Ollama      │ llava, bakllava, llava-llama3 (local)                        │
# └─────────────┴──────────────────────────────────────────────────────────────┘


@router.post("/extract-mapping-table", response_model=ExtractionResult)
async def extract_mapping_table(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> ExtractionResult:
    """
    Extract recognition mapping tables from a PDF.
    
    Extracts rows mapping source university courses to TUM modules.
    """
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    content = await file.read()
    
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB")
    
    # Save file
    relative_path = file_storage.save_file(file_content=content, filename=file.filename, subfolder="pdfs")
    
    # Create database record
    doc_repo = DocumentRepository(db)
    doc_repo.create_document(
        original_filename=file.filename,
        stored_filename=relative_path.split("/")[-1],
        relative_path=relative_path,
        size_bytes=len(content),
        content_type="application/pdf"
    )
    
    try:
        llm_client = get_llm_client(use_case="vision")
        extractor = MappingTableExtractor(llm_client)
        result = await extractor.extract_from_bytes(pdf_bytes=content, filename=file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@router.post("/extract-course-content", response_model=CourseContentResult)
async def extract_course_content(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> CourseContentResult:
    """
    Upload a PDF and extract course content for AI matching.
    
    Extracts from each course:
    - module_number: Course code
    - module_name: Course title
    - module_content: All text about the course (description, outcomes, etc.)
    
    Handles both single-course syllabi and multi-course catalogs.
    Returns document_id to allow frontend to associate file with submission.
    """
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    content = await file.read()
    
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB")
    
    # Save file
    relative_path = file_storage.save_file(file_content=content, filename=file.filename, subfolder="pdfs")
    
    # Create database record
    doc_repo = DocumentRepository(db)
    document = doc_repo.create_document(
        original_filename=file.filename,
        stored_filename=relative_path.split("/")[-1],
        relative_path=relative_path,
        size_bytes=len(content),
        content_type="application/pdf"
    )
    
    try:
        llm_client = get_llm_client(use_case="vision")
        extractor = CourseContentExtractor(llm_client)
        result = await extractor.extract_from_bytes(pdf_bytes=content, filename=file.filename)
        # Include document ID for tracking
        result.document_id = document.id
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

from pydantic import BaseModel
from typing import Optional
from app.repositories.tum_courses import TUMCoursesRepository

# TUM Module lookup models
class TUMModuleLookup(BaseModel):
    found: bool
    module_code: Optional[str] = None
    module_title: Optional[str] = None
    module_credits: Optional[str] = None
    module_content: Optional[str] = None
    module_outcome: Optional[str] = None
    message: Optional[str] = None


@router.get("/tum-module/{module_code}", response_model=TUMModuleLookup)
async def lookup_tum_module(
    module_code: str,
    db: Session = Depends(get_db)
) -> TUMModuleLookup:
    """
    Look up a TUM module by its code.
    
    Returns module content and learning outcomes.
    Prefers English versions if available, falls back to German.
    """
    repo = TUMCoursesRepository(db)
    course = repo.get_by_code(module_code.strip().upper())
    
    if not course:
        return TUMModuleLookup(
            found=False,
            module_code=module_code,
            message="Module not found. Check for typos or check in TUM Online."
        )
    
    # Get content - prefer English if available and different from German
    content_en = (course.module_content_en or "").strip()
    content_de = (course.module_content or "").strip()
    content = content_en if content_en and content_en != content_de else content_de
    
    # Get outcome - prefer English if available and different from German
    outcome_en = (course.module_outcome_en or "").strip()
    outcome_de = (course.module_outcome or "").strip()
    outcome = outcome_en if outcome_en and outcome_en != outcome_de else outcome_de
    
    # Get title - prefer English
    title_en = (course.module_title_en or "").strip()
    title_de = (course.module_title or "").strip()
    title = title_en if title_en else title_de
    
    return TUMModuleLookup(
        found=True,
        module_code=course.module_code,
        module_title=title,
        module_credits=str(course.module_credits) if course.module_credits else None,
        module_content=content if content else None,
        module_outcome=outcome if outcome else None,
        message=None
    )


# TODO: Implement POST /match - Submit course matching request
# TODO: Implement GET /match/{id} - Get match results
# TODO: Implement POST /credits - Calculate credit transfer

