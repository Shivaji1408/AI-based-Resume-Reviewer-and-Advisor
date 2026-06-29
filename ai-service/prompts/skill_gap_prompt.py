"""
Skill Gap Prompt — Agent 2
============================
Structured prompt for comparing resume skills vs job requirements.

Prompt Engineering Techniques Used:
  - Domain specialist persona
  - Explicit skill extraction instructions
  - Quantitative output (match percentage)
  - JSON-only enforcement
  - Temperature: 0.1 (highly deterministic)
"""


def get_system_prompt() -> str:
    """System prompt: technical skill gap specialist persona."""
    return (
        "You are a Technical Skill Gap Analyzer specializing in software engineering roles. "
        "You meticulously extract ALL technical and soft skills from both the resume and "
        "job description, then compare them with precision. You never miss skills and never "
        "hallucinate skills that aren't present."
    )


def get_user_prompt(resume_context: str, jd_context: str) -> str:
    """
    User prompt: skill extraction and comparison with structured JSON output.

    Args:
        resume_context: Resume chunks from RAG retrieval
        jd_context:     JD chunks from RAG retrieval

    Returns:
        Complete formatted prompt string
    """
    return f"""Compare the resume skills against the job requirements and identify the skill gap.

RESUME SKILLS AND EXPERIENCE:
{resume_context}

JOB DESCRIPTION REQUIREMENTS:
{jd_context}

Instructions:
1. Extract ALL technical skills from the resume (programming languages, frameworks, tools, databases, cloud, etc.)
2. Extract ALL required skills from the job description
3. Find which skills MATCH (present in both)
4. Find which skills are MISSING (required by JD but not in resume)
5. Calculate match percentage: (matched / total_required) * 100

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "matchedSkills": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "missingSkills": ["<missing skill 1>", "<missing skill 2>", "<missing skill 3>"],
  "matchPercentage": <integer 0-100>,
  "allRequiredSkills": ["<all skills mentioned in JD>"]
}}"""
