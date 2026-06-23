const express = require('express');
const router = express.Router();
const {
  runAnalysis,
  getAnalysisStatus,
  getAnalysisById,
  getHistory,
  deleteAnalysis,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

// All analysis routes require authentication
router.use(protect);

router.post('/run', runAnalysis);
router.get('/history', getHistory);
router.get('/status/:id', getAnalysisStatus);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

module.exports = router;
