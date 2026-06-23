const { callGroq } = require('../services/groqService');
const { parseJSON, normalizeResumeReview } = require('../utils/responseParser');
const { RAGPipeline } = require('../rag/ragPipeline');

/**
 * AGENT 1: Resume Reviewer Agent
 *
 * Analyzes resume quality against the job description.
 * Returns: resumeScore, strengths, weaknesses, improvements
 */
const runResumeReviewerAgent = async (ragPipeline) => {
  console.log('\n🤖 Agent 1: Resume Reviewer running...');

  // Retrieve relevant chunks from both resume and JD
  const resumeContext = await ragPipeline.retrieve(
    'professional experience skills projects achievements education',
    6,
    'resume'
  );
  const jdContext = await ragPipeline.retrieve(
    'required qualifications skills experience responsibilities',
    4,
    'jd'
  );

  const systemPrompt = `You are an expert Resume Reviewer with 15+ years of experience in HR and talent acquisition for top tech companies. You provide honest, actionable feedback.`;

  const userPrompt = `Analyze this resume against the job description.

RESUME CONTENT:
${RAGPipeline.truncate(resumeContext, 2500)}

JOB DESCRIPTION:
${RAGPipeline.truncate(jdContext, 1500)}

Evaluate:
1. Content quality and job relevance
2. Achievement quantification (numbers, percentages, impact)
3. Keyword optimization for the role
4. Structural clarity and professionalism
5. Overall marketability

Return ONLY a JSON object:
{
  "resumeScore": <0-100>,
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "improvements": ["specific improvement1", "specific improvement2", "specific improvement3", "specific improvement4"]
}`;

  const raw = await callGroq(systemPrompt, userPrompt, { temperature: 0.2 });
  const parsed = parseJSON(raw, {});
  return normalizeResumeReview(parsed);
};

module.exports = { runResumeReviewerAgent };
