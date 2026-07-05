const Media = require('../models/Media');

// Helper to determine media type from MIME type
const getMediaType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType.includes('msword') ||
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('officedocument')
  ) {
    return 'document';
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) {
    return 'archive';
  }
  return 'document';
};

// @desc    Get all media files with pagination and filters
// @route   GET /api/media
// @access  Private/Admin
const getMedia = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) query.fileType = type;
    if (search) query.fileName = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const count = await Media.countDocuments(query);
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: media
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new file to Cloudinary & register in DB
// @route   POST /api/media
// @access  Private/Admin
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const { uploadToCloudinary } = require('../middleware/upload');
    const fileType = getMediaType(req.file.mimetype);

    // Map file types to Cloudinary resource types
    let resourceType = 'auto';
    if (fileType === 'image') resourceType = 'image';
    if (fileType === 'video') resourceType = 'video';
    if (fileType === 'pdf' || fileType === 'document' || fileType === 'archive') {
      resourceType = 'raw';
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, 'media_library', resourceType);

    const media = await Media.create({
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      fileUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      fileType,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      dimensions: {
        width: uploadResult.width || null,
        height: uploadResult.height || null
      },
      uploadedBy: req.user._id,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      alt: req.body.alt || ''
    });

    res.status(201).json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a media file
// @route   DELETE /api/media/:id
// @access  Private/Admin
const deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media file not found' });
    }

    // Determine Cloudinary resource type
    let resourceType = 'image';
    if (media.fileType === 'video') resourceType = 'video';
    if (media.fileType === 'pdf' || media.fileType === 'document' || media.fileType === 'archive') {
      resourceType = 'raw';
    }

    const { deleteFromCloudinary } = require('../middleware/upload');
    if (media.publicId) {
      await deleteFromCloudinary(media.publicId, resourceType).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    await media.deleteOne();
    res.json({ success: true, message: 'Media file deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedia,
  uploadMedia,
  deleteMedia
};
