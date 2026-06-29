"""
Embeddings — Sentence Transformers (all-MiniLM-L6-v2)
======================================================
Generates 384-dimensional dense embeddings for text chunks.
Uses HuggingFace Sentence Transformers — no API key required.

Model: all-MiniLM-L6-v2
Dimensions: 384
"""

import os
import numpy as np
from sentence_transformers import SentenceTransformer

# ─── Singleton Model ──────────────────────────────────────────
_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    """
    Load the Sentence Transformer model (lazy singleton).
    Downloads model on first call, cached locally afterwards.
    """
    global _model
    if _model is None:
        model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        print(f"⏳ Loading embedding model: {model_name} (first time may take 30-60s)...")
        _model = SentenceTransformer(model_name)
        print(f"✅ Embedding model loaded: {model_name}")
    return _model


def generate_embedding(text: str) -> list[float]:
    """
    Generate a 384-dimensional embedding vector for a single text.

    Args:
        text: Input text string

    Returns:
        List of 384 floats (normalized embedding vector)
    """
    model = get_embedding_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for multiple texts (batch processing).

    Args:
        texts: List of text strings

    Returns:
        List of 384-dimensional embedding vectors
    """
    if not texts:
        return []

    model = get_embedding_model()
    print(f"⏳ Generating embeddings for {len(texts)} chunks...")

    # Batch encode for efficiency
    embeddings = model.encode(
        texts,
        batch_size=32,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    print(f"✅ Generated {len(embeddings)} embeddings (dim={embeddings.shape[1]})")
    return embeddings.tolist()


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Compute cosine similarity between two normalized vectors.

    Args:
        vec_a: First embedding vector
        vec_b: Second embedding vector

    Returns:
        Similarity score in [-1, 1] range (1 = identical)
    """
    a = np.array(vec_a)
    b = np.array(vec_b)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))
