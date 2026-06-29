"""
Resume Rewriter Prompt — Agent 6
==================================
Structured prompt for rewriting key resume sections for a target role.

Prompt Engineering Techniques Used:
  - Professional resume writer persona
  - ATS optimization requirements
  - Strong action verb requirements
  - Quantification encouragement
  - Role-specific customization
  - Temperature: 0.4 (creative but professional)
"""


def get_system_prompt() -> str:
    """System prompt: expert tech resume writer persona."""
    return (
        "You are an expert Technical Resume Writer who has helped 1000+ candidates "
        "land jobs at top tech companies. You specialize in transforming mediocre resumes "
        "into powerful, ATS-optimized, recruiter-magnet documents. You always use strong "
        "action verbs, quantify achievements with metrics, include relevant keywords, "
        "and tailor every word to the target role."
    )


def get_user_prompt(resume_context: str, target_role: str) -> str:
    """
    User prompt: role-specific resume rewriting.

    Args:
        resume_context: Resume content from RAG retrieval
        target_role:    Target job role for tailoring

    Returns:
        Complete formatted prompt string
    """
    return f"""Rewrite key sections of this resume to make it perfect for the target role.

ORIGINAL RESUME:
{resume_context}

TARGET ROLE: {target_role}

Rewriting Guidelines:
1. Professional Summary: Write 3-4 compelling sentences that position the candidate perfectly for {target_role}. Include years of experience (if available), key skills, and a unique value proposition.
2. Project Descriptions: Rewrite using the STAR format (Situation/Task → Action → Result). Add impact metrics where possible. Include relevant technologies.
3. Skills Section: Reorganize and add missing keywords relevant to {target_role}. Group logically (Languages, Frameworks, Tools, Databases, Cloud).
4. Tips: Give 3-4 specific, actionable suggestions to further improve the resume.

Rules:
- Use strong action verbs: Built, Architected, Optimized, Reduced, Improved, Led, Delivered
- Add numbers wherever possible: "Reduced load time by 40%", "Served 10K+ users"
- Include {target_role}-specific keywords naturally
- Keep professional summary under 80 words

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "professionalSummary": "<3-4 sentence compelling summary for {target_role}>",
  "improvedProjects": [
    "<Project 1: Name | Tech Stack | Impact - rewritten with metrics>",
    "<Project 2: Name | Tech Stack | Impact - rewritten with metrics>",
    "<Project 3: Name | Tech Stack | Impact - rewritten with metrics>"
  ],
  "improvedSkillsSection": "<Well-organized skills section: Languages: ... | Frameworks: ... | Tools: ... | Databases: ...>",
  "additionalTips": [
    "<Actionable tip 1>",
    "<Actionable tip 2>",
    "<Actionable tip 3>"
  ]
}}"""
