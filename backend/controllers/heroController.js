const Hero = require('../models/Hero');
const { deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get Hero settings
// @route   GET /api/hero
// @access  Public
const getHero = async (req, res) => {
  try {
    let hero = await Hero.findOne({});
    if (!hero) {
      hero = await Hero.create({});
    }
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Hero settings (with auto image clean up)
// @route   PUT /api/hero
// @access  Private (Admin only)
const updateHero = async (req, res) => {
  try {
    let hero = await Hero.findOne({});
    if (!hero) {
      hero = await Hero.create(req.body);
    } else {
      const oldHeroImageId = (
        req.body.heroImage &&
        hero.heroImage &&
        hero.heroImage.publicId &&
        req.body.heroImage.publicId !== hero.heroImage.publicId
      ) ? hero.heroImage.publicId : null;

      const oldHeroBackgroundId = (
        req.body.heroBackground &&
        hero.heroBackground &&
        hero.heroBackground.publicId &&
        req.body.heroBackground.publicId !== hero.heroBackground.publicId
      ) ? hero.heroBackground.publicId : null;

      hero = await Hero.findByIdAndUpdate(hero._id, req.body, {
        new: true,
        runValidators: true
      });

      if (oldHeroImageId) {
        try {
          await deleteFromCloudinary(oldHeroImageId);
        } catch (err) {
          console.error('Failed to delete old hero image:', err.message);
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
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getHero, updateHero };
