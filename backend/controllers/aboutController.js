const About = require('../models/About');
const { deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get About settings
// @route   GET /api/about
// @access  Public
const getAbout = async (req, res) => {
  try {
    let about = await About.findOne({});
    if (!about) {
      about = await About.create({});
    }
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update About settings (with auto image clean up)
// @route   PUT /api/about
// @access  Private (Admin only)
const updateAbout = async (req, res) => {
  try {
    let about = await About.findOne({});
    if (!about) {
      about = await About.create(req.body);
    } else {
      const oldProfilePictureId = (
        req.body.profilePicture &&
        about.profilePicture &&
        about.profilePicture.publicId &&
        req.body.profilePicture.publicId !== about.profilePicture.publicId
      ) ? about.profilePicture.publicId : null;

      about = await About.findByIdAndUpdate(about._id, req.body, {
        new: true,
        runValidators: true
      });

      if (oldProfilePictureId) {
        try {
          await deleteFromCloudinary(oldProfilePictureId);
        } catch (err) {
          console.error('Failed to delete old profile picture:', err.message);
        }
      }
    }
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAbout, updateAbout };
