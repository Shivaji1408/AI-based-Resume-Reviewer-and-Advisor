const asyncHandler = require('express-async-handler');
const path = require('path');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/User');
const { runFullAnalysis } = require('../services/analysisService');

/**
 * @route   POST /api/analysis/run
 * @access  Private
 * @desc    Start a new full AI analysis
 */
const runAnalysis = asyncHandler(async (req, res) => {
  const { resumeFilename, jdFilename, targetRole } = req.body;

  if (!resumeFilename || !jdFilename) {
    res.status(400);
    throw new Error('Resume and job description filenames are required');
  }

  const resumePath = path.join(__dirname, '../uploads', resumeFilename);
  const jdPath = path.join(__dirname, '../uploads', jdFilename);

  const role = targetRole || 'Software Developer';

  // Create initial analysis record
  const analysis = await ResumeAnalysis.create({
    userId: req.user._id,
    resumeFile: resumeFilename,
    jdFile: jdFilename,
    targetRole: role,
    status: 'pending',
  });

  // Increment user's analysis count
  await User.findByIdAndUpdate(req.user._id, { $inc: { analysisCount: 1 } });

  // Run full analysis (async — don't await for fast response)
  runFullAnalysis(analysis._id, resumePath, jdPath, role).catch((err) => {
    console.error(`Background analysis error [${analysis._id}]: ${err.message}`);
  });

  res.status(202).json({
    success: true,
    message: 'Analysis started. Check status using the analysis ID.',
    analysisId: analysis._id,
    status: 'processing',
  });
});

/**
 * @route   GET /api/analysis/status/:id
 * @access  Private
 * @desc    Check analysis status
 */
const getAnalysisStatus = asyncHandler(async (req, res) => {
  const analysis = await ResumeAnalysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).select('status processingTime errorMessage createdAt');

  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }

  res.json({
    success: true,
    analysisId: analysis._id,
    status: analysis.status,
    processingTime: analysis.processingTime,
    errorMessage: analysis.errorMessage,
    createdAt: analysis.createdAt,
  });
});

/**
 * @route   GET /api/analysis/:id
 * @access  Private
 * @desc    Get full analysis results
 */
const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await ResumeAnalysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }

  if (analysis.status === 'processing' || analysis.status === 'pending') {
    return res.json({
      success: true,
      status: analysis.status,
      message: 'Analysis is still in progress. Please wait...',
      analysisId: analysis._id,
    });
  }

  if (analysis.status === 'failed') {
    return res.json({
      success: false,
      status: 'failed',
      message: 'Analysis failed',
      error: analysis.errorMessage,
      analysisId: analysis._id,
    });
  }

  res.json({
    success: true,
    status: 'completed',
    data: analysis,
  });
});

/**
 * @route   GET /api/analysis/history
 * @access  Private
 * @desc    Get user's analysis history
 */
const getHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    ResumeAnalysis.find({ userId: req.user._id })
      .select('targetRole status resumeReview.resumeScore atsAnalysis.atsScore skillGap.matchPercentage processingTime createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ResumeAnalysis.countDocuments({ userId: req.user._id }),
  ]);

  res.json({
    success: true,
    data: analyses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @route   DELETE /api/analysis/:id
 * @access  Private
 * @desc    Delete an analysis
 */
const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await ResumeAnalysis.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }

  res.json({ success: true, message: 'Analysis deleted' });
});

module.exports = { runAnalysis, getAnalysisStatus, getAnalysisById, getHistory, deleteAnalysis };
