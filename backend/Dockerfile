FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY pyproject.toml .

# Copy Readme
COPY README.md .

# Install Python dependencies (including chatbot with chromadb, sentence-transformers)
RUN pip install --no-cache-dir ".[extraction,llm,chatbot]"

# Pre-download and initialize ChromaDB embedding model during build
# Actually run an embedding to force full model initialization
RUN PYTHONUNBUFFERED=1 python -c "\
from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2; \
ef = ONNXMiniLM_L6_V2(); \
ef(['test']); \
print('Model downloaded and initialized successfully')"

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
