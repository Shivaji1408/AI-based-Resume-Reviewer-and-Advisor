const { callGroq } = require('../services/groqService');
const { parseJSON, normalizeInterviewQuestions } = require('../utils/responseParser');
const { RAGPipeline } = require('../rag/ragPipeline');

/**
 * AGENT 5: Interview Coach Agent
 *
 * Generates interview questions categorized by difficulty.
 * Returns: easy, medium, hard arrays of {question, category, hint}
 */
const runInterviewCoachAgent = async (ragPipeline, missingSkills, targetRole) => {
  console.log('\n🤖 Agent 5: Interview Coach running...');

  const resumeContext = await ragPipeline.retrieve(
    'projects experience achievements technical work',
    5,
    'resume'
  );
  const jdContext = await ragPipeline.retrieve(
    'responsibilities technical requirements role expectations',
    4,
    'jd'
  );

  const systemPrompt = `You are an expert Technical Interview Coach who has helped 500+ candidates land jobs at FAANG and top tech startups. You know exactly what interviewers look for at every level.`;

  const userPrompt = `Generate a comprehensive interview question bank for this candidate.

CANDIDATE PROFILE:
${RAGPipeline.truncate(resumeContext, 1500)}

JOB REQUIREMENTS:
${RAGPipeline.truncate(jdContext, 1000)}

AREAS TO FOCUS (gaps): ${missingSkills.slice(0, 6).join(', ')}
TARGET ROLE: ${targetRole}

Generate 5 questions per difficulty level:
- Easy: Basics, definitions, simple concepts (HR + fundamentals)
- Medium: Applied knowledge, design, problem solving
- Hard: System design, optimization, leadership, complex scenarios

Return ONLY a JSON object:
{
  "easy": [
    {"question": "...", "category": "HR", "hint": "..."},
    {"question": "...", "category": "Technical", "hint": "..."},
    {"question": "...", "category": "Project", "hint": "..."},
    {"question": "...", "category": "Technical", "hint": "..."},
    {"question": "...", "category": "HR", "hint": "..."}
  ],
  "medium": [
    {"question": "...", "category": "Technical", "hint": "..."},
    {"question": "...", "category": "Technical", "hint": "..."},
    {"question": "...", "category": "Project", "hint": "..."},
    {"question": "...", "category": "Technical", "hint": "..."},
    {"question": "...", "category": "HR", "hint": "..."}
  ],
  "hard": [
    {"question": "...", "category": "Technical", "hint": "..."},
    {"question": "...", "category": "Technical", "hint": "..."},
    {"question": "...", "category": "Project", "hint": "..."},
    {"question": "...", "category": "Technical", "hint": "..."},
    {"question": "...", "category": "HR", "hint": "..."}
  ]
}`;

  const raw = await callGroq(systemPrompt, userPrompt, { temperature: 0.5, maxTokens: 3000 });
  const parsed = parseJSON(raw, {});
  return normalizeInterviewQuestions(parsed);
};

module.exports = { runInterviewCoachAgent };
