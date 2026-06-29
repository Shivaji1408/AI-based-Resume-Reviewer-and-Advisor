"""
Text Splitter — Recursive Character Text Splitter
==================================================
Implements LangChain-style RecursiveCharacterTextSplitter
for chunking documents before embedding.

Config (per spec):
  Chunk Size:    1000
  Chunk Overlap: 200
"""

from typing import Optional


def split_text_into_chunks(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
    separators: Optional[list[str]] = None,
) -> list[str]:
    """
    Split text into overlapping chunks using recursive separators.

    Implements LangChain's RecursiveCharacterTextSplitter strategy:
    tries each separator in order until chunks are small enough.

    Args:
        text:          Full document text
        chunk_size:    Maximum characters per chunk (default 1000)
        chunk_overlap: Characters to overlap between chunks (default 200)
        separators:    List of separators to try (in order)

    Returns:
        List of text chunk strings
    """
    if separators is None:
        separators = ["\n\n", "\n", ". ", " ", ""]

    if not text or len(text) == 0:
        return []

    # If text fits in one chunk, return as-is
    if len(text) <= chunk_size:
        return [text.strip()]

    return _recursive_split(text, chunk_size, chunk_overlap, separators)


def _recursive_split(
    text: str,
    chunk_size: int,
    chunk_overlap: int,
    separators: list[str],
) -> list[str]:
    """Recursively split text using available separators."""
    final_chunks = []

    # Find the right separator to use
    separator = separators[-1]  # default: split by character
    for sep in separators:
        if sep == "" or sep in text:
            separator = sep
            break

    # Split by separator
    if separator:
        splits = text.split(separator)
    else:
        splits = list(text)

    # Merge splits back into chunks of the right size
    current_chunk = []
    current_length = 0

    for split in splits:
        split_len = len(split) + len(separator)

        if current_length + split_len > chunk_size and current_chunk:
            # Emit current chunk
            chunk_text = separator.join(current_chunk).strip()
            if chunk_text:
                final_chunks.append(chunk_text)

            # Start new chunk with overlap
            overlap_parts = []
            overlap_len = 0
            for part in reversed(current_chunk):
                if overlap_len + len(part) + len(separator) <= chunk_overlap:
                    overlap_parts.insert(0, part)
                    overlap_len += len(part) + len(separator)
                else:
                    break

            current_chunk = overlap_parts
            current_length = overlap_len

        current_chunk.append(split)
        current_length += split_len

    # Emit final chunk
    if current_chunk:
        chunk_text = separator.join(current_chunk).strip()
        if chunk_text:
            final_chunks.append(chunk_text)

    # If any chunk is still too large, split recursively with next separator
    result = []
    next_separators = separators[1:] if len(separators) > 1 else [""]
    for chunk in final_chunks:
        if len(chunk) > chunk_size and next_separators:
            result.extend(_recursive_split(chunk, chunk_size, chunk_overlap, next_separators))
        else:
            result.append(chunk)

    print(f"✅ Text split into {len(result)} chunks (size={chunk_size}, overlap={chunk_overlap})")
    return result
