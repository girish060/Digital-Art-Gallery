// Server-side Cloudinary configuration
// This file contains server-side Cloudinary functionality for secure uploads

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dd6ons4ie',
  api_key: process.env.CLOUDINARY_API_KEY || '527252724278318',
  api_secret: process.env.CLOUDINARY_API_SECRET || '3vKM9vojeU7gB5pyn-VQqdV79DU'
});

/**
 * Generate a secure upload signature for client-side uploads
 * @param {Object} params - Upload parameters
 * @returns {Object} - Signature and timestamp
 */
function generateUploadSignature(params = {}) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  const signatureParams = {
    ...params,
    timestamp: timestamp
  };
  
  const signature = cloudinary.utils.api_sign_request(signatureParams, cloudinary.config().api_secret);
  
  return {
    signature,
    timestamp,
    api_key: cloudinary.config().api_key,
    cloud_name: cloudinary.config().cloud_name
  };
}

/**
 * Upload file to Cloudinary with server-side authentication
 * @param {string} filePath - Path to the file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
async function uploadToCloudinarySecure(filePath, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'artify/artworks',
      resource_type: 'auto',
      tags: ['artify', 'artwork'],
      ...options
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get image transformation URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} - Transformed image URL
 */
function getTransformedImageUrl(publicId, transformations = {}) {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  };
  
  return cloudinary.url(publicId, defaultTransformations);
}

/**
 * Generate upload preset configuration
 * @param {Object} options - Preset options
 * @returns {Object} - Preset configuration
 */
function generateUploadPresetConfig(options = {}) {
  return {
    name: options.name || 'artify_secure',
    unsigned: false, // This will be a signed preset for security
    folder: options.folder || 'artify/artworks',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'gif', 'webp'],
    max_file_size: options.maxFileSize || 10485760, // 10MB
    transformation: [
      {
        quality: 'auto',
        fetch_format: 'auto'
      }
    ],
    ...options
  };
}

module.exports = {
  cloudinary,
  generateUploadSignature,
  uploadToCloudinarySecure,
  deleteFromCloudinary,
  getTransformedImageUrl,
  generateUploadPresetConfig
};