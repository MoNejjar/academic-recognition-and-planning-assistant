# ARIP - Academic Recognition Intelligence Platform

A web application to assist with course credit transfer evaluation at TUM (Technical University of Munich).

> TUM-ARIP is an artifact created as part of the course Foundations and Applications of Generative AI. The goal of the project is to reimagine the academic advising and curriculum alignment process using GenAI.

## 🎯 Project Overview

ARIP helps students, staff, and professors in the credit transfer process by:
- **Students**: Submit recognition applications with course documents
- **Staff**: Review applications, communicate with professors, manage workflow
- **Professors**: Evaluate course equivalencies and make final decisions
- **AI-Powered**: Automatic course matching, learning outcome analysis, and recommendations

### Key Features
- Multi-role portal (Student, Staff, Professor)
- AI-based course equivalence analysis with detailed explanations
- Professor-Staff discussion threads on applications
- Final verdict system with decision documentation
- Kanban-style task management for staff
- PDF report generation
- Context-aware chatbot for user assistance

## 🏗️ Project Structure

```
academic-recognition-and-planning-assistant/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared UI (CommentThread, SharedComponents)
│   │   │   ├── layout/         # Staff sidebar layout
│   │   │   ├── analytics/      # ModuleCardModern, AnalyticsCommon
│   │   │   ├── chatbot/        # FloatingChat widget
│   │   │   └── ui/             # Radix UI wrappers
│   │   ├── pages/              # Page components
│   │   │   ├── LandingPage.tsx       # Role selection portal
│   │   │   ├── StudentDashboard.tsx  # Student wizard flow
│   │   │   ├── StaffDashboard.tsx    # Staff routing
│   │   │   ├── TaskDetailPageModern.tsx  # Task review with analytics
│   │   │   └── ...
│   │   ├── context/            # UserContext (role management)
│   │   ├── services/           # API service calls
│   │   ├── data/               # Task manager, mock data
│   │   ├── styles/             # TUM brand colors
│   │   └── utils/              # Utilities
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # FastAPI + Python
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── routes/             # API endpoints
│   │   │   ├── tasks.py        # Task management
│   │   │   ├── comments.py     # Discussion threads
│   │   │   ├── submissions.py  # Student submissions
│   │   │   ├── analytics.py    # AI analysis
│   │   │   ├── chatbot.py      # Chatbot API
│   │   │   └── reporting.py    # PDF reports
│   │   ├── models/             # SQLAlchemy + Pydantic models
│   │   │   ├── task.py, comment.py, submission.py
│   │   │   └── analytics.py, chatbot.py
│   │   ├── repositories/       # Database access layer
│   │   ├── core/               # Config, database, security
│   │   └── services/           # Business logic
│   │       ├── analytics/      # LLM-based analysis
│   │       ├── llm_service/    # LLM API integration
│   │       ├── chatbot/        # RAG chatbot engine
│   │       ├── pdf_extraction/ # Document parsing
│   │       ├── reporting/      # PDF generation
│   │       └── storage/        # File & cache storage
│   ├── tests/                  # Pytest test files
│   ├── data/                   # SQLite database
│   ├── uploads/                # Uploaded documents
│   ├── Dockerfile
│   └── pyproject.toml
│
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment variables template
└── README.md
```

## 📦 Modules & Responsibilities

### Core Modules

| Module | Description | Frontend | Backend |
|--------|-------------|----------|---------|
| **Task Management** | Review workflow, status updates | `pages/TasksPage`, `TaskDetailPageModern` | `routes/tasks.py`, `repositories/task.py` |
| **Analytics** | AI-powered course equivalence analysis | `components/analytics/ModuleCardModern` | `services/analytics/`, `routes/analytics.py` |
| **Comments** | Professor-Staff discussion threads | `components/common/CommentThread` | `routes/comments.py`, `models/comment.py` |
| **Submissions** | Student application handling | `pages/StudentDashboard` | `routes/submissions.py`, `services/submission/` |
| **Chatbot** | Context-aware user assistance | `components/chatbot/FloatingChat` | `services/chatbot/`, `routes/chatbot.py` |
| **Reporting** | PDF report generation | `services/reporting/` | `services/reporting/` |
| **LLM Services** | OpenAI/Ollama integration | - | `services/llm_service/` |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional)

### Development Setup

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Docker Setup

```bash
# Copy environment file and fill in values
cp .env.example .env

# Start all services
docker-compose up --build
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 👥 User Roles

| Role | Access | Capabilities |
|------|--------|--------------|
| **Student** | `/student/*` | Submit applications, upload documents, track status |
| **Staff** | `/staff/*` | Review applications, manage workflow, communicate with professors |
| **Professor** | `/staff/*` | Evaluate equivalencies, make final decisions, write verdicts |

## 📋 Key Features

### Implemented ✅
- [x] Multi-role portal with role-based navigation
- [x] Student submission wizard (4-step process)
- [x] AI-powered course equivalence analysis
- [x] Learning outcome matching with confidence scores
- [x] Assessment Quality indicators (merged confidence + input quality)
- [x] Collapsible, tooltip-enhanced UI sections
- [x] Professor-Staff discussion threads
- [x] Final verdict system with decision documentation
- [x] Task status management (pending, approved, rejected, on hold)
- [x] Kanban board view for task overview
- [x] Archive for decided applications
- [x] PDF document extraction
- [x] Comprehensive LLM prompts for detailed analysis
- [x] Context-aware RAG chatbot
- [x] Persistent SQLite database
- [x] TUM brand styling throughout

### Potential Enhancements
- [ ] Email notifications for status changes
- [ ] Batch processing for multiple applications
- [ ] Historical analytics and trends
- [ ] Integration with TUM course catalog API

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```env
LLM_API_KEY=your-api-key
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://...
```

## 📄 License

See [LICENSE](LICENSE) file.

---

**Group 24** - TUM GenAI Project
