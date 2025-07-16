import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1, // Maximum 1 file per request
  },
});

// Error handler for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB.',
        error: 'FILE_TOO_LARGE',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 1 file allowed.',
        error: 'TOO_MANY_FILES',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field.',
        error: 'UNEXPECTED_FILE',
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      message: error.message,
      error: 'INVALID_FILE_TYPE',
    });
  }
  
  next(error);
};

// File validation middleware
export const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No file uploaded.',
      error: 'NO_FILE',
    });
  }

  // Additional file validation can be added here
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
  
  if (req.file.size > maxSize) {
    return res.status(400).json({
      message: 'File too large. Maximum size is 5MB.',
      error: 'FILE_TOO_LARGE',
    });
  }

  next();
};

// Rate limiting for uploads (simple implementation)
const uploadAttempts = new Map();

export const uploadRateLimit = (req, res, next) => {
  const userId = req.user?._id || req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxAttempts = 5; // Maximum 5 uploads per minute

  if (!uploadAttempts.has(userId)) {
    uploadAttempts.set(userId, []);
  }

  const attempts = uploadAttempts.get(userId);
  const recentAttempts = attempts.filter(attempt => now - attempt < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      message: 'Upload rate limit exceeded. Please try again later.',
      error: 'RATE_LIMIT_EXCEEDED',
    });
  }

  recentAttempts.push(now);
  uploadAttempts.set(userId, recentAttempts);

  next();
};

export const uploadSingle = upload.single('file');
export default upload;
