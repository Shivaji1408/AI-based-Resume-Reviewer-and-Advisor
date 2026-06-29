"""
ATS Prompt — Agent 3
======================
Structured prompt for simulating Applicant Tracking System evaluation.

Prompt Engineering Techniques Used:
  - ATS system simulation persona (not human reviewer)
  - Specific ATS criteria enumeration
  - Multi-dimensional scoring
  - JSON-only output
  - Temperature: 0.1 (highly consistent scoring)
"""


def get_system_prompt() -> str:
    """System prompt: ATS simulation expert persona."""
    return (
        "You are an ATS (Applicant Tracking System) expert who simulates how enterprise "
        "ATS software like Workday, Taleo, Greenhouse, and iCIMS parse and score resumes. "
        "You evaluate resumes from a machine's perspective — focusing on keyword matching, "
        "section detection, and formatting compatibility."
    )


def get_user_prompt(resume_context: str, jd_context: str) -> str:
    """
    User prompt: ATS simulation with specific criteria.

    Args:
        resume_context: Resume chunks from RAG retrieval
        jd_context:     JD chunks from RAG retrieval

    Returns:
        Complete formatted prompt string
    """
    return f"""Simulate ATS parsing and scoring for this resume against the job description.

RESUME:
{resume_context}

JOB DESCRIPTION:
{jd_context}

Evaluate these ATS criteria and score each:
1. Keyword Density: Does the resume contain the JD's primary keywords?
2. Standard Sections: Are Summary, Experience, Education, Skills sections present with standard headers?
3. Contact Information: Is Name, Email, Phone, LinkedIn visible and properly formatted?
4. Date Formatting: Are dates consistent (e.g., "Jan 2022 - Present" or "2022 - 2024")?
5. ATS Compatibility: No detected tables, columns, graphics, or special characters that break parsing?
6. Readability: Clear, concise language with action verbs (developed, implemented, led, achieved)?
7. Keyword Placement: Keywords appear in relevant sections (not just skills section)?

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "atsScore": <integer 0-100>,
  "issues": ["<ATS issue 1>", "<ATS issue 2>", "<ATS issue 3>"],
  "recommendations": ["<fix recommendation 1>", "<fix recommendation 2>", "<fix recommendation 3>"],
  "keywordsFound": ["<keyword found in resume 1>", "<keyword 2>", "<keyword 3>"],
  "keywordsMissing": ["<JD keyword missing from resume 1>", "<missing keyword 2>"]
}}"""
