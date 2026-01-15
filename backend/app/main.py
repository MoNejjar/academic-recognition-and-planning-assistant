"""
ARIP - Academic Recognition and Planning Assistant
FastAPI Backend Application Entry Point
"""

from fastapi import FastAPI, UploadFile, File, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.routes.student import router as student_router
from app.routes.staff import router as staff_router
from typing import List
from pydantic import BaseModel
# TODO: Import routers
# from app.routes import course_matching, reporting, chatbot

app = FastAPI(
    title="ARIP API",
    description="Academic Recognition and Planning Assistant API",
    version="0.1.0",
    lifespan=lifespan,
)
router = APIRouter()
app.include_router(student_router, prefix="/api/student")
app.include_router(staff_router, prefix="/api/staff")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    return {"filename": file.filename}

@app.get("/")
async def root():
    return {"message": "ARIP API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Include routers
app.include_router(course_matching.router, prefix="/api/course-matching", tags=["PDF Extraction"])
app.include_router(reporting.router, prefix="/api/reports", tags=["Reporting"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])

