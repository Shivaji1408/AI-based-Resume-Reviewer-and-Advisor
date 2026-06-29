"""
Agent 4: Career Advisor Agent
================================
Generates a personalized 3-month learning roadmap based on skill gaps.

Output:
    {
        "month1": { "focus": "...", "topics": [...], "tasks": [...], "resources": [...] },
        "month2": { ... },
        "month3": { ... }
    }
"""

from rag.rag_pipeline import RAGPipeline
from services.groq_service import call_groq
from utils.response_parser import parse_json, normalize_career_roadmap
from prompts import career_advisor_prompt


async def run_career_advisor_agent(
    rag: RAGPipeline,
    missing_skills: list[str],
    target_role: str,
) -> dict:
    """
    AGENT 4: Career Advisor

    Uses the candidate's background and identified skill gaps to generate
    a structured, progressive 3-month learning roadmap.

    Args:
        rag:            Initialized RAGPipeline instance
        missing_skills: List of skills identified by Skill Gap Agent
        target_role:    Target job role

    Returns:
        Normalized career roadmap dict with month1, month2, month3
    """
    print("\n🤖 Agent 4: Career Advisor running...")

    # ─── RAG Retrieval ────────────────────────────────────────
    resume_context = await rag.retrieve(
        "current experience skills education background projects achievements",
        top_k=4,
        source="resume",
    )

    # ─── Prompt Construction ──────────────────────────────────
    system_prompt = career_advisor_prompt.get_system_prompt()
    user_prompt = career_advisor_prompt.get_user_prompt(
        resume_context=RAGPipeline.truncate(resume_context, 1500),
        missing_skills=missing_skills,
        target_role=target_role,
    )

    # ─── LLM Call (higher token limit for roadmap) ────────────
    raw = await call_groq(system_prompt, user_prompt, temperature=0.4, max_tokens=3000)
    parsed = parse_json(raw, fallback={})
    result = normalize_career_roadmap(parsed)

    print(f"   ✅ Roadmap generated: {result['month1']['focus']} → {result['month3']['focus']}")
    return result
