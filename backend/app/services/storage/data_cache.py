"""Utilities for loading cached TUM module data into the database."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.services.storage.repository import TUMCoursesRepository

logger = logging.getLogger(__name__)

DEFAULT_CACHE_PATH = Path(__file__).resolve().parents[3] / "data_cache" / "tum_cit_modules.json"


def _read_cache(cache_path: Path) -> Sequence[dict]:
    if not cache_path.exists():
        logger.warning("TUM cache file not found: %s", cache_path)
        return []

    try:
        with cache_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        logger.exception("Failed to parse TUM cache JSON: %s", cache_path)
        return []


def load_tum_modules_from_cache(db: Session, cache_path: Optional[Path] = None) -> int:
    """Load cached modules into the DB, returning number of upserted records."""

    target_path = cache_path or DEFAULT_CACHE_PATH
    modules = _read_cache(target_path)
    if not modules:
        return 0

    repo = TUMCoursesRepository(db)
    return repo.upsert_courses(modules)
