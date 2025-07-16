import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS URLs
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the image file
 * @param {string} folder - Cloudinary folder name
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (filePath, folder = 'chat-app', options = {}) => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive',
      ...options,
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get optimized image URL
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Image transformations
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto:good',
    fetch_format: 'auto',
    flags: 'progressive',
    ...transformations,
  };

  return cloudinary.url(publicId, defaultTransformations);
};

/**
 * Generate upload signature for frontend direct uploads
 * @param {Object} params - Upload parameters
 * @returns {Object} - Signature and timestamp
 */
export const generateUploadSignature = (params) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...params, timestamp },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
};

export default cloudinary;
