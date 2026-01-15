from fastapi import APIRouter, UploadFile, File
from typing import List

router = APIRouter()

@router.post("/courses/parse")
async def parse_courses(file: UploadFile = File(...)):
    # MOCK LLM
    return [
        {
            "id": "1",
            "title": "Algorithms",
            "sourceUniversity": "Home University",
            "parsedLLM": {
                "ects": 6,
                "language": "EN"
            },
            "catalogues": []
        }
    ]


@router.post("/courses/parse-catalogue")
async def parse_catalogue(files: List[UploadFile] = File(...)):
    results = []

    for f in files:
        results.append({
            "summary": f"Parsed catalogue from {f.filename}",
            "ects": 6,
            "topics": ["Graphs", "Complexity"]
        })

    return results
