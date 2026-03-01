// uploadCloudinary.js - Cloudinary upload functionality

/**
 * Upload a file to Cloudinary using unsigned preset
 * @param {File} file - The file to upload
 * @param {string} cloudName - Your Cloudinary cloud name
 * @param {string} uploadPreset - Your unsigned upload preset
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
async function uploadToCloudinary(file, cloudName = 'YOUR_CLOUD_NAME', uploadPreset = 'YOUR_UPLOAD_PRESET') {
  try {
    console.log('Starting Cloudinary upload...');
    console.log('File:', file.name, file.type, file.size);
    console.log('Cloud name:', cloudName);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    
    // Optional: Add additional parameters
    formData.append("resource_type", "auto"); // Auto-detect resource type
    formData.append("tags", "artify,artwork"); // Add tags for organization
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('Uploading to:', cloudinaryUrl);
    
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
        
        // Dispatch custom event for progress tracking
        window.dispatchEvent(new CustomEvent('uploadProgress', {
          detail: { progress: percentCompleted, file: file.name }
        }));
      }
    });
    
    console.log('Cloudinary upload successful:', response.data);
    
    // Return the secure URL
    return response.data.secure_url;
    
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Server responded with error:', error.response.data);
      throw new Error(`Cloudinary upload failed: ${error.response.data.error?.message || error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('Cloudinary upload failed: No response from server');
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }
}

/**
 * Upload base64 data to Cloudinary
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} cloudName - Your Cloudinary cloud name
 * @param {string} uploadPreset - Your unsigned upload preset
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
async function uploadBase64ToCloudinary(base64Data, cloudName = 'YOUR_CLOUD_NAME', uploadPreset = 'YOUR_UPLOAD_PRESET') {
  try {
    console.log('Uploading base64 data to Cloudinary...');
    console.log('Data length:', base64Data.length);
    
    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "image");
    formData.append("tags", "artify,artwork,base64");
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('Uploading to:', cloudinaryUrl);
    
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    console.log('Base64 upload successful:', response.data);
    return response.data.secure_url;
    
  } catch (error) {
    console.error('Base64 Cloudinary upload failed:', error);
    throw new Error(`Cloudinary base64 upload failed: ${error.message}`);
  }
}

/**
 * Validate Cloudinary configuration
 * @param {string} cloudName - Your Cloudinary cloud name
 * @param {string} uploadPreset - Your unsigned upload preset
 * @returns {boolean} - Whether the configuration is valid
 */
function validateCloudinaryConfig(cloudName, uploadPreset) {
  if (!cloudName || cloudName === 'YOUR_CLOUD_NAME') {
    console.error('Cloudinary cloud name is not configured');
    return false;
  }
  
  if (!uploadPreset || uploadPreset === 'YOUR_UPLOAD_PRESET') {
    console.error('Cloudinary upload preset is not configured');
    return false;
  }
  
  return true;
}

/**
 * Get Cloudinary configuration from environment or default values
 * @returns {Object} - Cloudinary configuration
 */
function getCloudinaryConfig() {
  // Your actual Cloudinary credentials
  return {
    cloudName: 'dd6ons4ie', // Your actual cloud name
    uploadPreset: 'Artify' // Your actual upload preset
  };
}

// Export functions for use in other files
window.uploadBase64ToCloudinary = uploadBase64ToCloudinary;
window.validateCloudinaryConfig = validateCloudinaryConfig;
window.getCloudinaryConfig = getCloudinaryConfig;

// Convenience wrapper that matches the user's simple signature
async function uploadToCloudinarySimple(file) {
  const cfg = (typeof window.getCloudinaryConfig === 'function')
    ? window.getCloudinaryConfig()
    : getCloudinaryConfig();
  const uploadToCloudinaryCore = uploadToCloudinary;
  return await uploadToCloudinaryCore(file, cfg.cloudName, cfg.uploadPreset);
}

// Do not override existing export if pages already rely on the 3-arg version
if (typeof window.uploadToCloudinary !== 'function' || window.uploadToCloudinary.length !== 3) {
  window.uploadToCloudinary = uploadToCloudinarySimple;
}
window.uploadToCloudinarySimple = uploadToCloudinarySimple;
