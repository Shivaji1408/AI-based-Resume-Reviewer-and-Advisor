"""
Interview Prompt — Agent 5
============================
Structured prompt for generating interview questions across difficulty levels.

Prompt Engineering Techniques Used:
  - Expert interviewer persona (FAANG experience)
  - Multi-category questions (Technical, HR, Project)
  - Difficulty tiering with explicit criteria
  - Hint generation for each question
  - Temperature: 0.5 (creative variety in questions)
"""


def get_system_prompt() -> str:
    """System prompt: expert interview coach persona."""
    return (
        "You are a Senior Technical Interview Coach with experience conducting "
        "interviews at Google, Amazon, and Microsoft. You design comprehensive "
        "interview question banks that cover technical concepts, behavioral responses "
        "(STAR method), and project deep-dives. Your questions are realistic, "
        "progressive in difficulty, and directly relevant to the candidate's background."
    )


def get_user_prompt(
    resume_context: str,
    missing_skills: list[str],
    target_role: str,
) -> str:
    """
    User prompt: multi-difficulty interview question generation.

    Args:
        resume_context: Candidate resume context from RAG
        missing_skills: Skills the candidate is weak in
        target_role:    Target job role

    Returns:
        Complete formatted prompt string
    """
    skills_str = ", ".join(missing_skills[:6]) if missing_skills else "core technical skills"

    return f"""Generate a comprehensive interview question bank for this candidate.

CANDIDATE RESUME:
{resume_context}

WEAK AREAS / MISSING SKILLS: {skills_str}
TARGET ROLE: {target_role}

Difficulty Guidelines:
- Easy:   Conceptual knowledge, definitions, basic syntax, HR/intro questions
- Medium: Implementation understanding, design decisions, moderate algorithms, situational HR
- Hard:   System design, complex algorithms, trade-off analysis, advanced architecture

Categories:
- Technical: Programming, frameworks, system design, algorithms
- HR:        Behavioral, situational, motivation, teamwork (use STAR method hints)
- Project:   Questions about projects mentioned in the resume

Generate 5 questions per difficulty level (15 total). Mix categories within each level.

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "easy": [
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint or what to focus on>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}}
  ],
  "medium": [
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}}
  ],
  "hard": [
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}},
    {{"question": "<question>", "category": "<Technical|HR|Project>", "hint": "<brief hint>"}}
  ]
}}"""
