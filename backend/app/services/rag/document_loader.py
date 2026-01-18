"""Document loader for PDF and RTF files with chunking."""

import logging
import re
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_SOURCES_PATH = Path(__file__).resolve().parents[3] / "data" / "rag_sources"
CHUNK_SIZE = 2000
CHUNK_OVERLAP = 200


@dataclass
class DocumentChunk:
    text: str
    document_name: str
    page_number: int | None
    chunk_index: int

    @property
    def id(self) -> str:
        page = f"_p{self.page_number}" if self.page_number else ""
        return f"{self.document_name}{page}_c{self.chunk_index}"


def load_all_documents(sources_path: Path | None = None) -> list[DocumentChunk]:
    """Load and chunk all PDF/RTF files from sources directory.

    Logs warnings for any files that fail to load but continues with others.
    """
    path = sources_path or DEFAULT_SOURCES_PATH
    if not path.exists():
        logger.warning("Sources path does not exist: %s", path)
        return []

    files = list(path.iterdir())
    chunks: list[DocumentChunk] = []
    failed_files: list[str] = []
    loaded_count = 0

    for file in files:
        suffix = file.suffix.lower()
        file_chunks: list[DocumentChunk] = []

        if suffix == ".pdf":
            file_chunks = _load_pdf(file)
        elif suffix == ".rtf":
            file_chunks = _load_rtf(file)
        else:
            continue  # Skip unsupported files

        if file_chunks:
            chunks.extend(file_chunks)
            loaded_count += 1
        else:
            failed_files.append(file.name)

    if failed_files:
        logger.warning(
            "Failed to load %d document(s): %s",
            len(failed_files),
            ", ".join(failed_files),
        )

    logger.info("Loaded %d chunks from %d/%d files", len(chunks), loaded_count, len(files))
    return chunks


def _load_pdf(file_path: Path) -> list[DocumentChunk]:
    try:
        from pypdf import PdfReader
    except ImportError as e:
        logger.error("pypdf not installed: %s", e)
        return []

    try:
        reader = PdfReader(file_path)
        chunks: list[DocumentChunk] = []
        for page_num, page in enumerate(reader.pages, 1):
            if text := (page.extract_text() or "").strip():
                chunks.extend(_chunk_text(text, file_path.name, page_num))
        return chunks
    except Exception as e:
        logger.error("Failed to load PDF %s: %s", file_path.name, e)
        return []


def _load_rtf(file_path: Path) -> list[DocumentChunk]:
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        # Strip RTF control codes
        text = re.sub(r"\\[a-z]+\d*\s?", " ", content)
        text = re.sub(r"[{}]", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return _chunk_text(text, file_path.name, None) if text else []
    except Exception as e:
        logger.error("Failed to load RTF %s: %s", file_path.name, e)
        return []


def _chunk_text(text: str, doc_name: str, page: int | None) -> list[DocumentChunk]:
    """Split text into overlapping chunks at sentence boundaries."""
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= CHUNK_SIZE:
        return [DocumentChunk(text, doc_name, page, 0)]

    chunks: list[DocumentChunk] = []
    sentences = re.split(r"(?<=[.!?])\s+", text)
    current = ""
    chunk_index = 0

    for sentence in sentences:
        would_fit = len(current) + len(sentence) + 1 <= CHUNK_SIZE

        if would_fit:
            current = f"{current} {sentence}".strip()
            continue

        if current:
            chunks.append(DocumentChunk(current, doc_name, page, chunk_index))
            chunk_index += 1
            overlap = current[-CHUNK_OVERLAP:] if len(current) >= CHUNK_OVERLAP else current
            current = f"{overlap} {sentence}".strip()
        else:
            # Sentence alone exceeds chunk size - include it anyway
            current = sentence

    if current.strip():
        chunks.append(DocumentChunk(current.strip(), doc_name, page, chunk_index))

    return chunks
