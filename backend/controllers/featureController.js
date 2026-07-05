const Feature = require('../models/Feature');
const User = require('../models/User');

// @desc    Get all published features (Public/Guest)
// @route   GET /api/features
// @access  Public
const getFeatures = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const features = await Feature.find(query).sort({ releaseDate: -1 });
    res.json({ success: true, count: features.length, data: features });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all features for admin panel
// @route   GET /api/features/all
// @access  Private/Admin
const getAllFeatures = async (req, res, next) => {
  try {
    const features = await Feature.find().sort({ releaseDate: -1 });
    res.json({ success: true, count: features.length, data: features });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new feature
// @route   POST /api/features
// @access  Private/Admin
const createFeature = async (req, res, next) => {
  try {
    const { name, category, icon, description, screenshot, version, releaseDate, loginRequired, isNewFeature, isFeatured, isPublished } = req.body;
    
    const newFeature = await Feature.create({
      name,
      category,
      icon,
      description,
      screenshot,
      version,
      releaseDate,
      loginRequired: loginRequired === true || loginRequired === 'true',
      isNewFeature: isNewFeature === true || isNewFeature === 'true',
      isFeatured: isFeatured === true || isFeatured === 'true',
      isPublished: isPublished === true || isPublished === 'true'
    });

    res.status(201).json({ success: true, data: newFeature });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a feature
// @route   PUT /api/features/:id
// @access  Private/Admin
const updateFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }

    const fieldsToUpdate = [
      'name', 'category', 'icon', 'description', 'screenshot', 
      'version', 'releaseDate', 'loginRequired', 'isNewFeature', 
      'isFeatured', 'isPublished'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        feature[field] = req.body[field];
      }
    });

    await feature.save();
    res.json({ success: true, data: feature });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a feature
// @route   DELETE /api/features/:id
// @access  Private/Admin
const deleteFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found' });
    }

    await feature.deleteOne();
    res.json({ success: true, message: 'Feature deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete onboarding tour
// @route   POST /api/features/onboarding/complete
// @access  Private
const completeOnboarding = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.onboardingTourCompleted = true;
    await user.save();

    res.json({ success: true, message: 'Onboarding tour status updated' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset onboarding tour status
// @route   POST /api/features/onboarding/reset
// @access  Private
const resetOnboarding = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.onboardingTourCompleted = false;
    await user.save();

    res.json({ success: true, message: 'Onboarding tour reset successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a feature release as viewed ("What's New")
// @route   POST /api/features/view/:id
// @access  Private
const viewFeature = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.viewedFeatures.includes(req.params.id)) {
      user.viewedFeatures.push(req.params.id);
      await user.save();
    }

    res.json({ success: true, message: 'Feature marked as viewed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get new features the logged-in user has NOT viewed yet
// @route   GET /api/features/whats-new
// @access  Private
const getWhatsNew = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find published features marked isNewFeature that are not in user's viewed list
    const newFeatures = await Feature.find({
      isPublished: true,
      isNewFeature: true,
      _id: { $nin: user.viewedFeatures }
    }).sort({ releaseDate: -1 });

    res.json({ success: true, count: newFeatures.length, data: newFeatures });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFeatures,
  getAllFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  completeOnboarding,
  resetOnboarding,
  viewFeature,
  getWhatsNew
};
