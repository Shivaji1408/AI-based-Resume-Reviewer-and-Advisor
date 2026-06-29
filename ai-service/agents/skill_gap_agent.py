"""
Agent 2: Skill Gap Analyzer Agent
====================================
Compares resume skills vs job description requirements.

Output:
    {
        "matchedSkills": [...],
        "missingSkills": [...],
        "matchPercentage": 75,
        "allRequiredSkills": [...]
    }
"""

from rag.rag_pipeline import RAGPipeline
from services.groq_service import call_groq
from utils.response_parser import parse_json, normalize_skill_gap
from prompts import skill_gap_prompt


async def run_skill_gap_agent(rag: RAGPipeline) -> dict:
    """
    AGENT 2: Skill Gap Analyzer

    Retrieves technical skills sections from both resume and JD,
    then compares them to identify matched and missing skills.

    Args:
        rag: Initialized RAGPipeline instance

    Returns:
        Normalized skill gap dict with matched, missing, and match percentage
    """
    print("\n🤖 Agent 2: Skill Gap Analyzer running...")

    # ─── RAG Retrieval ────────────────────────────────────────
    resume_context = await rag.retrieve(
        "technical skills programming languages frameworks libraries tools databases cloud",
        top_k=6,
        source="resume",
    )
    jd_context = await rag.retrieve(
        "required skills must have technical qualifications preferred technologies stack",
        top_k=6,
        source="jd",
    )

    # ─── Prompt Construction ──────────────────────────────────
    system_prompt = skill_gap_prompt.get_system_prompt()
    user_prompt = skill_gap_prompt.get_user_prompt(
        resume_context=RAGPipeline.truncate(resume_context, 2000),
        jd_context=RAGPipeline.truncate(jd_context, 2000),
    )

    # ─── LLM Call ─────────────────────────────────────────────
    raw = await call_groq(system_prompt, user_prompt, temperature=0.1)
    parsed = parse_json(raw, fallback={})
    result = normalize_skill_gap(parsed)

    print(f"   ✅ Match: {result['matchPercentage']}% | Missing: {len(result['missingSkills'])} skills")
    return result
