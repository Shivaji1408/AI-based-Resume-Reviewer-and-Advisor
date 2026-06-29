"""
RAG Pipeline — Complete Retrieval-Augmented Generation Pipeline
================================================================

Full pipeline:
  PDF → Text Extraction → Chunking → Embeddings → FAISS → Retrieval → LLM

Config (per spec):
  Chunk Size:    1000 characters
  Chunk Overlap: 200 characters
  Model:         all-MiniLM-L6-v2 (384 dimensions)
"""

from typing import Optional

from .pdf_loader import extract_text_from_pdf
from .text_splitter import split_text_into_chunks
from .vector_store import VectorStore

# Spec-defined chunk parameters
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


class RAGPipeline:
    """
    Orchestrates the complete RAG pipeline for resume analysis.

    Usage:
        rag = RAGPipeline()
        await rag.initialize(resume_path, jd_path)
        context = await rag.retrieve("skills experience", top_k=5, source="resume")
    """

    def __init__(self):
        self.vector_store = VectorStore(dimension=384)
        self.resume_text: str = ""
        self.jd_text: str = ""
        self.is_ready: bool = False

    async def initialize(self, resume_path: str, jd_path: str) -> None:
        """
        Initialize the RAG pipeline with resume and JD PDFs.

        Args:
            resume_path: Path to resume PDF file
            jd_path:     Path to job description PDF file
        """
        print("\n🔄 Initializing RAG Pipeline...")
        self.vector_store.clear()
        self.is_ready = False

        # ─── Step 1: Extract text from PDFs ──────────────────
        print("📄 Step 1: Extracting text from PDFs...")
        self.resume_text = extract_text_from_pdf(resume_path)
        self.jd_text = extract_text_from_pdf(jd_path)

        # ─── Step 2: Chunk documents ──────────────────────────
        print("✂️  Step 2: Splitting text into chunks...")
        resume_chunks = split_text_into_chunks(
            self.resume_text,
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )
        jd_chunks = split_text_into_chunks(
            self.jd_text,
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )

        # ─── Steps 3 & 4: Generate embeddings → FAISS ────────
        print("🧠 Steps 3-4: Generating embeddings and storing in FAISS...")
        self.vector_store.add_documents(resume_chunks, source="resume")
        self.vector_store.add_documents(jd_chunks, source="jd")

        self.is_ready = True
        print(f"✅ RAG Pipeline ready! Vector store has {self.vector_store.size} chunks\n")

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        source: Optional[str] = None,
    ) -> str:
        """
        Retrieve relevant context for a query.

        Args:
            query:  Search query string
            top_k:  Number of chunks to retrieve
            source: Filter by 'resume', 'jd', or None for both

        Returns:
            Concatenated relevant context as a single string
        """
        if not self.is_ready:
            raise RuntimeError("RAG Pipeline not initialized. Call initialize() first.")

        docs = self.vector_store.similarity_search(query, top_k=top_k, source_filter=source)
        return "\n\n---\n\n".join(doc.text for doc in docs)

    def get_resume_text(self) -> str:
        """Get the full resume text."""
        return self.resume_text

    def get_jd_text(self) -> str:
        """Get the full JD text."""
        return self.jd_text

    @staticmethod
    def truncate(text: str, max_chars: int = 3000) -> str:
        """
        Truncate text for token budget management.

        Args:
            text:      Input text
            max_chars: Maximum characters allowed

        Returns:
            Truncated text with '[truncated]' suffix if needed
        """
        if not text:
            return ""
        if len(text) <= max_chars:
            return text
        return text[:max_chars] + "...[truncated]"
