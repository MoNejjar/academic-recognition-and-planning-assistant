# ARIP - Academic Recognition and Planning Assistant

A web application to assist with course credit transfer evaluation at TUM (Technical University of Munich).

> TUM-ARIP is an artifact created as part of the course Foundations and Applications of Generative AI. The goal of the project is to reimagine the academic advising and curriculum alignment process using GenAI.

## 🎯 Project Overview

ARIP helps students, staff, and professors in the credit transfer process by:
- Matching external university courses to TUM modules using AI
- Generating transferability reports with match scores
- Providing a chatbot for user assistance

## 🏗️ Project Structure

```
academic-recognition-and-planning-assistant/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared UI components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── course-matching/ # Course matching UI
│   │   │   ├── reporting/      # Report display/export
│   │   │   └── chatbot/        # Chatbot widget
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service calls
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   └── constants/          # App constants
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # FastAPI + Python
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── routes/             # API endpoints
│   │   │   ├── course_matching.py
│   │   │   ├── reporting.py
│   │   │   └── chatbot.py
│   │   ├── models/             # Pydantic models
│   │   ├── core/               # Core config & utilities
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   ├── logging.py
│   │   │   └── exceptions.py
│   │   └── services/           # Business logic
│   │       ├── llm_service/    # LLM API integration
│   │       ├── course_recognition/ # Matching & assessment
│   │       ├── reporting/      # Report generation & PDF
│   │       ├── chatbot/        # Chatbot engine
│   │       └── storage/        # File & DB storage
│   ├── tests/                  # Test files
│   ├── uploads/                # Uploaded documents
│   ├── Dockerfile
│   └── pyproject.toml
│
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment variables template
├── .gitignore
├── LICENSE
└── README.md
```

## 📦 Modules & Responsibilities

### Core Modules

| Module | Description | Frontend | Backend |
|--------|-------------|----------|---------|
| **Course Matching** | Credit transfer evaluation, matching, grading | `components/course-matching/` | `services/course_recognition/` |
| **Reporting** | Match results visualization & PDF export | `components/reporting/` | `services/reporting/` |
| **LLM Services** | LLM API integration | - | `services/llm_service/` |
| **Chatbot** | User assistance chatbot | `components/chatbot/` | `services/chatbot/` |
| **Storage** | Document & data storage | - | `services/storage/` |

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

- **Student**: Submit applications, upload documents
- **Staff**: Review applications, intermediate between students and professors
- **Professor**: Make final decisions on credit transfers

## 📋 Key Features

### Minimal Requirements
- [ ] Course matching form
- [ ] One-to-one course matching
- [ ] Credit matching
- [ ] Simple grade calculation (passing/not passing)
- [ ] Match score display in UI
- [ ] PDF report generation
- [ ] Callable LLM via API
- [ ] Context-based chatbot
- [ ] Persistent database

### Extra Requirements
- [ ] Multiple-to-one course matching
- [ ] Explainable matching (why it matches/doesn't match)
- [ ] Complex grade calculation
- [ ] Credit matching in reports
- [ ] Model specification for LLM

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
