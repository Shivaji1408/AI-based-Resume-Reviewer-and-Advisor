/**
 * Text Splitter for RAG Pipeline
 * Splits text into overlapping chunks for better embedding coverage
 */

/**
 * Split text into overlapping chunks
 * @param {string} text - Full document text
 * @param {object} options - Chunk options
 * @returns {string[]} Array of text chunks
 */
const splitTextIntoChunks = (text, options = {}) => {
  const {
    chunkSize = 1000,    // characters per chunk
    chunkOverlap = 200, // overlap between chunks
    separator = '\n',   // preferred split point
  } = options;

  if (!text || text.length === 0) return [];

  // If text is smaller than chunk size, return as-is
  if (text.length <= chunkSize) return [text];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Don't go beyond text length
    if (end >= text.length) {
      chunks.push(text.substring(start).trim());
      break;
    }

    // Try to break at a natural separator (newline or space)
    let breakPoint = text.lastIndexOf(separator, end);
    if (breakPoint <= start) {
      breakPoint = text.lastIndexOf(' ', end);
    }
    if (breakPoint <= start) {
      breakPoint = end;
    }

    const chunk = text.substring(start, breakPoint).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start forward with overlap
    start = breakPoint - chunkOverlap;
    if (start < 0) start = 0;
  }

  console.log(`✅ Text split into ${chunks.length} chunks`);
  return chunks;
};

module.exports = { splitTextIntoChunks };
