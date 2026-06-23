const { callGroq } = require('../services/groqService');
const { parseJSON, normalizeAtsScore } = require('../utils/responseParser');
const { RAGPipeline } = require('../rag/ragPipeline');

/**
 * AGENT 3: ATS Score Agent
 *
 * Simulates Applicant Tracking System analysis.
 * Returns: atsScore, issues, recommendations, keywordsFound, keywordsMissing
 */
const runAtsScoreAgent = async (ragPipeline) => {
  console.log('\n🤖 Agent 3: ATS Score Agent running...');

  const resumeContext = await ragPipeline.retrieve(
    'resume format sections contact information work experience education skills summary',
    8,
    'resume'
  );
  const jdContext = await ragPipeline.retrieve(
    'job requirements keywords technical skills qualifications',
    5,
    'jd'
  );

  const systemPrompt = `You are an ATS (Applicant Tracking System) expert who simulates how enterprise ATS software like Workday, Taleo, and Greenhouse parse and score resumes. You know all the tricks and pitfalls.`;

  const userPrompt = `Simulate ATS analysis on this resume for the given job description.

RESUME:
${RAGPipeline.truncate(resumeContext, 2500)}

JOB DESCRIPTION:
${RAGPipeline.truncate(jdContext, 1500)}

Evaluate these ATS criteria:
1. Keyword density: Does resume contain JD keywords?
2. Standard section headers: Summary, Experience, Education, Skills present?
3. Contact info: Name, email, phone, LinkedIn visible?
4. Date formatting: Consistent date formats?
5. File compatibility: No detected tables/graphics (text-based)?
6. Readability: Clear, concise language?
7. Action verbs: Strong verbs used (developed, implemented, led)?

Return ONLY a JSON object:
{
  "atsScore": <0-100>,
  "issues": ["issue1", "issue2", "issue3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "keywordsFound": ["found keyword1", "found keyword2"],
  "keywordsMissing": ["missing keyword1", "missing keyword2"]
}`;

  const raw = await callGroq(systemPrompt, userPrompt, { temperature: 0.1 });
  const parsed = parseJSON(raw, {});
  return normalizeAtsScore(parsed);
};

module.exports = { runAtsScoreAgent };
