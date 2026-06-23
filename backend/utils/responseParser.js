/**
 * Response Parser Utility
 * Safely parses LLM JSON output with multiple fallback strategies
 */

/**
 * Extract and parse JSON from LLM response
 * Handles markdown code blocks, trailing commas, and other common LLM formatting issues
 */
const parseJSON = (rawResponse, fallback = {}) => {
  if (!rawResponse) return fallback;

  let text = rawResponse.trim();

  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  // Find the first valid JSON structure (object or array)
  const jsonStart = text.search(/[\[{]/);
  const jsonEnd = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));

  if (jsonStart !== -1 && jsonEnd !== -1) {
    text = text.substring(jsonStart, jsonEnd + 1);
  }

  // Fix trailing commas (common LLM mistake)
  text = text.replace(/,\s*([}\]])/g, '$1');

  // Fix single quotes (some models use them)
  // Be careful not to replace apostrophes in strings
  // text = text.replace(/'/g, '"'); // Disabled as too aggressive

  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('⚠️  JSON parse failed, attempting recovery...', e.message);
    
    // Second attempt: try to find any JSON-like structure
    try {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch (e2) {
      console.error('❌ JSON recovery failed:', e2.message);
    }

    return fallback;
  }
};

/**
 * Validate and normalize resume review response
 */
const normalizeResumeReview = (data) => ({
  resumeScore: Math.min(100, Math.max(0, Number(data?.resumeScore) || 70)),
  strengths: Array.isArray(data?.strengths) ? data.strengths.slice(0, 6) : ['Good technical background'],
  weaknesses: Array.isArray(data?.weaknesses) ? data.weaknesses.slice(0, 6) : ['Could be improved'],
  improvements: Array.isArray(data?.improvements) ? data.improvements.slice(0, 6) : ['Add more quantified achievements'],
});

/**
 * Validate and normalize skill gap response
 */
const normalizeSkillGap = (data) => ({
  matchedSkills: Array.isArray(data?.matchedSkills) ? data.matchedSkills : [],
  missingSkills: Array.isArray(data?.missingSkills) ? data.missingSkills : [],
  matchPercentage: Math.min(100, Math.max(0, Number(data?.matchPercentage) || 0)),
  allRequiredSkills: Array.isArray(data?.allRequiredSkills) ? data.allRequiredSkills : [],
});

/**
 * Validate and normalize ATS score response
 */
const normalizeAtsScore = (data) => ({
  atsScore: Math.min(100, Math.max(0, Number(data?.atsScore) || 65)),
  issues: Array.isArray(data?.issues) ? data.issues : [],
  recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
  keywordsFound: Array.isArray(data?.keywordsFound) ? data.keywordsFound : [],
  keywordsMissing: Array.isArray(data?.keywordsMissing) ? data.keywordsMissing : [],
});

/**
 * Validate and normalize career roadmap response
 */
const normalizeCareerRoadmap = (data) => {
  const normalizeMonth = (month) => ({
    focus: month?.focus || 'Foundation Building',
    topics: Array.isArray(month?.topics) ? month.topics : [],
    tasks: Array.isArray(month?.tasks) ? month.tasks : [],
    resources: Array.isArray(month?.resources) ? month.resources : [],
  });

  return {
    month1: normalizeMonth(data?.month1),
    month2: normalizeMonth(data?.month2),
    month3: normalizeMonth(data?.month3),
  };
};

/**
 * Validate and normalize interview questions response
 */
const normalizeInterviewQuestions = (data) => {
  const normalizeQuestions = (arr) =>
    Array.isArray(arr)
      ? arr.map((q) => ({
          question: q?.question || 'Question unavailable',
          category: q?.category || 'Technical',
          hint: q?.hint || 'Think step by step',
        }))
      : [];

  return {
    easy: normalizeQuestions(data?.easy),
    medium: normalizeQuestions(data?.medium),
    hard: normalizeQuestions(data?.hard),
  };
};

/**
 * Validate and normalize rewritten resume response
 */
const normalizeRewrittenResume = (data) => {
  // AI sometimes returns improvedSkillsSection as an object like
  // { Frontend: 'React...', Backend: 'Node.js...' } instead of a string.
  // Convert it to a readable string if needed.
  let skillsSection = data?.improvedSkillsSection || '';
  if (skillsSection && typeof skillsSection === 'object') {
    skillsSection = Object.entries(skillsSection)
      .map(([category, skills]) => `${category}: ${skills}`)
      .join(' | ');
  }

  return {
    professionalSummary: data?.professionalSummary || '',
    improvedProjects: Array.isArray(data?.improvedProjects) ? data.improvedProjects : [],
    improvedSkillsSection: skillsSection,
    additionalTips: Array.isArray(data?.additionalTips) ? data.additionalTips : [],
  };
};


/**
 * Validate and normalize learning resources response
 */
const normalizeLearningResources = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    skill: item?.skill || 'Unknown Skill',
    whatToLearn: item?.whatToLearn || '',
    learningOrder: Array.isArray(item?.learningOrder) ? item.learningOrder : [],
    beginnerResources: Array.isArray(item?.beginnerResources) ? item.beginnerResources : [],
    miniProjects: Array.isArray(item?.miniProjects) ? item.miniProjects : [],
  }));
};

module.exports = {
  parseJSON,
  normalizeResumeReview,
  normalizeSkillGap,
  normalizeAtsScore,
  normalizeCareerRoadmap,
  normalizeInterviewQuestions,
  normalizeRewrittenResume,
  normalizeLearningResources,
};
