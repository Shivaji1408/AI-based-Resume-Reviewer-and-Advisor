const { callGroq } = require('../services/groqService');
const { parseJSON, normalizeCareerRoadmap } = require('../utils/responseParser');
const { RAGPipeline } = require('../rag/ragPipeline');

/**
 * AGENT 4: Career Advisor Agent
 *
 * Creates a personalized 3-month learning roadmap based on skill gaps.
 * Returns: month1, month2, month3 with focus, topics, tasks, resources
 */
const runCareerAdvisorAgent = async (ragPipeline, missingSkills, targetRole) => {
  console.log('\n🤖 Agent 4: Career Advisor running...');

  const resumeContext = await ragPipeline.retrieve(
    'current experience skills education background',
    4,
    'resume'
  );

  const systemPrompt = `You are a senior Career Advisor and Tech Mentor at a top tech company. You create personalized, realistic, and actionable 3-month roadmaps for software engineers looking to upskill. Your roadmaps are structured, progressive, and include specific resources.`;

  const userPrompt = `Create a 3-month personalized learning roadmap.

CANDIDATE BACKGROUND:
${RAGPipeline.truncate(resumeContext, 1500)}

MISSING SKILLS: ${missingSkills.slice(0, 8).join(', ')}
TARGET ROLE: ${targetRole}

Month 1: Foundation — Learn the most critical missing concepts
Month 2: Application — Build practical projects using new skills
Month 3: Mastery — Advanced topics, portfolio projects, job prep

Be specific with topics, tasks, and real resource names (e.g., "FreeCodeCamp", "Udemy - Complete React Course", "Official Docs").

Return ONLY a JSON object:
{
  "month1": {
    "focus": "Foundation in [main skill]",
    "topics": ["topic1", "topic2", "topic3"],
    "tasks": ["Complete X tutorial", "Build Y project", "Practice Z"],
    "resources": ["Resource 1 - Platform", "Resource 2 - URL/Book"]
  },
  "month2": {
    "focus": "Practical Application",
    "topics": ["topic1", "topic2", "topic3"],
    "tasks": ["task1", "task2", "task3"],
    "resources": ["resource1", "resource2"]
  },
  "month3": {
    "focus": "Advanced & Portfolio Ready",
    "topics": ["topic1", "topic2", "topic3"],
    "tasks": ["task1", "task2", "task3"],
    "resources": ["resource1", "resource2"]
  }
}`;

  const raw = await callGroq(systemPrompt, userPrompt, { temperature: 0.4, maxTokens: 3000 });
  const parsed = parseJSON(raw, {});
  return normalizeCareerRoadmap(parsed);
};

module.exports = { runCareerAdvisorAgent };
