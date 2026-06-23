const express = require('express');
const router = express.Router();
const { uploadFiles, uploadPDFs } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, uploadFiles, uploadPDFs);

module.exports = router;
