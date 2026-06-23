const { generateEmbedding, generateEmbeddings, cosineSimilarity } = require('./embeddings');

/**
 * In-memory FAISS-like Vector Store
 * Stores document chunks with their embeddings and supports similarity search
 * Note: For production, use actual faiss-node or a cloud vector DB
 */
class VectorStore {
  constructor() {
    this.documents = [];   // { id, text, embedding, metadata }
    this.dimension = 384;  // all-MiniLM-L6-v2 dimension
  }

  /**
   * Add documents to the vector store
   * @param {string[]} chunks - Text chunks to add
   * @param {object} metadata - Metadata for all chunks (e.g., source)
   */
  async addDocuments(chunks, metadata = {}) {
    const embeddings = await generateEmbeddings(chunks);

    chunks.forEach((text, i) => {
      this.documents.push({
        id: `${metadata.source || 'doc'}-${i}-${Date.now()}`,
        text,
        embedding: embeddings[i],
        metadata: { ...metadata, chunkIndex: i },
      });
    });

    console.log(`✅ VectorStore: ${this.documents.length} documents total`);
  }

  /**
   * Similarity search — finds top-k most relevant chunks
   * @param {string} query - Search query
   * @param {number} topK - Number of results
   * @param {string} sourceFilter - Optional: filter by source ('resume' or 'jd')
   * @returns {Promise<Array>} Top-k relevant chunks
   */
  async similaritySearch(query, topK = 5, sourceFilter = null) {
    if (this.documents.length === 0) return [];

    const queryEmbedding = await generateEmbedding(query);

    let docs = this.documents;
    if (sourceFilter) {
      docs = docs.filter((d) => d.metadata?.source === sourceFilter);
    }

    const scored = docs.map((doc) => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Get all documents from a specific source
   */
  getBySource(source) {
    return this.documents.filter((d) => d.metadata?.source === source);
  }

  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
  }

  get size() {
    return this.documents.length;
  }
}

module.exports = { VectorStore };
