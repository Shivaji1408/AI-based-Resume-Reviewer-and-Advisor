const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter — only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Middleware for uploading both files
const uploadFiles = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescription', maxCount: 1 },
]);

/**
 * @route   POST /api/upload
 * @access  Private
 * @desc    Upload Resume PDF and Job Description PDF
 */
const uploadPDFs = asyncHandler(async (req, res) => {
  if (!req.files?.resume || !req.files?.jobDescription) {
    res.status(400);
    throw new Error('Both resume and job description PDF files are required');
  }

  const resumeFile = req.files.resume[0];
  const jdFile = req.files.jobDescription[0];

  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully',
    files: {
      resume: {
        filename: resumeFile.filename,
        originalName: resumeFile.originalname,
        size: resumeFile.size,
        path: resumeFile.path,
      },
      jobDescription: {
        filename: jdFile.filename,
        originalName: jdFile.originalname,
        size: jdFile.size,
        path: jdFile.path,
      },
    },
  });
});

module.exports = { uploadFiles, uploadPDFs };
