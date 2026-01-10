"""
ARIP - Academic Recognition and Planning Assistant
FastAPI Backend Application Entry Point
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# TODO: Import routers
# from app.routes import course_matching, reporting, chatbot

app = FastAPI(
    title="ARIP API",
    description="Academic Recognition and Planning Assistant API",
    version="0.1.0",
)

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


# TODO: Include routers
# app.include_router(course_matching.router, prefix="/api/course-matching", tags=["Course Matching"])
# app.include_router(reporting.router, prefix="/api/reports", tags=["Reporting"])
# app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
