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
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      const oldHeroImageId = (
        req.body.heroImage &&
        settings.heroImage &&
        settings.heroImage.publicId &&
        req.body.heroImage.publicId !== settings.heroImage.publicId
      ) ? settings.heroImage.publicId : null;

      const oldProfilePictureId = (
        req.body.profilePicture &&
        settings.profilePicture &&
        settings.profilePicture.publicId &&
        req.body.profilePicture.publicId !== settings.profilePicture.publicId
      ) ? settings.profilePicture.publicId : null;

      const oldHeroBackgroundId = (
        req.body.heroBackground &&
        settings.heroBackground &&
        settings.heroBackground.publicId &&
        req.body.heroBackground.publicId !== settings.heroBackground.publicId
      ) ? settings.heroBackground.publicId : null;

      // Update document
      settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true
      });

      // Cleanup files only after successful DB update
      if (oldHeroImageId) {
        try {
          await deleteFromCloudinary(oldHeroImageId);
        } catch (err) {
          console.error('Failed to delete old hero image:', err.message);
        }
      }

      if (oldProfilePictureId) {
        try {
          await deleteFromCloudinary(oldProfilePictureId);
        } catch (err) {
          console.error('Failed to delete old profile picture:', err.message);
        }
      }

      if (oldHeroBackgroundId) {
        try {
          await deleteFromCloudinary(oldHeroBackgroundId);
        } catch (err) {
          console.error('Failed to delete old hero background:', err.message);
        }
      }
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
