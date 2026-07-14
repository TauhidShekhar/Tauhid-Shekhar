const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');

// ---------------------------------------------------------------------------
// Allowed MIME types grouped by category
// ---------------------------------------------------------------------------
const ALLOWED_TYPES = {
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  video: ['video/mp4', 'video/webm', 'video/avi'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  archive: ['application/zip', 'application/x-rar-compressed'],
};

const path = require('path');

// Flatten into a single Set for fast lookup
const ALL_ALLOWED = new Set(Object.values(ALLOWED_TYPES).flat());

// ---------------------------------------------------------------------------
// Multer configuration
// ---------------------------------------------------------------------------

/** Memory storage – files stay in buffer until we push them to Cloudinary */
const storage = multer.memoryStorage();

/** File filter – reject anything not in the allow-list, fallback to extensions check */
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.mp4', '.webm', '.avi',
    '.pdf', '.doc', '.docx',
    '.zip', '.rar'
  ]);

  if (ALL_ALLOWED.has(file.mimetype) || allowedExtensions.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" or extension "${ext}" is not allowed.`
      ),
      false
    );
  }
};

/** Size limits */
const limits = {
  fileSize: 50 * 1024 * 1024, // 50 MB
};

const upload = multer({ storage, fileFilter, limits });

const fs = require('fs');

/**
 * Helper to determine file extension from buffer magic bytes
 */
const getExtensionFromBuffer = (buffer) => {
  if (!buffer || buffer.length < 4) return '.png';
  const hex = buffer.toString('hex', 0, 4).toUpperCase();
  if (hex.startsWith('89504E47')) return '.png';
  if (hex.startsWith('FFD8FF')) return '.jpg';
  if (hex.startsWith('47494638')) return '.gif';
  if (hex.startsWith('25504446')) return '.pdf';
  if (hex.startsWith('504B0304')) return '.zip';
  return '.png'; // default fallback
};

/**
 * Save file to local uploads folder
 */
const uploadToLocal = async (buffer, folder) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads', folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = getExtensionFromBuffer(buffer);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    
    await fs.promises.writeFile(filePath, buffer);
    
    // Serve locally relative path dynamically
    const host = process.env.BACKEND_URL || 'https://tauhid-shekhar-portfolio.onrender.com';
    const relativeUrl = `${host}/uploads/${folder}/${fileName}`;
    return {
      url: relativeUrl,
      publicId: `local/${folder}/${fileName}`,
      format: ext.replace('.', ''),
      bytes: buffer.length,
      resourceType: 'image',
      createdAt: new Date().toISOString()
    };
  } catch (err) {
    throw new Error('Local upload fallback failed: ' + err.message);
  }
};

/**
 * Upload a file buffer to Cloudinary (No local fallback to prevent data loss on container restarts).
 */
const uploadToCloudinary = (buffer, folder, resourceType = 'auto', originalName = null) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  const isCloudConfigured = 
    cloudName && !cloudName.includes('your_cloudinary') && 
    apiKey && !apiKey.includes('your_cloudinary') &&
    apiSecret && !apiSecret.includes('your_cloudinary');

  if (!isCloudConfigured) {
    return Promise.reject(new Error('Cloudinary credentials are not configured. Upload aborted.'));
  }

  return new Promise((resolve, reject) => {
    const options = {
      folder: `portfolio/${folder}`,
      resource_type: resourceType,
    };



    if (originalName) {
      const cleanName = path.parse(originalName).name
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .substring(0, 100);
      options.public_id = `${cleanName}_${Date.now()}`;
      options.use_filename = true;
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error.message);
          return reject(new Error('Cloudinary upload failed: ' + error.message));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          resourceType: result.resource_type,
          createdAt: result.created_at,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete a resource from Cloudinary by its public ID (or local disk).
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (publicId && publicId.startsWith('local/')) {
    try {
      const parts = publicId.split('/');
      if (parts.length >= 3) {
        const folder = parts[1];
        const fileName = parts[2];
        const filePath = path.join(__dirname, '..', 'uploads', folder, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.error('Failed to delete local file:', err.message);
    }
    return { result: 'ok' };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  
  const isCloudConfigured = 
    cloudName && !cloudName.includes('your_cloudinary') && 
    apiKey && !apiKey.includes('your_cloudinary');

  if (!isCloudConfigured) {
    return { result: 'ok' };
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary, ALLOWED_TYPES };
