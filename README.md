# 🤖 AI Resume & Career Advisor

> A production-ready MERN Stack application powered by **Prompt Engineering**, **RAG (Retrieval-Augmented Generation)**, and **7 AI Agents** using Groq's Llama model.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue) 
![AI](https://img.shields.io/badge/AI-Groq%20Llama-orange)
![RAG](https://img.shields.io/badge/RAG-LangChain%20%2B%20FAISS-purple)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Problem Statement

Students struggle to tailor resumes for specific job roles and identify skill gaps. This AI system bridges that gap with intelligent analysis.

---

## ✨ Features & AI Agents

| Agent | Feature | Output |
|---|---|---|
| 🔍 Resume Reviewer | Quality & keyword analysis | Score, strengths, weaknesses |
| 🧩 Skill Gap Analyzer | Resume vs JD comparison | Matched skills, missing skills, % |
| 🤖 ATS Score Agent | ATS simulation | ATS score, keyword analysis |
| 🗺️ Career Advisor | Personalized roadmap | 3-month structured plan |
| 💼 Interview Coach | Interview prep | Easy/Medium/Hard questions |
| ✏️ Resume Rewriter | Role-specific rewrite | Improved summary, projects, skills |
| 📚 Learning Resources | Per-skill learning paths | Resources, projects, order |

---

## 🏗️ Architecture

```
PDF Upload → Text Extraction → Chunking → Embeddings → FAISS Vector Store
                                                              ↓
                                                    Retriever (top-k chunks)
                                                              ↓
                                                 7 AI Agents (Groq Llama)
                                                              ↓
                                               MongoDB (Results Storage)
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js + Express.js** — REST API server
- **MongoDB Atlas + Mongoose** — Database
- **JWT + bcryptjs** — Authentication
- **Groq SDK** — LLM inference (Llama 3.3 70B)
- **@xenova/transformers** — Local HuggingFace embeddings (no API key needed)
- **pdf-parse** — PDF text extraction
- **Multer** — File upload handling
- **LangChain concepts** — RAG pipeline implementation

### Frontend
- **React.js + Vite** — UI framework
- **Tailwind CSS** — Styling
- **Axios** — HTTP client
- **Recharts** — Data visualization
- **react-dropzone** — Drag & drop file upload
- **react-hot-toast** — Notifications
- **framer-motion** — Animations

---

## 📁 Project Structure

```
ai-resume-advisor/
├── backend/
│   ├── agents/               # 7 AI Agents
│   │   ├── resumeReviewerAgent.js
│   │   ├── skillGapAgent.js
│   │   ├── atsScoreAgent.js
│   │   ├── careerAdvisorAgent.js
│   │   ├── interviewCoachAgent.js
│   │   ├── resumeRewriterAgent.js
│   │   └── learningResourceAgent.js
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth + error middleware
│   ├── models/               # Mongoose schemas
│   ├── rag/                  # RAG Pipeline
│   │   ├── pdfLoader.js
│   │   ├── textSplitter.js
│   │   ├── embeddings.js
│   │   ├── vectorStore.js
│   │   └── ragPipeline.js
│   ├── routes/               # Express routes
│   ├── services/             # Business logic
│   ├── utils/                # Helpers
│   ├── uploads/              # Uploaded PDFs (gitignored)
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/              # Axios instance
        ├── components/       # Reusable UI components
        ├── context/          # React Context (Auth)
        └── pages/            # Route pages
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Groq API key (free at https://console.groq.com)

---

### Step 1: Clone and Setup

```bash
# Navigate to the project directory
cd "F:/Gen AI Workshop Project/ai-resume-advisor"
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ai-resume-advisor
JWT_SECRET=your_random_32_char_secret_key_here
GROQ_API_KEY=gsk_your_groq_api_key
CLIENT_URL=http://localhost:3000
```

```bash
# Start backend
npm run dev
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies  
npm install

# Create environment file
copy .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
# Start frontend
npm run dev
```

### Step 4: Open App

```
Frontend: http://localhost:3000
Backend API: http://localhost:5000/api/health
```

---

## 🔑 Getting API Keys

### Groq API Key (Free)
1. Go to https://console.groq.com
2. Sign up / Log in
3. Click "API Keys" → "Create API Key"
4. Copy and paste into `backend/.env`

### MongoDB Atlas (Free)
1. Go to https://cloud.mongodb.com
2. Create free cluster (M0)
3. Database Access → Create user
4. Network Access → Allow 0.0.0.0/0
5. Connect → Get connection string
6. Replace `<username>` and `<password>` in `.env`

---

## 🌐 Deployment Guide

### Backend — Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway up
```

Set environment variables in Railway dashboard.

### Frontend — Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

Set `VITE_API_URL` to your Railway backend URL in Vercel settings.

---

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### File Upload
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload Resume + JD PDFs |

### Analysis
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analysis/run` | Start full AI analysis |
| GET | `/api/analysis/status/:id` | Poll analysis status |
| GET | `/api/analysis/:id` | Get full results |
| GET | `/api/analysis/history` | User's analysis history |
| DELETE | `/api/analysis/:id` | Delete analysis |

---

## 🧠 How RAG Works in This Project

```
1. PDF Upload (Multer)
        ↓
2. Text Extraction (pdf-parse)
        ↓
3. Text Chunking (1000 chars, 200 overlap)
        ↓
4. Embeddings (all-MiniLM-L6-v2 via @xenova/transformers)
        ↓
5. FAISS-like In-Memory Vector Store
        ↓
6. Cosine Similarity Search (top-k retrieval)
        ↓
7. Context Injection into Agent Prompts
        ↓
8. Groq Llama 3.3 70B Response
        ↓
9. JSON Parsing & Normalization
        ↓
10. MongoDB Storage + React Display
```

---

## 🎓 Project Highlights (For Evaluation)

| Concept | Implementation |
|---|---|
| **Prompt Engineering** | 7 specialized, structured prompts with role, context, and JSON format |
| **RAG** | Full PDF→chunk→embed→FAISS→retrieve→LLM pipeline |
| **AI Agents** | 7 independent agents with specific responsibilities |
| **Vector Store** | Cosine similarity search on 384-dim embeddings |
| **JWT Auth** | Secure authentication with protected routes |
| **Async Processing** | Background job with status polling |
| **Rate Limiting** | API and analysis-specific rate limits |

---

## 👨‍💻 Author

Built as a GenAI Workshop Project demonstrating:
- Prompt Engineering
- Retrieval-Augmented Generation (RAG)  
- AI Agent Architecture

---

## 📄 License

MIT License — Free to use for educational purposes.
