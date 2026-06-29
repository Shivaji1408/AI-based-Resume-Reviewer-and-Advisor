"""
Agent 3: ATS Score Agent
==========================
Simulates Applicant Tracking System evaluation of the resume.

Output:
    {
        "atsScore": 80,
        "issues": [...],
        "recommendations": [...],
        "keywordsFound": [...],
        "keywordsMissing": [...]
    }
"""

from rag.rag_pipeline import RAGPipeline
from services.groq_service import call_groq
from utils.response_parser import parse_json, normalize_ats_score
from prompts import ats_prompt


async def run_ats_agent(rag: RAGPipeline) -> dict:
    """
    AGENT 3: ATS Score Agent

    Simulates how enterprise ATS systems (Workday, Taleo, Greenhouse)
    parse and score the resume against the job description.

    Args:
        rag: Initialized RAGPipeline instance

    Returns:
        Normalized ATS analysis dict with score, issues, keywords
    """
    print("\n🤖 Agent 3: ATS Score Agent running...")

    # ─── RAG Retrieval ────────────────────────────────────────
    # Get broader context — ATS needs to see structure and formatting
    resume_context = await rag.retrieve(
        "resume format sections contact information work experience education skills summary objective",
        top_k=8,
        source="resume",
    )
    jd_context = await rag.retrieve(
        "job requirements keywords technical skills qualifications preferred",
        top_k=5,
        source="jd",
    )

    # ─── Prompt Construction ──────────────────────────────────
    system_prompt = ats_prompt.get_system_prompt()
    user_prompt = ats_prompt.get_user_prompt(
        resume_context=RAGPipeline.truncate(resume_context, 2500),
        jd_context=RAGPipeline.truncate(jd_context, 1500),
    )

    # ─── LLM Call ─────────────────────────────────────────────
    raw = await call_groq(system_prompt, user_prompt, temperature=0.1)
    parsed = parse_json(raw, fallback={})
    result = normalize_ats_score(parsed)

    print(f"   ✅ ATS Score: {result['atsScore']}/100")
    return result
