const Achievement = require('../models/Achievement');

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
const getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({}).sort({ displayOrder: 1, date: -1 });
    res.json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an achievement
// @route   POST /api/achievements
// @access  Private/Admin
const createAchievement = async (req, res, next) => {
  try {
    const { title, description, icon, date, category, displayOrder } = req.body;

    const achievement = await Achievement.create({
      title,
      description,
      icon,
      date: date ? new Date(date) : null,
      category,
      displayOrder: displayOrder ? Number(displayOrder) : 0
    });

    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an achievement
// @route   PUT /api/achievements/:id
// @access  Private/Admin
const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    const updates = { ...req.body };
    if (updates.displayOrder) updates.displayOrder = Number(updates.displayOrder);
    if (updates.date) updates.date = new Date(updates.date);

    const updatedAchievement = await Achievement.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: updatedAchievement });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an achievement
// @route   DELETE /api/achievements/:id
// @access  Private/Admin
const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    await achievement.deleteOne();
    res.json({ success: true, message: 'Achievement deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement
};
