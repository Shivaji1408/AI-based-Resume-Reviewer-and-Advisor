const { callGroqForArray } = require('../services/groqService');
const { normalizeLearningResources } = require('../utils/responseParser');

/**
 * AGENT 7: Learning Resource Generator
 *
 * For each missing skill, generates a personalized learning guide.
 * Returns: array of {skill, whatToLearn, learningOrder, beginnerResources, miniProjects}
 */
const runLearningResourceAgent = async (missingSkills, targetRole) => {
  console.log('\n🤖 Agent 7: Learning Resource Generator running...');

  // Limit to top 5 skills to avoid token overflow
  const topSkills = missingSkills.slice(0, 5);

  const systemPrompt = `You are a Tech Education Expert and curriculum designer who has built learning paths for 10,000+ developers. You know the best free and paid resources for every tech skill. Your learning paths are progressive, practical, and project-focused.`;

  const userPrompt = `Create detailed learning guides for these missing skills for a ${targetRole} role.

MISSING SKILLS: ${topSkills.join(', ')}

For each skill provide:
- whatToLearn: Brief explanation of what the skill is and why it matters for ${targetRole}
- learningOrder: Progressive steps from beginner to intermediate (4-5 steps)
- beginnerResources: 3 specific resources (name + platform, e.g., "The Odin Project - theodinproject.com", "freeCodeCamp React Course", "Udemy - React 18 Complete Guide")
- miniProjects: 3 practical project ideas to build with this skill

Wrap your response in {"data": [...]}

Return ONLY a JSON object containing a "data" array:
{
  "data": [
    {
      "skill": "Docker",
      "whatToLearn": "Docker is a containerization platform...",
      "learningOrder": ["Step 1: Understand containers vs VMs", "Step 2: Install Docker and run first container", "Step 3: Write Dockerfiles", "Step 4: Docker Compose for multi-container apps"],
      "beginnerResources": ["Docker Official Tutorial - docs.docker.com/get-started", "TechWorld with Nana - Docker Crash Course (YouTube)", "Udemy - Docker & Kubernetes: The Practical Guide"],
      "miniProjects": ["Containerize a Node.js REST API", "Docker Compose for MERN Stack app", "Build a CI/CD pipeline with Docker"]
    }
  ]
}`;

  const result = await callGroqForArray(systemPrompt, userPrompt, { temperature: 0.4, maxTokens: 4000 });
  return normalizeLearningResources(result);
};

module.exports = { runLearningResourceAgent };
