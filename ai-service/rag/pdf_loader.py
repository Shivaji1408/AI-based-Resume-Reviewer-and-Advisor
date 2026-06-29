"""
PDF Loader — Extract text from PDF files
=========================================
Uses pypdf for text extraction with multi-page support.
"""

import re
from pathlib import Path
from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract plain text from a PDF file.

    Args:
        file_path: Absolute or relative path to the PDF file

    Returns:
        Cleaned extracted text string

    Raises:
        FileNotFoundError: If the PDF doesn't exist
        ValueError: If the PDF is empty or unreadable
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    reader = PdfReader(str(path))

    if len(reader.pages) == 0:
        raise ValueError(f"PDF has no pages: {file_path}")

    # Extract text from all pages
    raw_text = ""
    for page_num, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        raw_text += page_text + "\n"

    # ─── Clean extracted text ─────────────────────────────────
    text = raw_text

    # Normalize whitespace
    text = re.sub(r"[ \t]+", " ", text)

    # Max 2 consecutive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Remove non-printable characters (keep ASCII printable + newlines)
    text = re.sub(r"[^\x20-\x7E\n]", "", text)

    text = text.strip()

    if not text or len(text) < 50:
        raise ValueError(
            f"PDF appears to be empty or unreadable (possibly image-based): {file_path}"
        )

    print(f"✅ PDF extracted: {len(text)} characters from {path.name} ({len(reader.pages)} pages)")
    return text
