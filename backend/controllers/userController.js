const User = require('../models/User');

// @desc    Get all users (admin directory)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-refreshTokens');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'User'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Protect from changing own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User role updated to ${role}`, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/inactive status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Protect from disabling self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Protect from deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user gamification metrics manually
// @route   PUT /api/users/:id/gamification
// @access  Private/Admin
const updateUserGamification = async (req, res, next) => {
  try {
    const { xp, coins, reputation, level, rank, isEmailVerified } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (xp !== undefined) user.xp = Number(xp);
    if (coins !== undefined) user.coins = Number(coins);
    if (reputation !== undefined) user.reputation = Number(reputation);
    if (level !== undefined) user.level = Number(level);
    if (rank !== undefined) user.rank = rank;
    if (isEmailVerified !== undefined) user.isEmailVerified = Boolean(isEmailVerified);

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'User gamification metrics updated', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  updateUserGamification
};
