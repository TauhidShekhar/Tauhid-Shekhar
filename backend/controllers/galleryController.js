const Gallery = require('../models/Gallery');

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
const getGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.find({}).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, count: gallery.length, data: gallery });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a gallery item
// @route   POST /api/gallery
// @access  Private/Admin
const createGalleryItem = async (req, res, next) => {
  try {
    const { title, description, category, tags, displayOrder } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const { uploadToCloudinary } = require('../middleware/upload');
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'gallery');

    const item = await Gallery.create({
      title,
      description,
      image: {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      },
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      displayOrder: displayOrder ? Number(displayOrder) : 0
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
const updateGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    const updates = { ...req.body };
    if (updates.displayOrder) updates.displayOrder = Number(updates.displayOrder);
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (req.file) {
      const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');
      
      if (item.image && item.image.publicId) {
        await deleteFromCloudinary(item.image.publicId).catch(err => console.error('Cloudinary delete error:', err.message));
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, 'gallery');
      updates.image = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    const updatedItem = await Gallery.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    if (item.image && item.image.publicId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      await deleteFromCloudinary(item.image.publicId).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Gallery item deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
