# 🤖 AI Resume & Career Advisor

> A production-ready **MERN Stack + Python FastAPI** application powered by **Prompt Engineering**, **RAG (Retrieval-Augmented Generation)**, and **8 AI Agents** using Groq's Llama model.

![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20FastAPI-blue)
![AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3%2070B-orange)
![RAG](https://img.shields.io/badge/RAG-LangChain%20%2B%20FAISS-purple)
![Embeddings](https://img.shields.io/badge/Embeddings-Sentence%20Transformers-green)
![License](https://img.shields.io/badge/License-MIT-gray)

---

## 🎯 Problem Statement

Students struggle to tailor resumes for specific job roles and identify skill gaps. This AI system bridges that gap with intelligent multi-agent analysis — giving actionable scores, roadmaps, and interview prep in under 2 minutes.

---

## 🏗️ System Architecture

```
                    ┌─────────────────────┐
                    │   React.js Frontend  │
                    │   (Tailwind CSS)     │
                    └──────────┬──────────┘
                               │ HTTP/JWT
                    ┌──────────▼──────────┐
                    │  Node.js + Express   │
                    │  (API Gateway)       │
                    │  MongoDB Atlas       │
                    └──────────┬──────────┘
                               │
              ┌────────────────▼────────────────┐
              │     AI Service Layer             │
              │                                  │
              │  Option A: Node.js RAG Pipeline  │
              │  Option B: Python FastAPI Service│
              └──────────────┬──────────────────┘
                             │
              ┌──────────────▼──────────────────┐
              │         Groq API                 │
              │   Llama 3.3 70B Versatile        │
              └─────────────────────────────────┘
```

### RAG Pipeline Flow

```
PDF Upload → Text Extraction → Chunking (1000/200) → Embeddings (all-MiniLM-L6-v2)
                                                              ↓
                                                     FAISS Vector Store
                                                              ↓
                                              Cosine Similarity Search (top-k)
                                                              ↓
                                               8 AI Agents → Groq Llama
                                                              ↓
                                              MongoDB Storage → React Dashboard
```

---

## ✨ Features & AI Agents

| # | Agent | Feature | Output |
|---|-------|---------|--------|
| 1 | 🔍 Resume Reviewer | Quality & keyword analysis | Score, strengths, weaknesses, improvements |
| 2 | 🧩 Skill Gap Analyzer | Resume vs JD comparison | Matched skills, missing skills, match % |
| 3 | 🤖 ATS Score Agent | ATS simulation (Workday/Taleo) | ATS score, keyword analysis |
| 4 | 🗺️ Career Advisor | Personalized roadmap | 3-month structured learning plan |
| 5 | 💼 Interview Coach | Interview preparation | Easy/Medium/Hard questions + hints |
| 6 | ✏️ Resume Rewriter | Role-specific rewrite | Improved summary, projects, skills |
| 7 | 📚 Learning Resources | Per-skill learning paths | Resources, projects, learning order |
| 8 | 🏢 Job Match Predictor | Company compatibility | Match % for Google, Amazon, Microsoft, etc. |

---

## 🛠️ Tech Stack

### Node.js Backend (Primary)
| Technology | Purpose |
|------------|---------|
| Node.js + Express.js | REST API server |
| MongoDB Atlas + Mongoose | Database & ODM |
| JWT + bcryptjs | Authentication |
| Groq SDK | LLM inference (Llama 3.3 70B) |
| @xenova/transformers | Local embeddings (no API key) |
| pdf-parse | PDF text extraction |
| Multer | File upload handling |
| FAISS (cosine sim) | In-memory vector search |
| helmet + rate-limit | Security middleware |

### Python FastAPI Service (Companion)
| Technology | Purpose |
|------------|---------|
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| LangChain | RAG orchestration |
| FAISS-CPU | Vector similarity search |
| Sentence Transformers | all-MiniLM-L6-v2 embeddings |
| pypdf | PDF text extraction |
| Groq Python SDK | LLM inference |
| Pydantic | Data validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js + Vite | UI framework |
| Tailwind CSS | Styling |
| Recharts | Data visualization (charts) |
| Axios | HTTP client |
| react-dropzone | Drag & drop file upload |
| react-hot-toast | Toast notifications |
| lucide-react | Icons |

---

## 📁 Project Structure

```
ai-resume-advisor/
│
├── backend/                   # Node.js Express API
│   ├── agents/                # 8 AI Agents
│   │   ├── resumeReviewerAgent.js
│   │   ├── skillGapAgent.js
│   │   ├── atsScoreAgent.js
│   │   ├── careerAdvisorAgent.js
│   │   ├── interviewCoachAgent.js
│   │   ├── resumeRewriterAgent.js
│   │   ├── learningResourceAgent.js
│   │   └── jobMatchAgent.js       ← NEW: Job Match Predictor
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/                # Mongoose schemas
│   ├── rag/                   # RAG Pipeline
│   │   ├── pdfLoader.js
│   │   ├── textSplitter.js
│   │   ├── embeddings.js
│   │   ├── vectorStore.js
│   │   └── ragPipeline.js
│   ├── routes/
│   ├── services/
│   ├── utils/
│   │   ├── promptTemplates.js # All 7 prompt templates
│   │   └── responseParser.js  # JSON normalizers
│   └── server.js
│
├── frontend/                  # React + Tailwind
│   └── src/
│       ├── api/               # Axios instance
│       ├── components/        # Navbar, ScoreCard, SkillChart, etc.
│       ├── context/           # AuthContext
│       └── pages/
│           ├── LandingPage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── Dashboard.jsx
│           ├── UploadPage.jsx
│           ├── AnalysisResultsPage.jsx  ← 9 tabs including Job Match
│           └── ProfilePage.jsx          ← NEW: User profile & achievements
│
└── ai-service/                # Python FastAPI Microservice
    ├── main.py                # FastAPI app (7 endpoints)
    ├── requirements.txt
    ├── agents/                # 6 Python AI Agents
    ├── rag/                   # Python RAG Pipeline (FAISS)
    ├── prompts/               # Dedicated prompt modules
    ├── services/              # Groq service
    └── utils/                 # Response parser
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.11+ (for ai-service)
- MongoDB Atlas account (free)
- Groq API key (free at https://console.groq.com)

---

### Backend Setup

```bash
cd backend
npm install

# Configure environment
copy .env.example .env
# Edit .env: add MONGO_URI and GROQ_API_KEY

# Start development server
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
copy .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000

# Start dev server
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

### Python AI Service Setup (Optional)

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

copy .env.example .env
# Edit .env: add GROQ_API_KEY

python main.py
```

AI Service runs on: **http://localhost:8000**
- Swagger UI: http://localhost:8000/docs

---

## 🔑 Getting API Keys

### Groq API Key (Free — Required)
1. Go to https://console.groq.com
2. Sign up / Log in
3. Click "API Keys" → "Create API Key"
4. Copy into `backend/.env` as `GROQ_API_KEY`

### MongoDB Atlas (Free — Required)
1. Go to https://cloud.mongodb.com
2. Create free cluster (M0 Sandbox)
3. Database Access → Add user
4. Network Access → Allow `0.0.0.0/0`
5. Connect → Drivers → Copy connection string
6. Set as `MONGO_URI` in `backend/.env`

---

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update name/targetRole |

### File Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | JWT | Upload Resume + JD PDFs |

### Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/analysis/run` | JWT | Start full AI analysis (8 agents) |
| GET | `/api/analysis/status/:id` | JWT | Poll analysis status |
| GET | `/api/analysis/:id` | JWT | Get full results |
| GET | `/api/analysis/history` | JWT | User's analysis history |
| DELETE | `/api/analysis/:id` | JWT | Delete analysis |

---

## 🧠 Prompt Engineering

All prompts use structured prompt engineering with:
- **Role assignment**: Expert persona (recruiter, ATS system, mentor)
- **Context injection**: RAG-retrieved relevant document chunks
- **Output constraints**: JSON-only, no markdown, specific schema
- **Temperature control**: Low (0.1-0.2) for analysis, higher (0.4-0.5) for creative tasks

| Prompt File | Agent | Temperature |
|-------------|-------|-------------|
| `resume_reviewer_prompt.py` | Resume Reviewer | 0.2 |
| `skill_gap_prompt.py` | Skill Gap Analyzer | 0.1 |
| `ats_prompt.py` | ATS Score Agent | 0.1 |
| `career_advisor_prompt.py` | Career Advisor | 0.4 |
| `interview_prompt.py` | Interview Coach | 0.5 |
| `resume_rewriter_prompt.py` | Resume Rewriter | 0.4 |

---

## 🌐 Deployment Guide

### Backend → Railway
```bash
npm install -g @railway/cli
railway login
cd backend && railway up
```
Set environment variables in Railway dashboard.

### Frontend → Vercel
```bash
npm install -g vercel
cd frontend && vercel --prod
```
Set `VITE_API_URL` to your Railway backend URL.

### Python Service → Render
1. Create new Web Service on render.com
2. Set Build Command: `pip install -r requirements.txt`
3. Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

---

## 🎓 Project Highlights

| Concept | Implementation |
|---------|---------------|
| **Prompt Engineering** | 6 dedicated prompt modules with role, criteria, JSON schema |
| **RAG** | PDF→chunk→embed→FAISS→retrieve→LLM full pipeline |
| **AI Agents** | 8 independent agents with specific responsibilities |
| **Vector Store** | FAISS IndexFlatIP (cosine sim on normalized 384-dim vectors) |
| **JWT Auth** | Secure authentication with protected React routes |
| **Async Processing** | Background analysis with status polling |
| **Rate Limiting** | API and analysis-specific rate limits |
| **Microservices** | Node.js + Python FastAPI dual service architecture |

---

## 👨‍💻 Author

Built as a **GenAI Workshop Project** demonstrating:
- Prompt Engineering
- Retrieval-Augmented Generation (RAG)
- AI Agent Architecture
- MERN Stack Integration
- Python FastAPI Microservices

---

## 📄 License

MIT License — Free to use for educational purposes.
