# 🐍 AI Resume Advisor — Python FastAPI AI Microservice

A standalone Python microservice that implements the complete AI analysis pipeline using **FastAPI**, **LangChain**, **FAISS**, **Sentence Transformers**, and the **Groq API**.

---

## 🏗️ Architecture

```
Resume PDF + JD PDF
       ↓
PDF Text Extraction (pypdf)
       ↓
Recursive Text Chunking (1000 chars, 200 overlap)
       ↓
Sentence Embeddings (all-MiniLM-L6-v2, 384-dim)
       ↓
FAISS Vector Store (IndexFlatIP — cosine similarity)
       ↓
Top-K Retrieval (source-filtered)
       ↓
6 AI Agents → Groq Llama 3.3 70B
       ↓
Normalized JSON Response
```

---

## 📁 Folder Structure

```
ai-service/
├── main.py                    # FastAPI app — all endpoints
├── requirements.txt           # Python dependencies
├── .env.example               # Environment variable template
│
├── agents/                    # 6 AI Agents
│   ├── resume_reviewer_agent.py
│   ├── skill_gap_agent.py
│   ├── ats_agent.py
│   ├── career_advisor_agent.py
│   ├── interview_coach_agent.py
│   └── resume_rewriter_agent.py
│
├── rag/                       # RAG Pipeline
│   ├── pdf_loader.py          # PDF text extraction (pypdf)
│   ├── text_splitter.py       # RecursiveCharacterTextSplitter
│   ├── embeddings.py          # Sentence Transformers
│   ├── vector_store.py        # FAISS vector store
│   └── rag_pipeline.py        # Pipeline orchestrator
│
├── prompts/                   # Dedicated prompt modules
│   ├── resume_reviewer_prompt.py
│   ├── skill_gap_prompt.py
│   ├── ats_prompt.py
│   ├── career_advisor_prompt.py
│   ├── interview_prompt.py
│   └── resume_rewriter_prompt.py
│
├── services/
│   └── groq_service.py        # Groq LLM client
│
└── utils/
    └── response_parser.py     # JSON parsing & normalization
```

---

## 🚀 Setup & Run

### Step 1 — Install Python 3.11+

```bash
python --version   # Should be 3.11 or higher
```

### Step 2 — Create Virtual Environment

```bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate
```

### Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

> ⚠️ **Note**: First install downloads ~400MB for Sentence Transformers + PyTorch. Subsequent runs use cached models.

### Step 4 — Environment Setup

```bash
copy .env.example .env
```

Edit `.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=8000
```

### Step 5 — Run the Service

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The service starts at: **http://localhost:8000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/upload` | Upload Resume + JD PDFs |
| POST | `/analyze-resume` | Full pipeline (all 6 agents) |
| POST | `/skill-gap` | Skill Gap Analysis only |
| POST | `/ats-score` | ATS Score only |
| POST | `/career-roadmap` | Career Roadmap only |
| POST | `/interview-questions` | Interview Questions only |
| POST | `/rewrite-resume` | Resume Rewrite only |

### Interactive API Docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🧠 RAG Pipeline Details

| Component | Implementation |
|-----------|---------------|
| PDF Extraction | `pypdf` — multi-page text extraction |
| Text Chunking | Recursive character splitter (1000 chars, 200 overlap) |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` (384-dim) |
| Vector Store | FAISS `IndexFlatIP` (inner product = cosine on normalized) |
| Retrieval | Top-K cosine similarity search with source filtering |
| LLM | Groq Llama 3.3 70B (`llama-3.3-70b-versatile`) |

---

## 🤖 Agent Details

| Agent | Temperature | Max Tokens | Focus |
|-------|-------------|------------|-------|
| Resume Reviewer | 0.2 | 4096 | Score, strengths, weaknesses |
| Skill Gap Analyzer | 0.1 | 4096 | Matched/missing skills, % |
| ATS Score | 0.1 | 4096 | ATS compatibility, keywords |
| Career Advisor | 0.4 | 3000 | 3-month learning roadmap |
| Interview Coach | 0.5 | 4096 | 15 questions (5 per level) |
| Resume Rewriter | 0.4 | 4096 | Improved sections |

---

## 🔗 Integration with Node.js Backend

The Node.js backend can call this service via HTTP:

```javascript
// In Node.js backend (optional)
const response = await fetch('http://localhost:8000/analyze-resume', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resume_path: '/path/to/resume.pdf',
    jd_path: '/path/to/jd.pdf',
    target_role: 'MERN Stack Developer',
  }),
});
const data = await response.json();
```

---

## ⚡ Performance Notes

- First request: ~30-60s (model download + warm-up)
- Subsequent requests: ~60-120s (embedding + 6 LLM calls)
- FAISS search: <1ms for typical document sizes
- Embedding batch size: 32 chunks per batch

---

## 🐛 Troubleshooting

**"GROQ_API_KEY not set"**
→ Add your key to `.env` file

**"PDF appears to be empty or unreadable"**
→ PDF may be image-based (scanned). Use text-based PDFs.

**Slow first startup**
→ Normal. Sentence Transformer model downloads to `~/.cache/huggingface/`

**torch not found**
→ Run: `pip install torch --index-url https://download.pytorch.org/whl/cpu`
