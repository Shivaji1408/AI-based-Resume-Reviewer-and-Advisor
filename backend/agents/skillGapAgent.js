const { callGroq } = require('../services/groqService');
const { parseJSON, normalizeSkillGap } = require('../utils/responseParser');
const { RAGPipeline } = require('../rag/ragPipeline');

/**
 * AGENT 2: Skill Gap Analyzer
 *
 * Compares resume skills vs job description requirements.
 * Returns: matchedSkills, missingSkills, matchPercentage
 */
const runSkillGapAgent = async (ragPipeline) => {
  console.log('\n🤖 Agent 2: Skill Gap Analyzer running...');

  const resumeContext = await ragPipeline.retrieve(
    'technical skills programming languages frameworks tools technologies databases',
    6,
    'resume'
  );
  const jdContext = await ragPipeline.retrieve(
    'required skills must have technologies programming languages frameworks tools',
    6,
    'jd'
  );

  const systemPrompt = `You are a Technical Skill Gap Analyzer specializing in software engineering, data science, and AI roles. You excel at extracting and comparing technical and soft skills from resumes and job descriptions.`;

  const userPrompt = `Extract ALL skills from both documents and compare them.

RESUME:
${RAGPipeline.truncate(resumeContext, 2000)}

JOB DESCRIPTION:
${RAGPipeline.truncate(jdContext, 2000)}

Instructions:
- Extract all technical skills (languages, frameworks, tools, cloud, databases)
- Extract all soft skills (communication, leadership, teamwork)
- Identify which skills the candidate has vs what the job needs
- Calculate match percentage based on required skills covered

Return ONLY a JSON object:
{
  "matchedSkills": ["React", "Node.js", "MongoDB"],
  "missingSkills": ["Docker", "Kubernetes", "AWS"],
  "matchPercentage": <0-100>,
  "allRequiredSkills": ["all skills from JD"]
}`;

  const raw = await callGroq(systemPrompt, userPrompt, { temperature: 0.1 });
  const parsed = parseJSON(raw, {});
  return normalizeSkillGap(parsed);
};

module.exports = { runSkillGapAgent };
