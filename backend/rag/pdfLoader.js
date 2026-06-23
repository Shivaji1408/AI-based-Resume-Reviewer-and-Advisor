const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Extract text from a PDF file
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<string>} Extracted plain text
 */
const extractTextFromPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    let text = data.text || '';

    // Clean up extracted text
    text = text
      .replace(/\s+/g, ' ')          // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n')    // Max 2 consecutive newlines
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-ASCII characters
      .trim();

    if (!text || text.length < 50) {
      throw new Error('PDF appears to be empty or unreadable (possibly image-based)');
    }

    console.log(`✅ PDF extracted: ${text.length} characters from ${filePath}`);
    return text;
  } catch (error) {
    console.error(`❌ PDF extraction error: ${error.message}`);
    throw new Error(`Failed to extract PDF: ${error.message}`);
  }
};

module.exports = { extractTextFromPDF };
