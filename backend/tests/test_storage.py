"""Tests for file storage and document repository."""

from pathlib import Path

import pytest
from sqlalchemy.orm import Session

from app.services.storage.file_storage import FileStorage
from app.services.storage.repository import DocumentRepository


def test_file_storage_roundtrip(storage: FileStorage, tmp_path: Path):
    content = b"hello world"
    relative_path = storage.save_file(content, "greeting.txt", subfolder="docs")

    stored_file = tmp_path / relative_path
    assert stored_file.exists()
    assert storage.get_file(relative_path) == content

    assert storage.delete_file(relative_path) is True
    assert storage.get_file(relative_path) is None


def test_file_storage_rejects_traversal(storage: FileStorage):
    with pytest.raises(ValueError):
        storage.save_file(b"x", "note.txt", subfolder="../../etc")


def test_document_repository_crud(db_session: Session):
    repo = DocumentRepository(db_session)
    
    # 1. Create
    doc = repo.create_document(
        original_filename="report.pdf",
        stored_filename="1234abcd.pdf",
        relative_path="reports/1234abcd.pdf",
        size_bytes=128,
        content_type="application/pdf",
    )

    # 2. Read
    fetched = repo.get(doc.id)
    assert fetched is not None
    assert fetched.relative_path == "reports/1234abcd.pdf"
    assert repo.get_by_stored_name("1234abcd.pdf").id == doc.id
    assert len(repo.list()) == 1

    # 3. Delete
    assert repo.delete(doc.id) is True
    assert repo.get(doc.id) is None
