"""
Resume Reviewer Prompt — Agent 1
=================================
Structured prompt for analyzing resume quality against a job description.

Prompt Engineering Techniques Used:
  - Role assignment (expert persona)
  - Structured evaluation criteria
  - JSON-only output enforcement
  - Temperature: 0.2 (factual, consistent)
"""


def get_system_prompt() -> str:
    """System prompt: assigns the expert persona."""
    return (
        "You are an expert Resume Reviewer with 15+ years of experience in HR and "
        "talent acquisition for top tech companies like Google, Amazon, and Microsoft. "
        "You provide honest, specific, and actionable feedback that helps candidates "
        "significantly improve their resumes."
    )


def get_user_prompt(resume_context: str, jd_context: str) -> str:
    """
    User prompt: injects RAG context and defines evaluation criteria.

    Args:
        resume_context: Relevant resume chunks from RAG retrieval
        jd_context:     Relevant JD chunks from RAG retrieval

    Returns:
        Complete formatted prompt string
    """
    return f"""Analyze this resume thoroughly against the job description.

RESUME CONTENT:
{resume_context}

JOB DESCRIPTION:
{jd_context}

Evaluate the following criteria:
1. Content quality and relevance to the target role
2. Achievement quantification (numbers, percentages, business impact)
3. Keyword optimization for ATS and recruiter scanning
4. Structural clarity, professional formatting, and section completeness
5. Unique value proposition and overall marketability

Return ONLY a valid JSON object (no markdown, no explanation, no extra text):
{{
  "resumeScore": <integer 0-100>,
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>", "<specific strength 4>"],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>", "<specific weakness 3>"],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>", "<actionable improvement 4>"]
}}"""
