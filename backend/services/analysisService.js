const { RAGPipeline } = require('../rag/ragPipeline');
const { runResumeReviewerAgent } = require('../agents/resumeReviewerAgent');
const { runSkillGapAgent } = require('../agents/skillGapAgent');
const { runAtsScoreAgent } = require('../agents/atsScoreAgent');
const { runCareerAdvisorAgent } = require('../agents/careerAdvisorAgent');
const { runInterviewCoachAgent } = require('../agents/interviewCoachAgent');
const { runResumeRewriterAgent } = require('../agents/resumeRewriterAgent');
const { runLearningResourceAgent } = require('../agents/learningResourceAgent');
const ResumeAnalysis = require('../models/ResumeAnalysis');

/**
 * Main Analysis Orchestrator Service
 *
 * Coordinates all 7 AI agents through the RAG pipeline
 */
const runFullAnalysis = async (analysisId, resumePath, jdPath, targetRole) => {
  const startTime = Date.now();

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting Full AI Analysis [${analysisId}]`);
    console.log(`📄 Resume: ${resumePath}`);
    console.log(`📋 JD: ${jdPath}`);
    console.log(`🎯 Target Role: ${targetRole}`);
    console.log(`${'='.repeat(60)}\n`);

    // Update status to processing
    await ResumeAnalysis.findByIdAndUpdate(analysisId, { status: 'processing' });

    // ─── STEP 1: Initialize RAG Pipeline ───────────────────────
    const ragPipeline = new RAGPipeline();
    await ragPipeline.initialize(resumePath, jdPath);

    // ─── STEP 2: Run Agents in Optimal Order ───────────────────
    // Agents 1, 2, 3 can run in parallel (all need RAG but are independent)
    console.log('\n🔄 Phase 1: Core Analysis (Agents 1-3)...');
    const [resumeReview, skillGap, atsAnalysis] = await Promise.all([
      runResumeReviewerAgent(ragPipeline),
      runSkillGapAgent(ragPipeline),
      runAtsScoreAgent(ragPipeline),
    ]);

    // Agents 4, 5, 6, 7 need missingSkills from Agent 2
    const { missingSkills } = skillGap;
    console.log(`\n✅ Phase 1 complete. Missing skills: ${missingSkills.join(', ')}`);

    // ─── STEP 3: Run Context-Dependent Agents ──────────────────
    console.log('\n🔄 Phase 2: Advanced Analysis (Agents 4-7)...');
    const [careerRoadmap, interviewQuestions, rewrittenResume, learningResources] = await Promise.all([
      runCareerAdvisorAgent(ragPipeline, missingSkills, targetRole),
      runInterviewCoachAgent(ragPipeline, missingSkills, targetRole),
      runResumeRewriterAgent(ragPipeline, targetRole),
      runLearningResourceAgent(missingSkills, targetRole),
    ]);

    // ─── STEP 4: Save Results to MongoDB ──────────────────────
    const processingTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n💾 Saving results to MongoDB... (${processingTime}s)`);

    const updatedAnalysis = await ResumeAnalysis.findByIdAndUpdate(
      analysisId,
      {
        status: 'completed',
        resumeReview,
        skillGap,
        atsAnalysis,
        careerRoadmap,
        interviewQuestions,
        rewrittenResume,
        learningResources,
        processingTime,
      },
      { new: true }
    );

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Analysis Complete! [${processingTime}s]`);
    console.log(`   Resume Score: ${resumeReview.resumeScore}`);
    console.log(`   ATS Score: ${atsAnalysis.atsScore}`);
    console.log(`   Match: ${skillGap.matchPercentage}%`);
    console.log(`${'='.repeat(60)}\n`);

    return updatedAnalysis;
  } catch (error) {
    console.error(`\n❌ Analysis failed: ${error.message}`);
    await ResumeAnalysis.findByIdAndUpdate(analysisId, {
      status: 'failed',
      errorMessage: error.message,
    });
    throw error;
  }
};

module.exports = { runFullAnalysis };
