"""
Agent 1: Resume Reviewer Agent
================================
Analyzes resume quality, strengths, weaknesses, and provides a score.

Output:
    {
        "resumeScore": 82,
        "strengths": [...],
        "weaknesses": [...],
        "improvements": [...]
    }
"""

from rag.rag_pipeline import RAGPipeline
from services.groq_service import call_groq
from utils.response_parser import parse_json, normalize_resume_review
from prompts import resume_reviewer_prompt


async def run_resume_reviewer_agent(rag: RAGPipeline) -> dict:
    """
    AGENT 1: Resume Reviewer

    Uses RAG to retrieve the most relevant resume and JD sections,
    then asks the LLM to score and analyze the resume quality.

    Args:
        rag: Initialized RAGPipeline instance

    Returns:
        Normalized resume review dict with score, strengths, weaknesses, improvements
    """
    print("\n🤖 Agent 1: Resume Reviewer running...")

    # ─── RAG Retrieval ────────────────────────────────────────
    resume_context = await rag.retrieve(
        "professional experience skills projects achievements education certifications",
        top_k=6,
        source="resume",
    )
    jd_context = await rag.retrieve(
        "required qualifications skills experience responsibilities must have",
        top_k=4,
        source="jd",
    )

    # ─── Prompt Construction ──────────────────────────────────
    system_prompt = resume_reviewer_prompt.get_system_prompt()
    user_prompt = resume_reviewer_prompt.get_user_prompt(
        resume_context=RAGPipeline.truncate(resume_context, 2500),
        jd_context=RAGPipeline.truncate(jd_context, 1500),
    )

    # ─── LLM Call ─────────────────────────────────────────────
    raw = await call_groq(system_prompt, user_prompt, temperature=0.2)
    parsed = parse_json(raw, fallback={})
    result = normalize_resume_review(parsed)

    print(f"   ✅ Resume Score: {result['resumeScore']}/100")
    return result
