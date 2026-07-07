const SEO = require('../models/SEO');

// @desc    Get SEO settings
// @route   GET /api/seo
// @access  Public
const getSEO = async (req, res, next) => {
  try {
    let seo = await SEO.findOne({});
    if (!seo) {
      seo = await SEO.create({
        siteName: 'Tauhid Shekhar',
        siteUrl: 'https://tauhidshekhar.com',
        metaTitle: 'Tauhid Shekhar | Full Stack Web Developer Portfolio',
        metaDescription: 'Portfolio of Tauhid Shekhar - Full Stack Developer specializing in React, Node, Express, MongoDB, and UI/UX design.',
        metaKeywords: 'Full Stack Developer, MERN Stack, React Developer, Node Developer, Portfolio, Freelancer, India'
      });
    }
    res.json({ success: true, data: seo });
  } catch (error) {
    next(error);
  }
};

// @desc    Update SEO settings
// @route   PUT /api/seo
// @access  Private/Admin
const updateSEO = async (req, res, next) => {
  try {
    let seo = await SEO.findOne({});
    const updates = { ...req.body };

    let oldImageId = null;

    // Handle Open Graph image upload
    if (req.file) {
      const { uploadToCloudinary } = require('../middleware/upload');
      
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'seo');
      updates.ogImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };

      if (seo && seo.ogImage && seo.ogImage.publicId) {
        oldImageId = seo.ogImage.publicId;
      }
    }

    if (!seo) {
      seo = await SEO.create(updates);
    } else {
      seo = await SEO.findByIdAndUpdate(seo._id, updates, {
        new: true,
        runValidators: true
      });
    }

    if (oldImageId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      await deleteFromCloudinary(oldImageId).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    res.json({ success: true, data: seo });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSEO,
  updateSEO
};
