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


@router.post("/demo", response_model=list[DocumentRead])
async def create_demo_documents(db: Session = Depends(get_db)):
    """
    Provision demo documents from the backend's demo_files directory.
    Copies the files to the upload directory and creates database records.
    """
    import shutil
    import os
    from pathlib import Path
    from uuid import uuid4

    # Define paths
    # Assuming backend/app/routes/documents.py -> backend/data/demo_files
    # We need to go up from app/routes to backend root
    
    # helper to find backend root
    current_file = Path(__file__)
    backend_root = current_file.parent.parent.parent
    demo_dir = backend_root / "data" / "demo_files"
    
    if not demo_dir.exists():
        logger.warning(f"Demo directory not found: {demo_dir}")
        return []

    doc_repo = DocumentRepository(db)
    created_docs = []
    
    # Iterate over files in demo directory
    for file_path in demo_dir.iterdir():
        if file_path.is_file():
            # Generate unique stored filename
            ext = file_path.suffix
            stored_filename = f"{uuid4()}{ext}"
            
            # Use the file storage service to save (or just copy manually since we have local paths)
            # Since FileStorage might abstract S3/Local, ideally we use it. 
            # But FileStorage.save takes a file-like object.
            
            # Let's use the file_storage instance we already have
            with open(file_path, "rb") as f:
                # We need to manually handle the saving to get the relative path and size
                # The FileStorage.save method usually handles this but takes an UploadFile.
                # Let's bypass and use internal logic or just write to upload_dir directly 
                # if we assume LocalFileStorage.
                
                # Given the FileStorage implementation isn't fully visible but likely local:
                upload_dir = Path(settings.UPLOAD_DIR)
                dest_path = upload_dir / stored_filename
                
                # Create destination directory if it doesn't exist
                os.makedirs(upload_dir, exist_ok=True)
                
                shutil.copy2(file_path, dest_path)
                
                file_size = file_path.stat().st_size
                relative_path = str(stored_filename) # In local storage, often just the filename
                
                # Create DB record
                doc = doc_repo.create_document(
                    original_filename=file_path.name,
                    stored_filename=stored_filename,
                    relative_path=relative_path,
                    size_bytes=file_size,
                    content_type="application/pdf" if ext.lower() == ".pdf" else "application/octet-stream"
                )
                created_docs.append(doc)

    return created_docs
