"""
Agent 5: Interview Coach Agent
================================
Generates interview questions at Easy, Medium, and Hard difficulty levels.

Output:
    {
        "easy": [{ "question": "...", "category": "Technical|HR|Project", "hint": "..." }],
        "medium": [...],
        "hard": [...]
    }
"""

from rag.rag_pipeline import RAGPipeline
from services.groq_service import call_groq
from utils.response_parser import parse_json, normalize_interview_questions
from prompts import interview_prompt


async def run_interview_coach_agent(
    rag: RAGPipeline,
    missing_skills: list[str],
    target_role: str,
) -> dict:
    """
    AGENT 5: Interview Coach

    Retrieves the candidate's project and experience details,
    then generates tiered interview questions (Easy/Medium/Hard)
    covering Technical, HR, and Project categories.

    Args:
        rag:            Initialized RAGPipeline instance
        missing_skills: Weak areas to focus on
        target_role:    Target job role

    Returns:
        Normalized interview questions dict with easy, medium, hard arrays
    """
    print("\n🤖 Agent 5: Interview Coach running...")

    # ─── RAG Retrieval ────────────────────────────────────────
    resume_context = await rag.retrieve(
        "projects experience skills technologies built implemented achieved led",
        top_k=6,
        source="resume",
    )

    # ─── Prompt Construction ──────────────────────────────────
    system_prompt = interview_prompt.get_system_prompt()
    user_prompt = interview_prompt.get_user_prompt(
        resume_context=RAGPipeline.truncate(resume_context, 2000),
        missing_skills=missing_skills,
        target_role=target_role,
    )

    # ─── LLM Call (higher tokens for 15 questions) ────────────
    raw = await call_groq(system_prompt, user_prompt, temperature=0.5, max_tokens=4096)
    parsed = parse_json(raw, fallback={})
    result = normalize_interview_questions(parsed)

    total = len(result["easy"]) + len(result["medium"]) + len(result["hard"])
    print(f"   ✅ Interview questions generated: {total} total (easy: {len(result['easy'])}, medium: {len(result['medium'])}, hard: {len(result['hard'])})")
    return result
