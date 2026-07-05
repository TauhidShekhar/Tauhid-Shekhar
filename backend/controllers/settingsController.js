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
      // 1. Clean up replaced Hero Image
      if (
        req.body.heroImage &&
        settings.heroImage &&
        settings.heroImage.publicId &&
        req.body.heroImage.publicId !== settings.heroImage.publicId
      ) {
        try {
          await deleteFromCloudinary(settings.heroImage.publicId);
        } catch (err) {
          console.error('Failed to delete old hero image:', err.message);
        }
      }

      // 2. Clean up replaced Profile Picture
      if (
        req.body.profilePicture &&
        settings.profilePicture &&
        settings.profilePicture.publicId &&
        req.body.profilePicture.publicId !== settings.profilePicture.publicId
      ) {
        try {
          await deleteFromCloudinary(settings.profilePicture.publicId);
        } catch (err) {
          console.error('Failed to delete old profile picture:', err.message);
        }
      }

      // 3. Clean up replaced Hero Background
      if (
        req.body.heroBackground &&
        settings.heroBackground &&
        settings.heroBackground.publicId &&
        req.body.heroBackground.publicId !== settings.heroBackground.publicId
      ) {
        try {
          await deleteFromCloudinary(settings.heroBackground.publicId);
        } catch (err) {
          console.error('Failed to delete old hero background:', err.message);
        }
      }

      // Update document
      settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
