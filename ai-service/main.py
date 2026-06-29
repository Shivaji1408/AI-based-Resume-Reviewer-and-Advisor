"""
AI Resume & Career Advisor — Python FastAPI AI Microservice
============================================================
Standalone Python microservice that mirrors the Node.js backend AI capabilities
using LangChain, FAISS, Sentence Transformers, and Groq API.

Endpoints:
  POST /upload           — Upload Resume + JD PDFs
  POST /analyze-resume   — Full pipeline (all agents)
  POST /skill-gap        — Skill gap analysis only
  POST /ats-score        — ATS score only
  POST /career-roadmap   — Career roadmap only
  POST /interview-questions — Interview questions only
  POST /rewrite-resume   — Resume rewrite only
  GET  /health           — Health check
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Internal imports
from rag.rag_pipeline import RAGPipeline
from agents.resume_reviewer_agent import run_resume_reviewer_agent
from agents.skill_gap_agent import run_skill_gap_agent
from agents.ats_agent import run_ats_agent
from agents.career_advisor_agent import run_career_advisor_agent
from agents.interview_coach_agent import run_interview_coach_agent
from agents.resume_rewriter_agent import run_resume_rewriter_agent

# ─── App Setup ────────────────────────────────────────────────
app = FastAPI(
    title="AI Resume & Career Advisor — AI Service",
    description="Python FastAPI AI Microservice with LangChain, FAISS, and Groq",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5000,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(exist_ok=True)


# ─── Pydantic Models ──────────────────────────────────────────
class AnalysisRequest(BaseModel):
    resume_path: str
    jd_path: str
    target_role: Optional[str] = "Software Developer"


class SingleAgentRequest(BaseModel):
    resume_path: str
    jd_path: str
    target_role: Optional[str] = "Software Developer"
    missing_skills: Optional[list[str]] = []


# ─── Helper ───────────────────────────────────────────────────
def save_upload_file(upload_file: UploadFile) -> str:
    """Save an uploaded file and return its path."""
    ext = Path(upload_file.filename).suffix or ".pdf"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return str(file_path)


# ─── Routes ───────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "OK",
        "service": "AI Resume & Career Advisor — Python AI Service",
        "version": "1.0.0",
        "tech_stack": {
            "framework": "FastAPI",
            "llm": "Groq Llama 3.3 70B",
            "embeddings": "Sentence Transformers (all-MiniLM-L6-v2)",
            "vector_store": "FAISS",
            "rag": "LangChain",
        },
    }


@app.post("/upload")
async def upload_files(
    resume: UploadFile = File(..., description="Resume PDF"),
    job_description: UploadFile = File(..., description="Job Description PDF"),
):
    """
    Upload Resume and Job Description PDFs.
    Returns file paths for subsequent analysis calls.
    """
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Resume must be a PDF file")
    if not job_description.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Job description must be a PDF file")

    resume_path = save_upload_file(resume)
    jd_path = save_upload_file(job_description)

    return {
        "success": True,
        "message": "Files uploaded successfully",
        "files": {
            "resume": {"path": resume_path, "original_name": resume.filename},
            "job_description": {"path": jd_path, "original_name": job_description.filename},
        },
    }


@app.post("/analyze-resume")
async def analyze_resume(request: AnalysisRequest):
    """
    Full AI Analysis Pipeline — runs all 6 agents sequentially.
    
    Pipeline:
    1. PDF extraction → chunking → embeddings → FAISS
    2. Resume Reviewer Agent
    3. Skill Gap Analyzer Agent
    4. ATS Score Agent
    5. Career Advisor Agent (needs missing skills from step 3)
    6. Interview Coach Agent
    7. Resume Rewriter Agent
    """
    try:
        # Step 1: Initialize RAG Pipeline
        rag = RAGPipeline()
        await rag.initialize(request.resume_path, request.jd_path)

        # Step 2: Core agents (independent)
        resume_review = await run_resume_reviewer_agent(rag)
        skill_gap = await run_skill_gap_agent(rag)
        ats_analysis = await run_ats_agent(rag)

        # Step 3: Context-dependent agents
        missing_skills = skill_gap.get("missingSkills", [])
        career_roadmap = await run_career_advisor_agent(rag, missing_skills, request.target_role)
        interview_questions = await run_interview_coach_agent(rag, missing_skills, request.target_role)
        rewritten_resume = await run_resume_rewriter_agent(rag, request.target_role)

        return {
            "success": True,
            "target_role": request.target_role,
            "resume_review": resume_review,
            "skill_gap": skill_gap,
            "ats_analysis": ats_analysis,
            "career_roadmap": career_roadmap,
            "interview_questions": interview_questions,
            "rewritten_resume": rewritten_resume,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/skill-gap")
async def skill_gap_analysis(request: AnalysisRequest):
    """Skill Gap Analysis only."""
    try:
        rag = RAGPipeline()
        await rag.initialize(request.resume_path, request.jd_path)
        result = await run_skill_gap_agent(rag)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ats-score")
async def ats_score(request: AnalysisRequest):
    """ATS Score Analysis only."""
    try:
        rag = RAGPipeline()
        await rag.initialize(request.resume_path, request.jd_path)
        result = await run_ats_agent(rag)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/career-roadmap")
async def career_roadmap(request: SingleAgentRequest):
    """Career Roadmap generation only."""
    try:
        rag = RAGPipeline()
        await rag.initialize(request.resume_path, request.jd_path)
        result = await run_career_advisor_agent(rag, request.missing_skills, request.target_role)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/interview-questions")
async def interview_questions(request: SingleAgentRequest):
    """Interview Questions generation only."""
    try:
        rag = RAGPipeline()
        await rag.initialize(request.resume_path, request.jd_path)
        result = await run_interview_coach_agent(rag, request.missing_skills, request.target_role)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rewrite-resume")
async def rewrite_resume(request: AnalysisRequest):
    """Resume Rewriting only."""
    try:
        rag = RAGPipeline()
        await rag.initialize(request.resume_path, request.jd_path)
        result = await run_resume_rewriter_agent(rag, request.target_role)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Entry Point ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "True").lower() == "true",
        log_level="info",
    )
