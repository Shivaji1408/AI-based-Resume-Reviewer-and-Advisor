"""
Response Parser — JSON parsing & normalization utilities
=========================================================
Safely parses LLM JSON output with fallback strategies
and normalizes each agent's response to a consistent schema.
"""

import json
import re
from typing import Any


def parse_json(raw_response: str, fallback: Any = None) -> Any:
    """
    Extract and parse JSON from LLM response.
    Handles markdown code blocks, trailing commas, and other common issues.

    Args:
        raw_response: Raw text from LLM
        fallback:     Value to return if parsing fails

    Returns:
        Parsed Python object or fallback value
    """
    if fallback is None:
        fallback = {}

    if not raw_response:
        return fallback

    text = raw_response.strip()

    # Remove markdown code blocks
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)

    # Find the first JSON structure
    json_match = re.search(r"[\[{]", text)
    if json_match:
        start = json_match.start()
        last_obj = text.rfind("}")
        last_arr = text.rfind("]")
        end = max(last_obj, last_arr)
        if end > start:
            text = text[start : end + 1]

    # Fix trailing commas
    text = re.sub(r",\s*([}\]])", r"\1", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"⚠️  JSON parse failed: {e}. Attempting recovery...")
        # Try to find any JSON-like structure
        match = re.search(r"\{[\s\S]*\}|\[[\s\S]*\]", text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError as e2:
                print(f"❌ JSON recovery failed: {e2}")

    return fallback


# ─── Normalizers ──────────────────────────────────────────────

def normalize_resume_review(data: dict) -> dict:
    """Normalize Resume Reviewer Agent response."""
    return {
        "resumeScore": min(100, max(0, int(data.get("resumeScore") or 70))),
        "strengths": list(data.get("strengths") or ["Good technical background"])[:6],
        "weaknesses": list(data.get("weaknesses") or ["Could be improved"])[:6],
        "improvements": list(data.get("improvements") or ["Add quantified achievements"])[:6],
    }


def normalize_skill_gap(data: dict) -> dict:
    """Normalize Skill Gap Analyzer response."""
    return {
        "matchedSkills": list(data.get("matchedSkills") or []),
        "missingSkills": list(data.get("missingSkills") or []),
        "matchPercentage": min(100, max(0, int(data.get("matchPercentage") or 0))),
        "allRequiredSkills": list(data.get("allRequiredSkills") or []),
    }


def normalize_ats_score(data: dict) -> dict:
    """Normalize ATS Score Agent response."""
    return {
        "atsScore": min(100, max(0, int(data.get("atsScore") or 65))),
        "issues": list(data.get("issues") or []),
        "recommendations": list(data.get("recommendations") or []),
        "keywordsFound": list(data.get("keywordsFound") or []),
        "keywordsMissing": list(data.get("keywordsMissing") or []),
    }


def normalize_career_roadmap(data: dict) -> dict:
    """Normalize Career Advisor Agent response."""
    def normalize_month(month: dict | None) -> dict:
        if not month:
            month = {}
        return {
            "focus": month.get("focus") or "Foundation Building",
            "topics": list(month.get("topics") or []),
            "tasks": list(month.get("tasks") or []),
            "resources": list(month.get("resources") or []),
        }

    return {
        "month1": normalize_month(data.get("month1")),
        "month2": normalize_month(data.get("month2")),
        "month3": normalize_month(data.get("month3")),
    }


def normalize_interview_questions(data: dict) -> dict:
    """Normalize Interview Coach Agent response."""
    def normalize_questions(arr: list | None) -> list:
        if not arr or not isinstance(arr, list):
            return []
        return [
            {
                "question": q.get("question") or "Question unavailable",
                "category": q.get("category") or "Technical",
                "hint": q.get("hint") or "Think step by step",
            }
            for q in arr
        ]

    return {
        "easy": normalize_questions(data.get("easy")),
        "medium": normalize_questions(data.get("medium")),
        "hard": normalize_questions(data.get("hard")),
    }


def normalize_rewritten_resume(data: dict) -> dict:
    """Normalize Resume Rewriter Agent response."""
    skills_section = data.get("improvedSkillsSection") or ""
    if isinstance(skills_section, dict):
        skills_section = " | ".join(
            f"{k}: {v}" for k, v in skills_section.items()
        )

    return {
        "professionalSummary": data.get("professionalSummary") or "",
        "improvedProjects": list(data.get("improvedProjects") or []),
        "improvedSkillsSection": skills_section,
        "additionalTips": list(data.get("additionalTips") or []),
    }


def normalize_learning_resources(data: list) -> list:
    """Normalize Learning Resource Generator response."""
    if not isinstance(data, list):
        return []
    return [
        {
            "skill": item.get("skill") or "Unknown Skill",
            "whatToLearn": item.get("whatToLearn") or "",
            "learningOrder": list(item.get("learningOrder") or []),
            "beginnerResources": list(item.get("beginnerResources") or []),
            "miniProjects": list(item.get("miniProjects") or []),
        }
        for item in data
    ]
