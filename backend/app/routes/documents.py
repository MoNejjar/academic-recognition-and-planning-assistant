"""
Document Routes

Endpoints for document retrieval and download:
- GET /documents/{document_id} - Get document metadata
- GET /documents/{document_id}/download - Download document file
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.document import DocumentRead
from app.repositories.document import DocumentRepository
from app.services.storage.file_storage import FileStorage

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize file storage
file_storage = FileStorage(upload_dir=settings.UPLOAD_DIR)


@router.get("/{document_id}", response_model=DocumentRead)
async def get_document(
    document_id: str,
    db: Session = Depends(get_db)
) -> DocumentRead:
    """
    Get document metadata by ID.
    """
    doc_repo = DocumentRepository(db)
    document = doc_repo.get(document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentRead.model_validate(document)


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Download a document file by ID.
    
    Returns the file with proper content-disposition header for download.
    """
    doc_repo = DocumentRepository(db)
    document = doc_repo.get(document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Retrieve file content
    file_content = file_storage.get_file(document.relative_path)
    
    if file_content is None:
        logger.error(f"File not found on disk: {document.relative_path}")
        raise HTTPException(status_code=404, detail="File not found on storage")
    
    # Return file with download headers
    return Response(
        content=file_content,
        media_type=document.content_type or "application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{document.original_filename}"',
            "Content-Length": str(document.size_bytes),
        }
    )
