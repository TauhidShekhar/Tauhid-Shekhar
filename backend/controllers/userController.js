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

// @desc    Admin update user details (username, email, phone, status, role, email/phone verification, password reset, force password change)
// @route   PUT /api/users/:id
// @access  Private/Admin
const adminUpdateUser = async (req, res, next) => {
  try {
    const bcrypt = require('bcryptjs');
    const { 
      fullName, username, email, phone, role, status, 
      isEmailVerified, isPhoneVerified, password, forcePasswordReset 
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Protect from changing own role/status/deactivation
    const isSelf = user._id.toString() === req.user.id;
    if (isSelf) {
      if (role && role !== user.role) {
        return res.status(400).json({ success: false, message: 'You cannot change your own role' });
      }
      if (status && status !== user.status) {
        return res.status(400).json({ success: false, message: 'You cannot change your own status' });
      }
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (isEmailVerified !== undefined) user.isEmailVerified = Boolean(isEmailVerified);
    if (isPhoneVerified !== undefined) user.isPhoneVerified = Boolean(isPhoneVerified);
    if (forcePasswordReset !== undefined) user.mustChangePassword = Boolean(forcePasswordReset);

    // Sync active flag with status
    if (status === 'Active') {
      user.isActive = true;
    } else if (status === 'Suspended' || status === 'Banned') {
      user.isActive = false;
    }

    // Update username with uniqueness check
    if (username && username.toLowerCase() !== user.username) {
      const exists = await User.findOne({ username: username.toLowerCase() });
      if (exists) return res.status(400).json({ success: false, message: 'Username is already taken' });
      user.username = username.toLowerCase();
    }

    // Update email with uniqueness check
    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ success: false, message: 'Email address is already taken' });
      user.email = email.toLowerCase();
    }

    // Password Update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save({ validateBeforeSave: false });

    // Log admin action to Audit Log
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        user: req.user.id,
        action: 'UPDATE',
        resource: 'User',
        resourceId: user._id,
        details: `Admin ${req.user.username} updated user ${user.username}. Fields: ${Object.keys(req.body).filter(k => req.body[k] !== undefined && k !== 'password').join(', ')}`,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (auditErr) {
      console.error('Failed to log admin action:', auditErr.message);
    }

    // Emit real-time updates via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('user_update', { userId: user._id, action: 'update', data: user });
      if (status === 'Suspended' || status === 'Banned') {
        io.emit('force_logout', { userId: user._id, reason: status });
      }
    }

    res.json({ success: true, message: 'User updated successfully by administrator', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  updateUserGamification,
  adminUpdateUser
};
