"""
Groq Service — LLM Inference via Groq API
==========================================
Provides a unified interface for calling the Groq Llama model.
"""

import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client: Groq | None = None


def get_groq_client() -> Groq:
    """Get or create the Groq client (singleton)."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        _client = Groq(api_key=api_key)
    return _client


async def call_groq(
    system_prompt: str,
    user_prompt: str,
    model: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> str:
    """
    Call the Groq LLM and return the raw text response.

    Args:
        system_prompt: System instructions (role + behavior)
        user_prompt:   User message with context
        model:         Groq model ID (defaults to env var)
        temperature:   Sampling temperature
        max_tokens:    Max tokens to generate

    Returns:
        Raw LLM text response string
    """
    client = get_groq_client()
    model = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )

    return response.choices[0].message.content or ""


async def call_groq_for_list(
    system_prompt: str,
    user_prompt: str,
    model: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> list:
    """
    Call Groq for array-style responses.
    Wraps the array in an object since Groq requires json_object format.

    Returns:
        Python list from the LLM response
    """
    wrapped_system = system_prompt + '\n\nIMPORTANT: Wrap your JSON array in an object: {"data": [...]}'
    raw = await call_groq(wrapped_system, user_prompt, model, temperature, max_tokens)

    try:
        parsed = json.loads(raw)
        return parsed.get("data", parsed) if isinstance(parsed, dict) else parsed
    except json.JSONDecodeError:
        return []
