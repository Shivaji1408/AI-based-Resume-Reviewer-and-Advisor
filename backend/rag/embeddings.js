let pipeline = null;

/**
 * Load the embedding model (lazy singleton)
 * Uses @xenova/transformers - runs locally via ONNX, no API key needed
 */
const getEmbeddingPipeline = async () => {
  if (pipeline) return pipeline;

  console.log('⏳ Loading embedding model (first time may take 30-60 seconds)...');

  // Dynamic import (ESM module)
  const { pipeline: createPipeline } = await import('@xenova/transformers');

  pipeline = await createPipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    { revision: 'main' }
  );

  console.log('✅ Embedding model loaded: all-MiniLM-L6-v2');
  return pipeline;
};

/**
 * Generate embedding vector for a single text
 * @param {string} text - Input text
 * @returns {Promise<number[]>} 384-dimensional embedding vector
 */
const generateEmbedding = async (text) => {
  const embeddingPipeline = await getEmbeddingPipeline();
  const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Array of text chunks
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
const generateEmbeddings = async (texts) => {
  console.log(`⏳ Generating embeddings for ${texts.length} chunks...`);
  const embeddings = [];

  for (let i = 0; i < texts.length; i++) {
    const embedding = await generateEmbedding(texts[i]);
    embeddings.push(embedding);

    if ((i + 1) % 5 === 0) {
      console.log(`  Progress: ${i + 1}/${texts.length} embeddings`);
    }
  }

  console.log(`✅ Generated ${embeddings.length} embeddings`);
  return embeddings;
};

/**
 * Compute cosine similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
};

module.exports = { generateEmbedding, generateEmbeddings, cosineSimilarity };
