# PDF Table Extraction Service

Extracts course recognition tables from PDF documents using vision-capable LLMs.

## How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Upload PDF  │ ──► │  Page → Image │ ──► │  LLM Vision  │ ──► │  JSON Result │
│              │     │  + Raw Text   │     │  Analysis    │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Step-by-Step Process

1. **PDF Upload**: User uploads a PDF via `/api/course-matching/upload-and-extract`

2. **Page Processing**: Each page is processed:
   - Converted to PNG image (300 DPI)
   - Raw text extracted via pdfplumber (catches hidden/masked text)

3. **LLM Vision Analysis**: For each page:
   - Image + raw text sent to vision-capable LLM (GPT-4o, Gemini, etc.)
   - LLM identifies table structure and extracts data

4. **Early Termination**: Stops processing when:
   - Tables found on page N
   - No tables on page N+1
   - Assumes tables are contiguous in document

5. **JSON Output**: Returns structured data with 7 columns per row

## Output Format

Each extracted row contains:

| Field | Description |
|-------|-------------|
| `source_course_no` | Course number from source university |
| `source_course_name` | Course name from source university |
| `source_credits` | Credit points from source |
| `source_grade` | Original grade |
| `tum_module_nr` | TUM module number |
| `tum_module_title` | TUM module title |
| `tum_ects` | TUM ECTS credits |

## API Endpoint

```
POST /api/course-matching/upload-and-extract
Content-Type: multipart/form-data

file: <pdf_file>
```

**Response:**
```json
{
  "filename": "transcript.pdf",
  "total_pages": 5,
  "rows": [
    {
      "source_course_no": "CSE1300",
      "source_course_name": "Reasoning and Logic",
      "source_credits": "5",
      "source_grade": "9.5",
      "tum_module_nr": "INHN0004",
      "tum_module_title": "Discrete Structures",
      "tum_ects": "8",
      "page_number": 1
    }
  ],
  "extracted_at": "2026-01-01T15:00:00Z"
}
```

## Configuration

Set in `.env`:

```env
LLM_PROVIDER=openai
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4o  # Must be vision-capable!
```

### Vision-Capable Models

| Provider | Supported Models |
|----------|-----------------|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo |
| Gemini | gemini-2.5-flash, gemini-2.5-pro |
| Ollama | llava, bakllava, llava-llama3 |

## Files

| File | Purpose |
|------|---------|
| `extractor.py` | Main `PDFTableExtractor` class |
| `prompts.py` | LLM prompt template |
| `__init__.py` | Package exports |
