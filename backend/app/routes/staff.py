from fastapi import APIRouter

router = APIRouter()

staff_db = [] # exemple

@router.get("/courses")
async def get_all_courses():
    return staff_db
