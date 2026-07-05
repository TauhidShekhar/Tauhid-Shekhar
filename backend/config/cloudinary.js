const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// ---------------------------------------------------------------------------
// Cloudinary SDK Configuration
// ---------------------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary.
 *
 * @param {string}  filePath      – Absolute path to the local file.
 * @param {string}  folder        – Cloudinary folder name (e.g. "portfolio/projects").
 * @param {string}  resourceType  – "image" | "video" | "raw" (default: "image").
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadToCloudinary = async (filePath, folder, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      // Let Cloudinary auto-detect the best format for images
      ...(resourceType === 'image' && { format: 'auto', quality: 'auto' }),
    });

    // Clean up the local temp file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    // Ensure temp file is removed even on failure
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete an asset from Cloudinary by its public_id.
 *
 * @param {string}  publicId      – The Cloudinary public_id of the asset.
 * @param {string}  resourceType  – "image" | "video" | "raw" (default: "image").
 * @returns {Promise<object>}     – Cloudinary deletion result.
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
