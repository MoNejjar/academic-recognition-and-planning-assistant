"""
Course Matching Routes

Handles credit transfer evaluation endpoints:
- PDF upload and table extraction
- One-to-one course matching
- Multiple-to-one course matching
- Credit matching
- Grade calculation
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.pdf_extraction import ExtractionResult
from app.services.storage.repository import DocumentRepository
from app.services.storage.file_storage import FileStorage
from app.services.pdf_extraction.extractor import PDFTableExtractor
from app.services.llm_service.client import OpenAIClient

router = APIRouter()

# Initialize file storage
file_storage = FileStorage(upload_dir=settings.UPLOAD_DIR)


# Vision-capable models for PDF table extraction:
# ┌─────────────┬──────────────────────────────────────────────────────────────┐
# │ Provider    │ Vision Models                                                │
# ├─────────────┼──────────────────────────────────────────────────────────────┤
# │ OpenAI      │ gpt-4o, gpt-4o-mini, gpt-4-turbo                             │
# │ Gemini      │ gemini-2.5-flash, gemini-2.5-pro, gemini-3-flash-preview     │
# │ Groq        │ ❌ No vision models available                                │
# │ OpenRouter  │ Use underlying provider's vision model                       │
# │ Ollama      │ llava, bakllava, llava-llama3 (local)                        │
# └─────────────┴──────────────────────────────────────────────────────────────┘
#
# To switch providers, change settings.LLM_PROVIDER and use the appropriate client:
#   - OpenAI:  OpenAIClient (default)
#   - Gemini:  GeminiClient (import from client.py)

def get_llm_client() -> OpenAIClient:
    """
    Get configured LLM client for PDF extraction.
    
    IMPORTANT: The model must support vision/image inputs for table extraction.
    See the table above for supported vision models per provider.
    """
    if not settings.LLM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="LLM_API_KEY not configured"
        )
    
    # Ensure we use a vision-capable model
    # Change this to GeminiClient if using Gemini API
    return OpenAIClient(
        api_key=settings.LLM_API_KEY,
        model=settings.LLM_MODEL if "gpt-4o" in settings.LLM_MODEL or "gpt-4-turbo" in settings.LLM_MODEL else "gpt-4o"
    )


@router.post("/upload-and-extract", response_model=ExtractionResult)
async def upload_and_extract_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> ExtractionResult:
    """
    Upload a PDF and extract course recognition tables.
    
    Uploads the PDF, saves it to storage, and immediately extracts
    course recognition table data using vision-capable LLM.
    
    Args:
        file: The PDF file to upload and process
        db: Database session
        
    Returns:
        ExtractionResult with extracted course rows
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    
    # Read file content
    content = await file.read()
    
    # Check file size
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )
    
    # Save file
    relative_path = file_storage.save_file(
        file_content=content,
        filename=file.filename,
        subfolder="pdfs"
    )
    
    # Create database record
    doc_repo = DocumentRepository(db)
    doc_repo.create_document(
        original_filename=file.filename,
        stored_filename=relative_path.split("/")[-1],
        relative_path=relative_path,
        size_bytes=len(content),
        content_type="application/pdf"
    )
    
    # Extract tables
    try:
        llm_client = get_llm_client()
        extractor = PDFTableExtractor(llm_client)
        
        result = await extractor.extract_from_bytes(
            pdf_bytes=content,
            filename=file.filename
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Extraction failed: {str(e)}"
        )


# TODO: Implement POST /match - Submit course matching request
# TODO: Implement GET /match/{id} - Get match results
# TODO: Implement POST /credits - Calculate credit transfer
