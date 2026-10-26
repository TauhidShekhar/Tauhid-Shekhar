const Setting = require('../models/Setting');
const { deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update settings (with automatic old image clean up)
// @route   PUT /api/settings
// @access  Private (Admin only)
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({});
    
    // Parse nested objects sent as JSON strings or raw objects
    const updates = { ...req.body };

    // Universal sanitizer for FormData object serialization issues
    for (const key in updates) {
      if (updates[key] === '[object Object]' || updates[key] === 'undefined' || updates[key] === null) {
        delete updates[key];
      }
    }
    if (typeof updates.socialLinks === 'string') {
      try { updates.socialLinks = JSON.parse(updates.socialLinks); } catch (_) {}
    }
    if (typeof updates.locations === 'string') {
      try { updates.locations = JSON.parse(updates.locations); } catch (_) {}
    }
    if (typeof updates.contactFormFields === 'string') {
      try { updates.contactFormFields = JSON.parse(updates.contactFormFields); } catch (_) {}
    }
    if (typeof updates.heroCtaButtons === 'string') {
      try { updates.heroCtaButtons = JSON.parse(updates.heroCtaButtons); } catch (_) {}
    }
    if (typeof updates.aboutStats === 'string') {
      try { updates.aboutStats = JSON.parse(updates.aboutStats); } catch (_) {}
    }
    if (typeof updates.coreStrengths === 'string') {
      try { updates.coreStrengths = JSON.parse(updates.coreStrengths); } catch (_) {}
    }
    if (typeof updates.languages === 'string') {
      try { updates.languages = JSON.parse(updates.languages); } catch (_) {}
    }
    if (typeof updates.aboutPersonalInfo === 'string') {
      try { updates.aboutPersonalInfo = JSON.parse(updates.aboutPersonalInfo); } catch (_) {}
    }
    if (typeof updates.aboutContactInfo === 'string') {
      try { updates.aboutContactInfo = JSON.parse(updates.aboutContactInfo); } catch (_) {}
    }
    if (typeof updates.navbarConfig === 'string') {
      try { updates.navbarConfig = JSON.parse(updates.navbarConfig); } catch (_) {}
    }
    if (typeof updates.theme === 'string') {
      try { updates.theme = JSON.parse(updates.theme); } catch (_) {}
    }
    if (typeof updates.announcementBanner === 'string') {
      try { updates.announcementBanner = JSON.parse(updates.announcementBanner); } catch (_) {}
    }
    if (typeof updates.cookieSettings === 'string') {
      try { updates.cookieSettings = JSON.parse(updates.cookieSettings); } catch (_) {}
    }
    if (typeof updates.websiteStatus === 'string') {
      try { updates.websiteStatus = JSON.parse(updates.websiteStatus); } catch (_) {}
    }
    if (typeof updates.emailNotifications === 'string') {
      try { updates.emailNotifications = JSON.parse(updates.emailNotifications); } catch (_) {}
    }

    const oldImageIds = [];

    // Handle uploads to Cloudinary
    if (req.files) {
      const { uploadToCloudinary } = require('../middleware/upload');
      
      const fileFields = ['logo', 'favicon', 'heroImage', 'profilePicture', 'heroBackground'];
      for (const field of fileFields) {
        if (req.files[field] && req.files[field][0]) {
          const file = req.files[field][0];
          const uploadResult = await uploadToCloudinary(file.buffer, 'settings');
          updates[field] = {
            url: uploadResult.url,
            publicId: uploadResult.publicId
          };
          if (settings && settings[field] && settings[field].publicId) {
            oldImageIds.push(settings[field].publicId);
          }
        }
      }
    }

    if (!settings) {
      settings = await Setting.create(updates);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, updates, {
        new: true,
        runValidators: true
      });
    }

    // Sync with SEO model
    const SEO = require('../models/SEO');
    let seo = await SEO.findOne({});
    const seoUpdates = {};
    if (updates.siteName !== undefined) seoUpdates.siteName = updates.siteName;
    if (updates.title !== undefined) seoUpdates.metaTitle = updates.title;
    if (updates.metaDescription !== undefined) seoUpdates.metaDescription = updates.metaDescription;
    if (updates.keywords !== undefined) seoUpdates.metaKeywords = updates.keywords;
    if (updates.logo !== undefined) seoUpdates.logo = updates.logo;
    if (updates.favicon !== undefined) seoUpdates.favicon = updates.favicon;

    if (Object.keys(seoUpdates).length > 0) {
      if (!seo) {
        await SEO.create(seoUpdates);
      } else {
        await SEO.findByIdAndUpdate(seo._id, seoUpdates);
      }
    }

    // Clean up old images after successful DB save
    if (oldImageIds.length > 0) {
      for (const publicId of oldImageIds) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.error('Failed to delete old image:', publicId, err.message);
        }
      }
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Test email notification delivery
// @route   POST /api/settings/test-email
// @access  Private (Admin only)
const testEmailNotification = async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const { sendTestNotificationEmail, getAdminNotificationEmail } = require('../utils/emailService');
    const recipient = targetEmail || await getAdminNotificationEmail('order');
    await sendTestNotificationEmail(recipient);
    res.json({ success: true, message: `Test email sent successfully to ${recipient}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to send test email' });
  }
};

module.exports = { getSettings, updateSettings, testEmailNotification };
