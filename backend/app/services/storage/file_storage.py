"""File storage utilities for handling uploads on the local filesystem."""

from __future__ import annotations

from pathlib import Path
from typing import Optional
from uuid import uuid4


class FileStorage:
    """Handles file storage operations."""

    def __init__(self, upload_dir: str):
        self.upload_dir = Path(upload_dir).resolve()
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_content: bytes, filename: str, subfolder: Optional[str] = None) -> str:
        """Persist file bytes to disk and return the relative path inside ``upload_dir``."""

        target_dir = self._safe_subfolder(subfolder)
        stored_filename = f"{uuid4().hex}{Path(filename).suffix}"
        target_dir.mkdir(parents=True, exist_ok=True)

        full_path = target_dir / stored_filename
        full_path.write_bytes(file_content)

        relative_path = full_path.relative_to(self.upload_dir)
        return str(relative_path).replace("\\", "/")

    def get_file(self, file_path: str) -> Optional[bytes]:
        """Retrieve file content by relative path. Returns ``None`` when missing."""

        full_path = self._safe_path(file_path)
        if not full_path.exists() or not full_path.is_file():
            return None
        return full_path.read_bytes()

    def delete_file(self, file_path: str) -> bool:
        """Delete a stored file. Returns ``True`` when a file was removed."""

        full_path = self._safe_path(file_path)
        if full_path.exists():
            full_path.unlink()
            return True
        return False

    def _safe_subfolder(self, subfolder: Optional[str]) -> Path:
        target_dir = self.upload_dir if not subfolder else (self.upload_dir / subfolder)
        target_dir = target_dir.resolve()
        if not target_dir.is_relative_to(self.upload_dir):
            raise ValueError("Invalid subfolder path outside upload directory")
        return target_dir

    def _safe_path(self, relative_path: str) -> Path:
        target_path = (self.upload_dir / relative_path).resolve()
        if not target_path.is_relative_to(self.upload_dir):
            raise ValueError("Invalid file path outside upload directory")
        return target_path
