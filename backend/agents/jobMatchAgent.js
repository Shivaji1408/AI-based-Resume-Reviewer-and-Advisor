const { callGroq } = require('../services/groqService');
const { parseJSON } = require('../utils/responseParser');
const { RAGPipeline } = require('../rag/ragPipeline');

/**
 * AGENT 7: Job Match Predictor
 *
 * Predicts the candidate's compatibility percentage with top tech company roles.
 * Analyzes skills, experience level, and profile against well-known job profiles.
 *
 * Returns:
 * {
 *   "predictions": [
 *     { "company": "Google SWE", "match": 72, "verdict": "Strong Candidate", "gap": "Need DSA mastery" },
 *     ...
 *   ]
 * }
 */
const runJobMatchAgent = async (ragPipeline, matchedSkills, missingSkills, resumeScore) => {
  console.log('\n🤖 Agent 7: Job Match Predictor running...');

  const resumeContext = await ragPipeline.retrieve(
    'experience years projects technologies skills education certifications achievements',
    6,
    'resume'
  );

  const systemPrompt = `You are a Senior Tech Recruiter and Career Intelligence System at a top executive search firm. 
You have placed 10,000+ engineers at Google, Amazon, Microsoft, Meta, and startups. 
You can accurately predict a candidate's compatibility with specific roles based on their profile.`;

  const userPrompt = `Predict this candidate's job match percentage for 5 different tech roles/companies.

CANDIDATE PROFILE:
${RAGPipeline.truncate(resumeContext, 2000)}

MATCHED SKILLS: ${matchedSkills.slice(0, 10).join(', ')}
MISSING SKILLS: ${missingSkills.slice(0, 8).join(', ')}
RESUME SCORE: ${resumeScore}/100

Evaluate compatibility with these 5 roles:
1. Google Software Engineer (SWE) — Requires: DSA mastery, system design, CS fundamentals, clean code
2. Amazon SDE (Software Development Engineer) — Requires: Leadership principles, scalable systems, OOP, AWS
3. Microsoft SWE — Requires: Azure, .NET/TypeScript/React, collaborative mindset, solid CS
4. Data Analyst — Requires: SQL, Python, Excel, visualization (Tableau/PowerBI), statistics
5. AI/ML Engineer — Requires: Python, ML frameworks (TensorFlow/PyTorch), math, research mindset

For each role, provide:
- Match percentage (0-100) based on skill alignment and profile quality
- A 3-word verdict: "Strong Candidate" | "Good Fit" | "Needs Work" | "Not Ready Yet"
- One specific key gap or strength (max 10 words)

Return ONLY a valid JSON object:
{
  "predictions": [
    {
      "company": "Google SWE",
      "logo": "🔍",
      "match": <0-100>,
      "verdict": "<Strong Candidate|Good Fit|Needs Work|Not Ready Yet>",
      "gap": "<specific gap or strength, max 10 words>"
    },
    {
      "company": "Amazon SDE",
      "logo": "📦",
      "match": <0-100>,
      "verdict": "<verdict>",
      "gap": "<gap>"
    },
    {
      "company": "Microsoft SWE",
      "logo": "🪟",
      "match": <0-100>,
      "verdict": "<verdict>",
      "gap": "<gap>"
    },
    {
      "company": "Data Analyst",
      "logo": "📊",
      "match": <0-100>,
      "verdict": "<verdict>",
      "gap": "<gap>"
    },
    {
      "company": "AI/ML Engineer",
      "logo": "🤖",
      "match": <0-100>,
      "verdict": "<verdict>",
      "gap": "<gap>"
    }
  ]
}`;

  const raw = await callGroq(systemPrompt, userPrompt, { temperature: 0.2 });
  const parsed = parseJSON(raw, {});
  return normalizeJobMatch(parsed);
};

/**
 * Normalize Job Match Predictor response
 */
const normalizeJobMatch = (data) => {
  const verdicts = ['Strong Candidate', 'Good Fit', 'Needs Work', 'Not Ready Yet'];
  const defaultPredictions = [
    { company: 'Google SWE', logo: '🔍' },
    { company: 'Amazon SDE', logo: '📦' },
    { company: 'Microsoft SWE', logo: '🪟' },
    { company: 'Data Analyst', logo: '📊' },
    { company: 'AI/ML Engineer', logo: '🤖' },
  ];

  const predictions = Array.isArray(data?.predictions) ? data.predictions : [];

  const normalized = defaultPredictions.map((def, i) => {
    const pred = predictions[i] || {};
    return {
      company: def.company,
      logo: def.logo,
      match: Math.min(100, Math.max(0, Number(pred.match) || 50)),
      verdict: verdicts.includes(pred.verdict) ? pred.verdict : 'Needs Work',
      gap: pred.gap || 'Analyze your skill gaps above',
    };
  });

  return { predictions: normalized };
};

module.exports = { runJobMatchAgent };
