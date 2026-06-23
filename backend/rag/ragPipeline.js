const { extractTextFromPDF } = require('./pdfLoader');
const { splitTextIntoChunks } = require('./textSplitter');
const { VectorStore } = require('./vectorStore');

/**
 * RAG Pipeline Orchestrator
 *
 * Pipeline:
 * PDF → Text Extraction → Chunking → Embeddings → FAISS → Retriever → LLM
 */
class RAGPipeline {
  constructor() {
    this.vectorStore = new VectorStore();
    this.resumeText = '';
    this.jdText = '';
    this.isReady = false;
  }

  /**
   * Initialize the RAG pipeline with resume and JD PDFs
   * @param {string} resumePath - Path to resume PDF
   * @param {string} jdPath - Path to job description PDF
   */
  async initialize(resumePath, jdPath) {
    console.log('\n🔄 Initializing RAG Pipeline...');
    this.vectorStore.clear();
    this.isReady = false;

    // Step 1: Extract text from PDFs
    console.log('📄 Step 1: Extracting text from PDFs...');
    this.resumeText = await extractTextFromPDF(resumePath);
    this.jdText = await extractTextFromPDF(jdPath);

    // Step 2: Chunk documents
    console.log('✂️  Step 2: Splitting text into chunks...');
    const resumeChunks = splitTextIntoChunks(this.resumeText, {
      chunkSize: 800,
      chunkOverlap: 150,
    });
    const jdChunks = splitTextIntoChunks(this.jdText, {
      chunkSize: 800,
      chunkOverlap: 150,
    });

    // Step 3 & 4: Generate embeddings and store in FAISS
    console.log('🧠 Steps 3-4: Generating embeddings and storing in vector store...');
    await this.vectorStore.addDocuments(resumeChunks, { source: 'resume' });
    await this.vectorStore.addDocuments(jdChunks, { source: 'jd' });

    this.isReady = true;
    console.log(`✅ RAG Pipeline ready! Vector store has ${this.vectorStore.size} chunks\n`);
  }

  /**
   * Retrieve relevant context for a query
   * @param {string} query - Search query
   * @param {number} topK - Number of chunks to retrieve
   * @param {string} source - 'resume', 'jd', or null for both
   * @returns {string} Concatenated relevant context
   */
  async retrieve(query, topK = 5, source = null) {
    if (!this.isReady) {
      throw new Error('RAG Pipeline not initialized. Call initialize() first.');
    }

    const results = await this.vectorStore.similaritySearch(query, topK, source);
    return results.map((r) => r.text).join('\n\n---\n\n');
  }

  /**
   * Get full resume text (for agents that need the complete document)
   */
  getResumeText() {
    return this.resumeText;
  }

  /**
   * Get full JD text
   */
  getJDText() {
    return this.jdText;
  }

  /**
   * Get truncated context (for token management)
   * @param {string} text - Full text
   * @param {number} maxChars - Max characters
   */
  static truncate(text, maxChars = 3000) {
    if (!text) return '';
    return text.length > maxChars ? text.substring(0, maxChars) + '...[truncated]' : text;
  }
}

module.exports = { RAGPipeline };
