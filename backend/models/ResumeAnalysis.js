const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeFile: {
      type: String,
      required: true,
    },
    jdFile: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
      default: 'Software Developer',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

    // Feature 1: Resume Reviewer Agent
    resumeReview: {
      resumeScore: { type: Number, default: 0 },
      strengths: [String],
      weaknesses: [String],
      improvements: [String],
    },

    // Feature 2: Skill Gap Analyzer
    skillGap: {
      matchedSkills: [String],
      missingSkills: [String],
      matchPercentage: { type: Number, default: 0 },
      allRequiredSkills: [String],
    },

    // Feature 3: ATS Score Agent
    atsAnalysis: {
      atsScore: { type: Number, default: 0 },
      issues: [String],
      recommendations: [String],
      keywordsFound: [String],
      keywordsMissing: [String],
    },

    // Feature 4: Career Advisor Agent
    careerRoadmap: {
      month1: {
        focus: String,
        topics: [String],
        tasks: [String],
        resources: [String],
      },
      month2: {
        focus: String,
        topics: [String],
        tasks: [String],
        resources: [String],
      },
      month3: {
        focus: String,
        topics: [String],
        tasks: [String],
        resources: [String],
      },
    },

    // Feature 5: Interview Coach Agent
    interviewQuestions: {
      easy: [{
        question: String,
        category: String,
        hint: String,
      }],
      medium: [{
        question: String,
        category: String,
        hint: String,
      }],
      hard: [{
        question: String,
        category: String,
        hint: String,
      }],
    },

    // Feature 6: Resume Rewriter
    rewrittenResume: {
      professionalSummary: String,
      improvedProjects: [String],
      improvedSkillsSection: String,
      additionalTips: [String],
    },

    // Feature 7: Learning Resources
    learningResources: [{
      skill: String,
      whatToLearn: String,
      learningOrder: [String],
      beginnerResources: [String],
      miniProjects: [String],
    }],

    // Feature 8: Job Match Predictor
    jobMatch: {
      predictions: [{
        company: String,
        logo: String,
        match: { type: Number, default: 0 },
        verdict: String,
        gap: String,
      }],
    },

    // Metadata
    processingTime: {
      type: Number, // in seconds
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
