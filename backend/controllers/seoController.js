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
        siteUrl: 'https://tauhidshekhar.vercel.app',
        metaTitle: 'Tauhid Shekhar | Full Stack Web Developer Portfolio',
        metaDescription: 'Portfolio of Tauhid Shekhar - Full Stack Developer specializing in React, Node, Express, MongoDB, and UI/UX design.',
        metaKeywords: 'Full Stack Developer, MERN Stack, React Developer, Node Developer, Portfolio, Freelancer, India',
        author: 'Tauhid Shekhar',
        robotsTxt: 'User-agent: *\nAllow: /\nSitemap: https://tauhidshekhar.vercel.app/sitemap.xml',
        schemaSettings: '{}'
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

    const oldImageIds = [];

    // Handle multiple file fields upload
    if (req.files) {
      const { uploadToCloudinary } = require('../middleware/upload');
      
      if (req.files.ogImage && req.files.ogImage[0]) {
        const file = req.files.ogImage[0];
        const uploadResult = await uploadToCloudinary(file.buffer, 'seo');
        updates.ogImage = {
          url: uploadResult.url,
          publicId: uploadResult.publicId
        };
        if (seo && seo.ogImage && seo.ogImage.publicId) {
          oldImageIds.push(seo.ogImage.publicId);
        }
      }

      if (req.files.favicon && req.files.favicon[0]) {
        const file = req.files.favicon[0];
        const uploadResult = await uploadToCloudinary(file.buffer, 'seo');
        updates.favicon = {
          url: uploadResult.url,
          publicId: uploadResult.publicId
        };
        if (seo && seo.favicon && seo.favicon.publicId) {
          oldImageIds.push(seo.favicon.publicId);
        }
      }

      if (req.files.logo && req.files.logo[0]) {
        const file = req.files.logo[0];
        const uploadResult = await uploadToCloudinary(file.buffer, 'seo');
        updates.logo = {
          url: uploadResult.url,
          publicId: uploadResult.publicId
        };
        if (seo && seo.logo && seo.logo.publicId) {
          oldImageIds.push(seo.logo.publicId);
        }
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

    if (oldImageIds.length > 0) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      for (const publicId of oldImageIds) {
        await deleteFromCloudinary(publicId).catch(err => console.error('Cloudinary delete error:', err.message));
      }
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
