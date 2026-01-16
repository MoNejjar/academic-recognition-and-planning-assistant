from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
import logging
import asyncio
import time
from app.core.config import settings
from app.core.database import get_db
from app.services.storage.file_storage import FileStorage
from app.services.storage.repository import DocumentRepository
from app.services.pdf_extraction.course_content_extractor import CourseContentExtractor
from app.services.llm_service.client import (
    LLMProvider, create_llm_client, BaseLLMClient
)

logger = logging.getLogger("uvicorn.error")

router = APIRouter()

# Initialize file storage
file_storage = FileStorage(upload_dir=settings.UPLOAD_DIR)


def get_llm_client() -> BaseLLMClient:
    """
    Get configured LLM client based on LLM_PROVIDER setting.
    
    Set in .env:
        LLM_PROVIDER=openai  # or gemini, openrouter, ollama
        LLM_API_KEY=your-key
        LLM_MODEL=gpt-4o
    """
    logger.info("🔧 Initializing LLM client...")
    logger.info(f"   Provider: {settings.LLM_PROVIDER}")
    logger.info(f"   Model: {settings.LLM_MODEL}")
    logger.info(f"   API Key: {'✅ Set (' + str(len(settings.LLM_API_KEY)) + ' chars)' if settings.LLM_API_KEY else '❌ NOT SET'}")
    
    # Map provider string to enum
    provider_map = {
        "openai": LLMProvider.OPENAI,
        "gemini": LLMProvider.GEMINI,
        "groq": LLMProvider.GROQ,
        "openrouter": LLMProvider.OPENROUTER,
        "ollama": LLMProvider.OLLAMA,
    }
    
    provider = provider_map.get(settings.LLM_PROVIDER.lower())
    if not provider:
        raise HTTPException(
            status_code=500,
            detail=f"Unknown LLM_PROVIDER: {settings.LLM_PROVIDER}"
        )
    
    # Ollama doesn't require API key
    if provider != LLMProvider.OLLAMA and not settings.LLM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="LLM_API_KEY not configured"
        )
    
    # Build kwargs - only pass base_url for Ollama
    kwargs = {
        "provider": provider,
        "api_key": settings.LLM_API_KEY,
        "model": settings.LLM_MODEL,
    }
    if provider == LLMProvider.OLLAMA:
        if settings.LLM_BASE_URL:
            kwargs["base_url"] = settings.LLM_BASE_URL
    else:
        kwargs["api_key"] = settings.LLM_API_KEY

    client = create_llm_client(**kwargs)
    logger.info("✅ LLM client created successfully")
    return client


