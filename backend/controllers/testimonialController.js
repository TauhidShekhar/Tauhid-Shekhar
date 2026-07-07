const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res, next) => {
  try {
    const query = {};
    if (!req.user || req.user.role !== 'Admin') {
      // Non-admins only see testimonials sorted by order
    }
    const testimonials = await Testimonial.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
const createTestimonial = async (req, res, next) => {
  try {
    const { name, role, company, rating, content, featured, displayOrder } = req.body;
    let avatar = {};

    if (req.file) {
      const { uploadToCloudinary } = require('../middleware/upload');
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'testimonials');
      avatar = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    const testimonial = await Testimonial.create({
      name,
      role,
      company,
      rating: rating ? Number(rating) : 5,
      content,
      avatar,
      featured: featured === 'true' || featured === true,
      displayOrder: displayOrder ? Number(displayOrder) : 0
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const updates = { ...req.body };
    if (updates.rating) updates.rating = Number(updates.rating);
    if (updates.displayOrder) updates.displayOrder = Number(updates.displayOrder);
    if (updates.featured !== undefined) updates.featured = updates.featured === 'true' || updates.featured === true;

    let oldAvatarPublicId = null;

    if (req.file) {
      const { uploadToCloudinary } = require('../middleware/upload');
      
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'testimonials');
      updates.avatar = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };

      if (testimonial.avatar && testimonial.avatar.publicId) {
        oldAvatarPublicId = testimonial.avatar.publicId;
      }
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (oldAvatarPublicId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      await deleteFromCloudinary(oldAvatarPublicId).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    res.json({ success: true, data: updatedTestimonial });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    if (testimonial.avatar && testimonial.avatar.publicId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      await deleteFromCloudinary(testimonial.avatar.publicId).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    await testimonial.deleteOne();
    res.json({ success: true, message: 'Testimonial deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};
