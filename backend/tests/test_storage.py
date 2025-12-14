"""Tests for file storage and document repository."""

import json
from pathlib import Path

import pytest
from sqlalchemy.orm import Session

from app.services.storage.data_cache import load_tum_modules_from_cache
from app.services.storage.file_storage import FileStorage
from app.services.storage.repository import DocumentRepository, TUMCoursesRepository


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


def test_load_tum_modules_from_cache(db_session: Session, tmp_path: Path):
    cache = tmp_path / "modules.json"
    sample_modules = [
        {
            "module_id": 3549561,
            "module_code": "CIT1130005",
            "module_title": "Lineare Algebra 2 ",
            "module_title_en": "Linear Algebra 2",
            "module_credits": "6",
            "description_id": 13759,
            "description_version": "2023w",
            "module_content": "- Eigenwerte (charakteristisches Polynom, Spur, Diagonalisierbarkeit)\n<br>- Euklidische und unitäre Vektorräume (Skalarprodukt, orthogonale Basen, symmetrische und Hermitesche Matrizen, Hauptachsentransformation)\n<br>- Analytische Geometrie (Transformationen, Rotationen, Spiegelungen, Orthogonalprojektionen, affine Teilräume)\n<br>- Symmetrische Bilinearformen (definit, semidefinit, indefinit, Trägheitssatz)\n<br>- Matrizengruppen (GL, SL, O, SO, U, SU)\n<br>- Normalformen (Ähnlichkeit, Jordansche Normalform (Beweis *nicht* verpflichtend), Singulärwertzerlegung)\n<br>",
            "module_content_en": "- Eigenwerte (charakteristisches Polynom, Spur, Diagonalisierbarkeit)\n<br>- Euklidische und unitäre Vektorräume (Skalarprodukt, orthogonale Basen, symmetrische und Hermitesche Matrizen, Hauptachsentransformation)\n<br>- Analytische Geometrie (Transformationen, Rotationen, Spiegelungen, Orthogonalprojektionen, affine Teilräume)\n<br>- Symmetrische Bilinearformen (definit, semidefinit, indefinit, Trägheitssatz)\n<br>- Matrizengruppen (GL, SL, O, SO, U, SU)\n<br>- Normalformen (Ähnlichkeit, Jordansche Normalform (Beweis *nicht* verpflichtend), Singulärwertzerlegung)\n<br>",
            "module_outcome": "Nach dem erfolgreichen Abschluss des Moduls sind die Studierenden in der Lage, fortgeschrittene mathematische Begriffe und Strukturen der Linearen Algebra zu verwenden und haben erweiterte Rechenfertigkeiten zum Umgang mit diesen entwickelt. Sie haben nun einen kompletten Überblick über die grundlegenden Konzepte, Aussagen und Methoden der linearen Algebra. Ihre Fähigkeit, zu abstrahieren und exakt zu argumentieren sowie die Verbindung von Strukturen und Anschauungen herzustellen, wurde weiter geschärft.\n<br>Die Studierenden erkennen, wann Methoden der Linearen Algebra angewandt werden können. Ferner sind die Studierenden in der Lage, Konzepte der Linearen Algebra zur Modellierung geeigneter Praxisprobleme einzusetzen.",
            "module_outcome_en": "Nach dem erfolgreichen Abschluss des Moduls sind die Studierenden in der Lage, fortgeschrittene mathematische Begriffe und Strukturen der Linearen Algebra zu verwenden und haben erweiterte Rechenfertigkeiten zum Umgang mit diesen entwickelt. Sie haben nun einen kompletten Überblick über die grundlegenden Konzepte, Aussagen und Methoden der linearen Algebra. Ihre Fähigkeit, zu abstrahieren und exakt zu argumentieren sowie die Verbindung von Strukturen und Anschauungen herzustellen, wurde weiter geschärft.\n<br>Die Studierenden erkennen, wann Methoden der Linearen Algebra angewandt werden können. Ferner sind die Studierenden in der Lage, Konzepte der Linearen Algebra zur Modellierung geeigneter Praxisprobleme einzusetzen."
        }
    ]
    cache.write_text(json.dumps(sample_modules), encoding="utf-8")

    inserted = load_tum_modules_from_cache(db_session, cache_path=cache)
    assert inserted == 1

    repo = TUMCoursesRepository(db_session)
    courses = repo.list_all()
    assert len(courses) == 1
    course = repo.get_by_code("CIT1130005")
    assert course is not None
    assert course.module_title == "Lineare Algebra 2 "
    assert course.module_credits == 6
