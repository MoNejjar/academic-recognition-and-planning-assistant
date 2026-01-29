# ARIP - Academic Recognition and Planning Assistant

<p align="center">
  <strong>AI-Powered Course Credit Transfer Evaluation for TUM</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-user-roles">User Roles</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-documentation">API</a>
</p>

---

## 📋 Overview

**ARIP (Academic Recognition and Planning Assistant)** is a comprehensive web application designed to streamline and automate the course credit transfer evaluation process at the Technical University of Munich (TUM). By leveraging Generative AI and Large Language Models (LLMs), ARIP transforms what was traditionally a time-consuming, manual process into an efficient, transparent, and intelligent workflow.

> 🎓 TUM-ARIP is an artifact created as part of the course **Foundations and Applications of Generative AI**. The goal of the project is to reimagine the academic advising and curriculum alignment process using GenAI.

### The Problem We Solve

When students transfer from other universities to TUM, they need to get their previously completed courses recognized for credit. This process traditionally involves:
- Manual comparison of course syllabi and learning outcomes
- Subjective decision-making with limited consistency
- Long processing times and administrative overhead
- Communication bottlenecks between students, staff, and professors

**ARIP automates and enhances this entire workflow**, providing AI-powered course matching, detailed equivalence analysis, and comprehensive reporting.

---

## ✨ Features

### 🔍 Intelligent Course Matching
- **AI-Powered Semantic Matching**: Uses LLM technology to analyze course content, learning outcomes, and syllabi to find the best matching TUM modules
- **One-to-One Matching**: Match single external courses to TUM equivalents
- **Multiple-to-One Matching**: Combine multiple external courses (e.g., "Discrete Maths 1 + 2") to match a single TUM module (e.g., "Discrete Structures")
- **Match Confidence Scores**: Transparent scoring system showing how well courses align
- **Explainable Results**: Detailed explanations of why courses match or don't match

### 📄 Smart PDF Extraction
ARIP uses vision-capable LLMs to extract structured data from uploaded documents:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Upload PDF  │ ──► │  Page → Image │ ──► │  LLM Vision  │ ──► │  JSON Result │
│              │     │  + Raw Text   │     │  Analysis    │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

- **Mapping Table Extraction**: Automatically extract course recognition tables from transcripts
- **Course Content Extraction**: Extract detailed course information from syllabi for AI matching
- **Multi-Course Detection**: Automatically detect and process multiple courses from a single PDF

### 📊 Comprehensive Analytics & Equivalence Analysis
- **Learning Outcome Mapping**: Detailed comparison of learning outcomes between source courses and TUM modules
- **Bloom's Taxonomy Analysis**: Depth comparison using cognitive levels (Remember → Create)
- **Coverage Metrics**: Quantitative assessment of content overlap
- **Confidence Indicators**: Multi-factor confidence scoring based on content, learning outcomes, and depth alignment
- **Decision Hints**: AI-generated recommendations (Approve, Review, Reject) to assist staff decision-making

### 📝 Professional Reporting
- **Automated Report Generation**: Generate comprehensive transferability reports
- **PDF Export**: Professional, printable reports for official use
- **Match Visualizations**: Clear visual representation of matching results
- **Audit Trail**: Complete history of decisions and reasoning

### 🤖 AI Chatbot Assistant (Coming Soon)
> 📌 **Note**: The AI Chatbot feature is currently in development on a separate branch and will be integrated in a future release.

The chatbot assistant is designed to **minimize communication overhead** between students and staff by providing instant answers to common questions about the credit transfer process:

- **Process Guidance**: Step-by-step instructions on how to submit applications
- **Status Updates**: Information about application status and next steps
- **FAQ Handling**: Answers to frequently asked questions about credit transfer policies
- **Document Requirements**: Guidance on what documents are needed and how to prepare them
- **Deadline Information**: Important dates and timeline expectations
- **Guardrails**: The chatbot is designed to help with process questions only—it will not provide course matching advice, ensuring all academic decisions go through proper channels

This self-service capability empowers students to find answers independently, reducing the workload on academic staff and improving response times.

### 📈 Staff Dashboard & Analytics
- **Workload Overview**: Track pending applications and processing metrics
- **Task Management**: Kanban-style board for managing recognition requests
- **Performance Analytics**: Insights into processing times and decision patterns

---

## 🔄 How It Works

### For Students

1. **Upload Documents**: Submit your transcript and course syllabi as PDFs
2. **AI Extraction**: ARIP automatically extracts course information using vision AI
3. **Automatic Matching**: The system matches your courses to potential TUM equivalents
4. **Review Results**: View match scores, explanations, and recommendations
5. **Submit Application**: Finalize and submit your credit transfer application
6. **Track Progress**: Monitor your application status through the dashboard

### For Staff

1. **Review Queue**: Access pending applications through the staff dashboard
2. **AI Analysis**: Review AI-generated matching results and equivalence analysis
3. **Decision Support**: Use confidence scores and explanations to make informed decisions
4. **Approve/Reject**: Make final decisions with documented reasoning
5. **Generate Reports**: Create official reports for approved transfers

### For Professors

1. **Expert Review**: Evaluate complex or borderline cases flagged by staff
2. **Final Authority**: Make binding decisions on credit equivalence
3. **Set Precedents**: Decisions can inform future AI matching improvements

---

## 👥 User Roles

