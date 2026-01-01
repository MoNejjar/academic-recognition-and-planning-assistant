# PDF Extraction Service

Extracts data from PDF documents using vision-capable LLMs.

## Two Extraction Types

### 1. Mapping Table Extraction (`/extract-mapping-table`)
Extracts course recognition tables mapping source courses to TUM modules.

### 2. Course Content Extraction (`/extract-course-content`)
Extracts course information for AI matching with TUM modules.

---

## How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Upload PDF  │ ──► │  Page → Image │ ──► │  LLM Vision  │ ──► │  JSON Result │
│              │     │  + Raw Text   │     │  Analysis    │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Multi-Course Detection

The LLM automatically detects how many courses are in the PDF:

```
Single-course PDF  →  Returns: [{ course }]
Multi-course PDF   →  Returns: [{ course1 }, { course2 }, ...]
```

---

## API Endpoints

### Mapping Table Extraction

```
POST /api/course-matching/extract-mapping-table
```

**Response:**
```json
{
  "filename": "transcript.pdf",
  "rows": [
    {
      "source_course_no": "CSE1300",
      "source_course_name": "Reasoning and Logic",
      "source_credits": "5",
      "source_grade": "9.5",
      "tum_module_nr": "INHN0004",
      "tum_module_title": "Discrete Structures",
      "tum_ects": "8"
    }
  ]
}
```

### Course Content Extraction

```
POST /api/course-matching/extract-course-content
```

**Response:**
```json
{
  "filename": "syllabus.pdf",
  "courses": [
    {
      "module_number": "CSE1300",
      "module_name": "Reasoning and Logic",
      "module_content": "This course covers propositional logic... Learning outcomes: ..."
    }
  ]
}
```

---

## Configuration

Set in `.env`:
```env
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4o  # Must be vision-capable
```

### Vision-Capable Models

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo |
| Gemini | gemini-2.5-flash, gemini-2.5-pro |
| OpenRouter | openai/gpt-4o, anthropic/claude-3-opus |
| Ollama | llava, bakllava, llava-llama3 |

---

## Files

| File | Purpose |
|------|---------|
| `mapping_table_extractor.py` | Mapping table extraction (recognition tables) |
| `course_content_extractor.py` | Course content extraction (for matching) |
| `prompts.py` | LLM prompt templates |