@router.post("/courses/parse")
async def parse_courses(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Parse courses from uploaded PDF using LLM.
    
    Extracts course information including:
    - Course title
    - Module number
    - ECTS credits
    - Language
    - Course content/description
    """
    logger.info(f"📄 Starting parse for: {file.filename}")
    
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    content = await file.read()
    
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )
    
    # Save file
    logger.info(f"💾 Saving file: {file.filename}")
    relative_path = file_storage.save_file(
        file_content=content, 
        filename=file.filename, 
        subfolder="pdfs"
    )
    
    # Create database record
    logger.info(f"💿 Creating database record for: {file.filename}")
    doc_repo = DocumentRepository(db)
    doc_repo.create_document(
        original_filename=file.filename,
        stored_filename=relative_path.split("/")[-1],
        relative_path=relative_path,
        size_bytes=len(content),
        content_type="application/pdf"
    )
    
    try:
        # Test LLM connection first
        logger.info("🔍 Testing LLM connection...")
        llm_client = get_llm_client()
        test_start = time.time()
        try:
            # Use the correct method - check your BaseLLMClient interface
            # Common methods: chat(), complete(), or invoke()
            test_response = await asyncio.wait_for(
                llm_client.chat([{"role": "user", "content": "Say 'OK'"}]),
                timeout=15.0
            )
            test_duration = time.time() - test_start
            logger.info(f"✅ LLM test successful in {test_duration:.2f}s")
        except asyncio.TimeoutError:

            logger.error("⏱️ LLM test timed out after 15s")
            raise HTTPException(status_code=504, detail="LLM connection test timed out. Check your API key and provider status.")
        except Exception as e:
            logger.error(f"❌ LLM test failed: {str(e)}")
            logger.error(f"   Error type: {type(e).__name__}")
            if hasattr(e, 'response'):
                logger.error(f"   Response: {e.response}")
            raise HTTPException(status_code=500, detail=f"LLM test failed: {str(e)}")
        # Now extract with timeout
        logger.info("📊 Starting PDF extraction...")
        extraction_start = time.time()
        
        extractor = CourseContentExtractor(llm_client)
        result = await asyncio.wait_for(
            extractor.extract_from_bytes(pdf_bytes=content, filename=file.filename),
            timeout=120.0
        )
        
        extraction_duration = time.time() - extraction_start
        logger.info(f"✅ Extraction completed in {extraction_duration:.2f}s")
        logger.info(f"📋 Extracted courses: {len(result.courses)}")
        
        if len(result.courses) == 0:
            logger.warning(f"⚠️ No courses found in {file.filename}")
            logger.warning(f"   Result object: {result}")
            raise HTTPException(
                status_code=422, 
                detail=f"No courses detected in the file. The PDF may not contain recognizable course information."
            )
        # Transform to frontend format
        logger.info(f"🔄 Transforming {len(result.courses)} courses to frontend format")
        courses = []
        for course in result.courses:
            courses.append({
                "id": str(course.module_number or course.module_name or len(courses) + 1),
                "title": course.module_name or "Untitled",
                "sourceUniversity": "External University",
                "parsedLLM": {
                    "ects": course.ects,
                    "language": course.language,
                    "content": course.module_content,
                    "module_number": course.module_number,
                },
                "catalogues": []
            })
        
        logger.info(f"✅ Parse completed successfully for: {file.filename}")
        return courses
        
    except asyncio.TimeoutError:
        logger.error(f"⏱️ Timeout parsing {file.filename} after 120s")
        raise HTTPException(status_code=504, detail="Parsing timed out after 120s. The PDF may be too large or complex.")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Parse failed for {file.filename}")
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


@router.post("/courses/parse-catalogue")
async def parse_catalogue(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    """
    Parse multiple course catalogue PDFs using LLM.
    
    Each PDF can contain one or more courses.
    Returns extracted information for matching.
    """
    results = []

    for file in files:
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"Only PDF files are allowed: {file.filename}")
        
        content = await file.read()
        
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large: {file.filename}. Max: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
            )
        
        # Save file
        relative_path = file_storage.save_file(
            file_content=content,
            filename=file.filename,
            subfolder="catalogues"
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
        
        try:
            llm_client = get_llm_client()
            extractor = CourseContentExtractor(llm_client)
            result = await extractor.extract_from_bytes(pdf_bytes=content, filename=file.filename)
            
            # Aggregate all courses from this PDF
            topics = []
            ects_total = 0
            course_names = []
            
            for course in result.courses:
                if course.module_name:
                    course_names.append(course.module_name)
                if course.ects:
                    ects_total += course.ects
                # Extract topics from content (simple keyword extraction)
                if course.module_content:
                    # This is a simple approach - could be enhanced with better NLP
                    content_words = course.module_content.split()
                    # Take some representative words as topics (simplified)
                    topics.extend([w for w in content_words if len(w) > 5][:5])
            
            # Create summary
            summary = f"Parsed {len(result.courses)} course(s) from {file.filename}"
            if course_names:
                summary += f": {', '.join(course_names[:3])}"
                if len(course_names) > 3:
                    summary += f" and {len(course_names) - 3} more"
            
            results.append({
                "summary": summary,
                "ects": ects_total if ects_total > 0 else None,
                "topics": list(set(topics))[:10] if topics else [],
                "courses": [
                    {
                        "module_number": c.module_number,
                        "module_name": c.module_name,
                        "ects": c.ects,
                        "language": c.language,
                        "content": c.module_content
                    } for c in result.courses
                ]
            })
        except Exception as e:
            # Return error info but continue processing other files
            results.append({
                "summary": f"Failed to parse {file.filename}: {str(e)}",
                "ects": None,
                "topics": [],
                "error": str(e)
            })

    return results

