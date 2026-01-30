# Backend Developer Guide

## Overview

FastAPI-based REST API for course recognition analysis using LLM-powered analytics. Dual workflow: student submissions with AI analysis → staff task review.

**Stack**: FastAPI 0.109+ | Python 3.11+ | SQLAlchemy 2.0+ | ChromaDB | Multi-provider LLM (OpenAI/Groq/Gemini/OpenRouter/Ollama)

### Directory Structure

**`app/`**
- **`main.py`** - FastAPI app, lifespan (init_db, load TUM cache, RAG setup)
- **`core/`** - config.py (settings), database.py (SQLAlchemy), security.py (auth)
- **`models/`** - Pydantic (API validation) + SQLAlchemy (DB) models
  - analytics.py, submission.py, task.py, chat_history.py, document.py, tum_course.py
- **`routes/`** - API endpoints (submissions, tasks, analytics, chatbot, course_matching, reporting)
- **`repositories/`** - Data access layer (CRUD operations per entity)
- **`services/`** - Business logic
  - `submission/` - orchestrate submission + analytics + tasks creation
  - `analytics/` - LLM-powered module equivalence analysis
  - `llm_service/` - multi-provider LLM client abstraction
  - `chatbot/` - streaming chat with RAG
  - `rag/` - ChromaDB vector store
  - `pdf_extraction/`, `course_recognition/`, `reporting/`, `storage/`
- **`utils/`** - llm_utils.py (factory), rate_limiter.py

**`data/`** - Runtime: chroma_db/, rag_sources/
**`data_cache/`** - tum_cit_modules.json
**`tests/`** - pytest suite

## Key Patterns

### 1. Repository Pattern
All DB access via repository classes. Example: `AnalyticsResultRepository.get_by_submission_and_module()`

### 2. Service Layer  
Business logic + transactions. Example: `SubmissionService.create_submission()` calls multiple repos + commits.

### 3. Dual Models
- **Pydantic**: API validation (use `Field(alias="camelCase")` for frontend)
- **SQLAlchemy**: DB persistence (relationships, JSON columns for complex data)

### 4. LLM Abstraction
`BaseLLMClient` → `OpenAIClient | GroqClient | GeminiClient | ...`
Factory: `get_llm_client()` (from utils/llm_utils.py)



## Core Workflows

### Student Submission → Task Creation
```
POST /api/submissions/submit (routes/submissions.py)
  ↓
AnalyticsService.analyze_submission() (services/analytics/analytics_service.py)
  → For each TUM module: build prompt → call LLM → parse JSON → calculate scores
  ↓
SubmissionService.create_submission() (services/submission/submission_service.py)
  → Create StudentSubmission + AnalyticsResult (per module) + Task (per module)
  → db.commit()
  ↓
Return: {submission_id, analytics: AnalyticsResponse}
```

### Staff Task Review
```
GET /api/tasks/tasks → TaskRepository.get_all_tasks() → Join Task→AnalyticsResult→StudentSubmission
GET /api/tasks/{id} → Fetch full analytics data
PATCH /api/tasks/{id}/status → Update task status (pending→approved/rejected)
```

### Analytics Process
**Location**: `services/analytics/analytics_service.py`
- **Input**: `AnalysisRequest` (TUM modules + source courses)
- **Process**: Format prompts (from prompts.py) → Call LLM → Parse to `ModuleAnalysisResult`
- **Output**: `AnalyticsResponse` with scores, decision hints, learning outcome matches

## Database Schema

**student_submissions**: submission_id (UUID), student_name, tum_email, personal_data (JSON), status
**analytics_results**: submission_id (FK), tum_module_nr, analysis_data (JSON), overall_score, decision_hint
**tasks**: task_id, submission_id (FK CASCADE), analytics_result_id (FK CASCADE), status, is_manual_test

**Design Notes**:
- Task is lightweight (data fetched via joins)
- Analytics stored as JSON (flexible schema)
- Cascade deletes on tasks

## API Endpoints

### Submissions
- `POST /api/submissions/submit` - Submit + analyze + create tasks
- `GET /api/submissions` - List all (query: skip, limit, status)
- `GET /api/submissions/{id}` - Get details
- `PATCH /api/submissions/{id}/status` - Update status

### Tasks
- `GET /api/tasks/tasks` - List tasks (query: skip, limit, status)
- `GET /api/tasks/{id}` - Get full analytics
- `PATCH /api/tasks/{id}/status` - Approve/reject

### Analytics
- `POST /api/analytics/analyze` - Direct analysis (bypasses submission)

### Chatbot
- `POST /api/chatbot/chat` - Streaming SSE (RAG-enabled)
- `GET /api/chatbot/history/{chat_id}` - Get history

## Configuration

**Environment Variables** (set in `.env` or docker-compose):
```bash
DATABASE_URL=sqlite:///./arip.db  # or postgresql://...
LLM_PROVIDER=openai  # openai|groq|gemini|openrouter|ollama
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o  # optional override
CHATBOT_MODEL=gpt-4o-mini  # separate model for chat
LLM_BASE_URL=http://localhost:11434  # ollama only
SECRET_KEY=change-me
```

**Startup** (`main.py` lifespan):
1. `init_db()` - create tables
2. `load_tum_modules_from_cache()` - load TUM course data
3. `initialize_vector_store_if_needed()` - setup RAG

## Development

### Setup
```bash
cd backend
pip install -e ".[dev,llm,chatbot,extraction,pdf]"
# Create .env file
uvicorn app.main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

### Testing
```bash
pytest
pytest --cov=app --cov-report=html
```

### Adding Features

**New Endpoint**:
1. Create route in `routes/new_feature.py`
2. Register in `main.py`: `app.include_router(new_feature.router, prefix="/api/...")`

**New Repository**:
```python
class NewRepo:
    def __init__(self, db: Session): self.db = db
    def create(self, entity): self.db.add(entity); self.db.flush(); return entity
```

**New Service**:
```python
class NewService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NewRepo(db)
    def do_thing(self):
        # logic
        self.db.commit()
```

**Using LLMs**:
```python
from app.utils.llm_utils import get_llm_client
client = get_llm_client()  # Uses LLM_PROVIDER from settings
response = await client.chat(messages, temperature=0.7)
```

## Key Locations for Common Tasks

| Task | Location |
|------|----------|
| Add API endpoint | `routes/` |
| Modify analytics logic | `services/analytics/analytics_service.py` |
| Change LLM prompts | `services/analytics/prompts.py` |
| Add LLM provider | `services/llm_service/client.py` |
| Modify DB queries | `repositories/` |
| Change DB schema | `models/` (add to `init_db()` in `core/database.py`) |
| Add submission validation | `models/submission.py` (Pydantic) |
| Configure settings | `core/config.py` |
| Modify RAG behavior | `services/rag/vector_store.py` |
| Change chatbot logic | `services/chatbot/engine.py` |

## Troubleshooting

- **LLM_API_KEY not set**: Add to `.env`
- **Database locked**: Use PostgreSQL or increase SQLite timeout
- **ChromaDB fails**: Check permissions on `data/chroma_db/`
- **Rate limits**: Increase `LLM_RATE_LIMIT_RPM` or use backoff (built-in)

## Best Practices

1. Use repositories for all DB access
2. Keep logic in services, not routes
3. Pydantic for API, SQLAlchemy for DB
4. Handle LLM errors gracefully (retries in client.py)
5. Commit in services, not repos
6. Test with mock LLM clients
