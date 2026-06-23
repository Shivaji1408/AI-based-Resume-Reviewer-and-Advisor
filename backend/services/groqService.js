const Groq = require('groq-sdk');



/**
 * Get or create Groq client (singleton)
 */
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Call Groq LLM with a prompt
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User message / prompt with context
 * @param {object} options - Optional overrides
 * @returns {Promise<string>} Raw LLM text response
 */
const callGroq = async (systemPrompt, userPrompt, options = {}) => {
  const client = getGroqClient();

  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.3,
    maxTokens = 4096,
  } = options;

  try {
    const response = await client.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '';
    return content;
  } catch (error) {
    console.error(`❌ Groq API Error: ${error.message}`);
    throw new Error(`Groq API call failed: ${error.message}`);
  }
};

/**
 * Call Groq for array responses (JSON array, not object)
 * Falls back to json_object if array not supported
 */
const callGroqForArray = async (systemPrompt, userPrompt, options = {}) => {
  const client = getGroqClient();

  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.3,
    maxTokens = 4096,
  } = options;

  // Wrap in object for json_object response format
  const wrappedSystemPrompt = systemPrompt + '\n\nIMPORTANT: Wrap your JSON array in an object: {"data": [...]}';

  try {
    const response = await client.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: wrappedSystemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{"data":[]}';
    const parsed = JSON.parse(content);
    return parsed.data || parsed;
  } catch (error) {
    console.error(`❌ Groq Array API Error: ${error.message}`);
    throw new Error(`Groq API call failed: ${error.message}`);
  }
};

module.exports = { callGroq, callGroqForArray };
