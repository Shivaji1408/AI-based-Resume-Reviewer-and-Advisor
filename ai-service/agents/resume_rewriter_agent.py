"""
Agent 6: Resume Rewriter Agent
================================
Rewrites key resume sections tailored to the target role.

Output:
    {
        "professionalSummary": "...",
        "improvedProjects": [...],
        "improvedSkillsSection": "...",
        "additionalTips": [...]
    }
"""

from rag.rag_pipeline import RAGPipeline
from services.groq_service import call_groq
from utils.response_parser import parse_json, normalize_rewritten_resume
from prompts import resume_rewriter_prompt


async def run_resume_rewriter_agent(
    rag: RAGPipeline,
    target_role: str,
) -> dict:
    """
    AGENT 6: Resume Rewriter

    Retrieves the full resume content and rewrites key sections
    (summary, projects, skills) to be more impactful and ATS-optimized
    for the target role.

    Args:
        rag:         Initialized RAGPipeline instance
        target_role: Target job role for tailoring

    Returns:
        Normalized rewritten resume dict with improved sections and tips
    """
    print("\n🤖 Agent 6: Resume Rewriter running...")

    # ─── RAG Retrieval ────────────────────────────────────────
    # Get comprehensive resume content for rewriting
    resume_context = await rag.retrieve(
        "professional summary objective experience projects skills technologies achievements",
        top_k=8,
        source="resume",
    )

    # ─── Prompt Construction ──────────────────────────────────
    system_prompt = resume_rewriter_prompt.get_system_prompt()
    user_prompt = resume_rewriter_prompt.get_user_prompt(
        resume_context=RAGPipeline.truncate(resume_context, 2500),
        target_role=target_role,
    )

    # ─── LLM Call ─────────────────────────────────────────────
    raw = await call_groq(system_prompt, user_prompt, temperature=0.4, max_tokens=4096)
    parsed = parse_json(raw, fallback={})
    result = normalize_rewritten_resume(parsed)

    print(f"   ✅ Resume rewritten for: {target_role}")
    return result