| Role | Capabilities |
|------|--------------|
| **Student** | Submit applications, upload documents, track status, use chatbot for guidance |
| **Staff** | Review applications, use AI analysis, approve/reject straightforward cases, escalate complex cases |
| **Professor** | Make final decisions on complex cases, provide expert evaluation |

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Backend** | FastAPI, Python 3.11+, Pydantic |
| **AI/ML** | OpenAI GPT-4 / Azure OpenAI (configurable LLM provider) |
| **Database** | PostgreSQL with SQLAlchemy ORM |
| **Deployment** | Docker, Docker Compose, Nginx |

### Project Structure

```
academic-recognition-and-planning-assistant/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared UI components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── course-matching/ # Course matching UI
│   │   │   ├── reporting/      # Report display/export
│   │   │   ├── analytics/      # Analytics dashboards
│   │   │   └── chatbot/        # Chatbot widget
│   │   ├── pages/              # Page components
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── ...
│   │   ├── services/           # API service calls
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React context providers
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # FastAPI + Python
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── routes/             # API endpoints
│   │   │   ├── course_matching.py
│   │   │   ├── reporting.py
│   │   │   ├── analytics.py
│   │   │   └── chatbot.py
│   │   ├── models/             # Pydantic models
│   │   ├── core/               # Core config & utilities
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── exceptions.py
│   │   └── services/           # Business logic
│   │       ├── llm_service/    # LLM API integration
│   │       ├── course_recognition/ # Matching & assessment
│   │       ├── pdf_extraction/ # Document processing
│   │       ├── analytics/      # Equivalence analysis
│   │       ├── reporting/      # Report generation & PDF
│   │       ├── chatbot/        # Chatbot engine
│   │       └── storage/        # File & DB storage
│   ├── tests/                  # Test files
│   ├── data_cache/             # Cached TUM module data
│   ├── uploads/                # Uploaded documents
│   ├── Dockerfile
│   └── pyproject.toml
│
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment variables template
├── LICENSE
└── README.md
```

## 📦 Core Modules

| Module | Description | Frontend | Backend |
|--------|-------------|----------|---------|
| **Course Matching** | AI-powered course equivalence evaluation | `components/course-matching/` | `services/course_recognition/` |
| **PDF Extraction** | Document processing with vision LLMs | `pages/MappingUploadPage.tsx` | `services/pdf_extraction/` |
| **Analytics** | Deep equivalence analysis & metrics | `components/analytics/` | `services/analytics/` |
| **Reporting** | Report generation & PDF export | `components/reporting/` | `services/reporting/` |
| **LLM Services** | Configurable LLM provider integration | - | `services/llm_service/` |
| **Chatbot** | Student assistance chatbot | `components/chatbot/` | `services/chatbot/` |
| **Storage** | Document & data persistence | - | `services/storage/` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (for frontend development)
- **Python** 3.11+ (for backend development)
- **Docker & Docker Compose** (recommended for deployment)
- **LLM API Key** (OpenAI or Azure OpenAI)

### Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/academic-recognition-and-planning-assistant.git
cd academic-recognition-and-planning-assistant

# Copy environment file and configure
cp .env.example .env
# Edit .env with your API keys and configuration

# Start all services
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Development Setup

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend development server: `http://localhost:3000`

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Backend API: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

---

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

---

## 📡 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/course-matching/extract-mapping-table` | POST | Extract course mapping table from PDF |
| `/api/course-matching/extract-course-content` | POST | Extract course content from syllabus PDF |
| `/api/analytics/analyze` | POST | Perform deep equivalence analysis |
| `/api/reports/generate` | POST | Generate transferability report |
| `/api/reports/export-pdf` | POST | Export report as PDF |
| `/api/chatbot/message` | POST | Send message to chatbot |

### Example: Extract Course Content

```bash
curl -X POST "http://localhost:8000/api/course-matching/extract-course-content" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@syllabus.pdf"
```

**Response:**
```json
{
  "filename": "syllabus.pdf",
  "courses": [
    {
      "module_number": "CSE1300",
      "module_name": "Reasoning and Logic",
      "module_content": "This course covers propositional logic..."
    }
  ]
}
```

Full API documentation is available at `/docs` when running the backend.

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# LLM Configuration
LLM_PROVIDER=openai          # or "azure"
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4-turbo        # Model to use

# Azure OpenAI (if using Azure)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Application
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/arip

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## 🗺️ Roadmap

### ✅ Implemented Features
- [x] PDF extraction with vision LLMs
- [x] Course content and mapping table extraction
- [x] Multi-course detection from single PDF
- [x] Deep equivalence analysis with Bloom's Taxonomy
- [x] Confidence scoring and decision hints
- [x] Student and Staff dashboards
- [x] Task management (Kanban board)

### 🚧 In Development
- [ ] Context-aware chatbot (separate branch)
- [ ] One-to-one course matching
- [ ] Multiple-to-one course matching
- [ ] PDF report export
- [ ] Complex grade calculation

### 📋 Planned
- [ ] User authentication and authorization
- [ ] Email notifications
- [ ] Historical decision learning
- [ ] Bulk application processing
- [ ] Integration with TUM systems

---

## 🤝 Contributing

We welcome contributions! Please see our contribution guidelines for details on how to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

---

## 👥 Team

**Group 24** - TUM Foundations and Applications of Generative AI Course

---

<p align="center">
  <sub>Built with ❤️ at the Technical University of Munich</sub>
</p>
