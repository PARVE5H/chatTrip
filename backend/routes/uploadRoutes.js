import express from 'express';
import { uploadSingle, handleUploadError, validateFile, uploadRateLimit } from '../middlewares/uploadMiddleware.js';
import { uploadToCloudinary, generateUploadSignature } from '../config/cloudinary.js';
import protect from '../middlewares/authMiddlewares.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Upload file endpoint
router.post(
  '/image',
  protect,
  uploadRateLimit,
  uploadSingle,
  handleUploadError,
  validateFile,
  asyncHandler(async (req, res) => {
    try {
      // Convert buffer to base64 data URL for Cloudinary
      const fileBuffer = req.file.buffer;
      const base64Data = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(base64Data, 'chat-app/avatars', {
        transformation: [
          { width: 300, height: 300, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });

      if (!result.success) {
        return res.status(500).json({
          message: 'Failed to upload image to cloud storage',
          error: result.error,
        });
      }

      res.json({
        message: 'Image uploaded successfully',
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        message: 'Internal server error during upload',
        error: error.message,
      });
    }
  })
);

// Generate upload signature for direct uploads (more secure)
router.post(
  '/signature',
  protect,
  uploadRateLimit,
  asyncHandler(async (req, res) => {
    try {
      const { folder = 'chat-app/avatars', transformation } = req.body;
      
      const params = {
        folder,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        ...(transformation && { transformation }),
      };

      const signature = generateUploadSignature(params);
      
      res.json({
        message: 'Upload signature generated',
        ...signature,
        params,
      });
    } catch (error) {
      console.error('Signature generation error:', error);
      res.status(500).json({
        message: 'Failed to generate upload signature',
        error: error.message,
      });
    }
  })
);

export default router;
