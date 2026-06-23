const { callGroq } = require('../services/groqService');
const { parseJSON, normalizeRewrittenResume } = require('../utils/responseParser');
const { RAGPipeline } = require('../rag/ragPipeline');

/**
 * AGENT 6: Resume Rewriter Agent
 *
 * Rewrites key resume sections tailored to the target role.
 * Returns: professionalSummary, improvedProjects, improvedSkillsSection, additionalTips
 */
const runResumeRewriterAgent = async (ragPipeline, targetRole) => {
  console.log('\n🤖 Agent 6: Resume Rewriter running...');

  const resumeContext = await ragPipeline.retrieve(
    'professional summary objective projects experience skills achievements',
    8,
    'resume'
  );
  const jdContext = await ragPipeline.retrieve(
    'role expectations keywords preferred qualifications responsibilities',
    4,
    'jd'
  );

  const systemPrompt = `You are a Professional Resume Writer with expertise in crafting ATS-optimized, compelling resumes for top tech companies. You specialize in transforming ordinary resumes into powerful career documents. Use strong action verbs, quantify impact, and include relevant keywords.`;

  const userPrompt = `Rewrite key sections of this resume to be perfectly tailored for a ${targetRole} role.

ORIGINAL RESUME CONTENT:
${RAGPipeline.truncate(resumeContext, 2000)}

JOB REQUIREMENTS:
${RAGPipeline.truncate(jdContext, 1000)}

TARGET ROLE: ${targetRole}

Rewrite rules:
1. Professional Summary: 3-4 impactful sentences with role-specific keywords
2. Projects: Each description should start with an action verb, mention tech stack, and show impact
3. Skills: Organize by category (Frontend, Backend, Tools, Databases, etc.)
4. Additional Tips: Role-specific advice

Return ONLY a JSON object:
{
  "professionalSummary": "Dynamic software engineer with X years of experience...",
  "improvedProjects": [
    "Developed [Project] using [Tech Stack], achieving [impact/result]",
    "Built [Project] with [Tech Stack], reducing [metric] by X%",
    "Designed and implemented [Project] leveraging [Tech Stack] for [outcome]"
  ],
  "improvedSkillsSection": "Frontend: React, Redux, TypeScript | Backend: Node.js, Express | Database: MongoDB, PostgreSQL | Tools: Git, Docker",
  "additionalTips": [
    "Add a GitHub profile link with active repositories",
    "Quantify each achievement with metrics",
    "Include a link to a deployed project"
  ]
}`;

  const raw = await callGroq(systemPrompt, userPrompt, { temperature: 0.4, maxTokens: 3000 });
  const parsed = parseJSON(raw, {});
  return normalizeRewrittenResume(parsed);
};

module.exports = { runResumeRewriterAgent };
