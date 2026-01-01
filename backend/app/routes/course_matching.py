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
from app.services.storage.repository import DocumentRepository
from app.services.storage.file_storage import FileStorage
from app.services.pdf_extraction.mapping_table_extractor import MappingTableExtractor
from app.services.pdf_extraction.course_content_extractor import CourseContentExtractor
from app.services.llm_service.client import OpenAIClient

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
# │ OpenRouter  │ Use underlying provider's vision model                       │
# │ Ollama      │ llava, bakllava, llava-llama3 (local)                        │
# └─────────────┴──────────────────────────────────────────────────────────────┘

def get_llm_client() -> OpenAIClient:
    """Get configured LLM client for PDF extraction."""
    if not settings.LLM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="LLM_API_KEY not configured"
        )
    
    return OpenAIClient(
        api_key=settings.LLM_API_KEY,
        model=settings.LLM_MODEL if "gpt-4o" in settings.LLM_MODEL or "gpt-4-turbo" in settings.LLM_MODEL else "gpt-4o"
    )


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
        llm_client = get_llm_client()
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
        llm_client = get_llm_client()
        extractor = CourseContentExtractor(llm_client)
        result = await extractor.extract_from_bytes(pdf_bytes=content, filename=file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


# TODO: Implement POST /match - Submit course matching request
# TODO: Implement GET /match/{id} - Get match results
# TODO: Implement POST /credits - Calculate credit transfer

