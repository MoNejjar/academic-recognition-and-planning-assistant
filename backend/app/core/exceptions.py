"""
Exception Handling

Custom exceptions and error handlers
"""

from fastapi import HTTPException


class ARIPException(Exception):
    """Base exception for ARIP application"""
    pass


class CourseMatchingException(ARIPException):
    """Exception for course matching errors"""
    pass


class LLMServiceException(ARIPException):
    """Exception for LLM service errors"""
    pass


class ReportingException(ARIPException):
    """Exception for reporting errors"""
    pass


class ChatbotException(ARIPException):
    """Exception for chatbot errors"""
    pass


class StorageException(ARIPException):
    """Exception for storage errors"""
    pass


# TODO: Implement FastAPI exception handlers
