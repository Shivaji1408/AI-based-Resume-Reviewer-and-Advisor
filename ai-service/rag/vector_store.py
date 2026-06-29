"""
Vector Store — FAISS-backed Document Store
==========================================
Stores document chunks with embeddings and supports
similarity search using FAISS (Facebook AI Similarity Search).

Dimension: 384 (all-MiniLM-L6-v2)
Index Type: IndexFlatIP (inner product on normalized vectors = cosine similarity)
"""

import numpy as np
import faiss
from dataclasses import dataclass, field
from typing import Optional

from .embeddings import generate_embedding, generate_embeddings


@dataclass
class Document:
    """A single stored document chunk."""
    id: str
    text: str
    embedding: list[float]
    source: str  # 'resume' or 'jd'
    chunk_index: int


class VectorStore:
    """
    FAISS-backed vector store for RAG retrieval.

    Uses IndexFlatIP (cosine similarity on L2-normalized vectors).
    Supports source-filtered similarity search.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.documents: list[Document] = []
        self._faiss_index = faiss.IndexFlatIP(dimension)  # Inner product (cosine on normalized)
        self._doc_id_map: list[int] = []  # maps faiss index → document index

    def add_documents(self, chunks: list[str], source: str = "doc") -> None:
        """
        Add text chunks to the vector store.

        Args:
            chunks: List of text chunk strings
            source: Source identifier ('resume' or 'jd')
        """
        if not chunks:
            return

        embeddings = generate_embeddings(chunks)
        embeddings_np = np.array(embeddings, dtype=np.float32)

        start_doc_idx = len(self.documents)

        for i, (text, embedding) in enumerate(zip(chunks, embeddings)):
            doc = Document(
                id=f"{source}-{i}-{len(self.documents)}",
                text=text,
                embedding=embedding,
                source=source,
                chunk_index=i,
            )
            self.documents.append(doc)
            self._doc_id_map.append(start_doc_idx + i)

        # Add to FAISS index
        self._faiss_index.add(embeddings_np)

        print(f"✅ VectorStore: {len(self.documents)} documents total ({source}: +{len(chunks)})")

    def similarity_search(
        self,
        query: str,
        top_k: int = 5,
        source_filter: Optional[str] = None,
    ) -> list[Document]:
        """
        Find the top-k most relevant chunks for a query.

        Args:
            query:         Search query text
            top_k:         Number of results to return
            source_filter: Optional filter ('resume' or 'jd')

        Returns:
            List of Document objects sorted by relevance
        """
        if not self.documents:
            return []

        query_embedding = generate_embedding(query)
        query_np = np.array([query_embedding], dtype=np.float32)

        if source_filter:
            # Filter documents by source and search only those
            filtered_docs = [
                (i, doc) for i, doc in enumerate(self.documents)
                if doc.source == source_filter
            ]

            if not filtered_docs:
                return []

            # Build a temporary index for filtered docs
            filtered_embeddings = np.array(
                [doc.embedding for _, doc in filtered_docs], dtype=np.float32
            )
            temp_index = faiss.IndexFlatIP(self.dimension)
            temp_index.add(filtered_embeddings)

            k = min(top_k, len(filtered_docs))
            scores, indices = temp_index.search(query_np, k)

            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0:
                    original_idx, doc = filtered_docs[idx]
                    results.append(doc)
            return results

        else:
            # Search all documents
            k = min(top_k, len(self.documents))
            scores, indices = self._faiss_index.search(query_np, k)

            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0:
                    results.append(self.documents[idx])
            return results

    def get_by_source(self, source: str) -> list[Document]:
        """Get all documents from a specific source."""
        return [doc for doc in self.documents if doc.source == source]

    def clear(self) -> None:
        """Clear all documents and reset FAISS index."""
        self.documents = []
        self._faiss_index = faiss.IndexFlatIP(self.dimension)
        self._doc_id_map = []

    @property
    def size(self) -> int:
        return len(self.documents)
