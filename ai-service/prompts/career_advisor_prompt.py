"""
Career Advisor Prompt — Agent 4
================================
Structured prompt for generating a personalized 3-month learning roadmap.

Prompt Engineering Techniques Used:
  - Senior mentor persona with specific credentials
  - Progressive learning structure (foundation → application → mastery)
  - Specificity requirements (named resources, concrete tasks)
  - Dynamic context injection (missing skills + target role)
  - Temperature: 0.4 (creative but structured)
"""


def get_system_prompt() -> str:
    """System prompt: senior career advisor and tech mentor persona."""
    return (
        "You are a Senior Career Advisor and Tech Mentor at a top-tier tech company. "
        "You have helped 500+ engineers upskill and land jobs at FAANG companies. "
        "Your roadmaps are realistic, progressive, and highly specific — you always "
        "name real resources, real platforms, and give concrete daily/weekly tasks. "
        "You never give generic advice."
    )


def get_user_prompt(
    resume_context: str,
    missing_skills: list[str],
    target_role: str,
) -> str:
    """
    User prompt: personalized 3-month roadmap generation.

    Args:
        resume_context: Candidate background from RAG retrieval
        missing_skills: List of skills to bridge
        target_role:    Target job role

    Returns:
        Complete formatted prompt string
    """
    skills_str = ", ".join(missing_skills[:8]) if missing_skills else "general software skills"

    return f"""Create a detailed, personalized 3-month learning roadmap for this candidate.

CANDIDATE BACKGROUND:
{resume_context}

MISSING SKILLS TO LEARN: {skills_str}
TARGET ROLE: {target_role}

Structure the roadmap progressively:
- Month 1: Foundation — Core concepts, fundamentals, essential tools
- Month 2: Application — Hands-on projects, real-world practice, portfolio building
- Month 3: Mastery — Advanced topics, interview preparation, job application strategy

Requirements:
- Be SPECIFIC: name real courses (e.g., "Udemy - React Complete Guide by Maximilian"), real docs, real YouTube channels
- Give CONCRETE tasks: "Build a CRUD app with React + Node.js in Week 2" not "learn frontend"
- Include FREE resources when possible (MDN, FreeCodeCamp, Official Docs, YouTube)
- Each month must have exactly 3-4 topics, 3-4 tasks, and 2-3 resources

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "month1": {{
    "focus": "<specific focus area, e.g., 'Core React & State Management'>",
    "topics": ["<topic 1>", "<topic 2>", "<topic 3>"],
    "tasks": ["<actionable task 1>", "<actionable task 2>", "<actionable task 3>"],
    "resources": ["<Resource Name - Platform/URL>", "<Resource Name - Platform/URL>"]
  }},
  "month2": {{
    "focus": "<specific focus area>",
    "topics": ["<topic 1>", "<topic 2>", "<topic 3>"],
    "tasks": ["<actionable task 1>", "<actionable task 2>", "<actionable task 3>"],
    "resources": ["<resource 1>", "<resource 2>"]
  }},
  "month3": {{
    "focus": "<specific focus area>",
    "topics": ["<topic 1>", "<topic 2>", "<topic 3>"],
    "tasks": ["<actionable task 1>", "<actionable task 2>", "<actionable task 3>"],
    "resources": ["<resource 1>", "<resource 2>"]
  }}
}}"""
