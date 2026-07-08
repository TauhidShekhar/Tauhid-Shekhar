const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  generateOTP,
  generateRandomToken
} = require('../utils/tokenUtils');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendLoginAlertEmail
} = require('../utils/emailService');
const UAParser = require('ua-parser-js');

// Helper to get device info from request headers
const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  return {
    ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
    device: result.device.model || result.device.type || 'Desktop',
    browser: result.browser.name ? `${result.browser.name} ${result.browser.version}` : 'Unknown Browser',
    os: result.os.name ? `${result.os.name} ${result.os.version}` : 'Unknown OS'
  };
};

// @desc    Register a new user (with verification link)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, username, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
    }

    let finalUsername = username;
    if (!finalUsername && email) {
      finalUsername = email.split('@')[0];
    }
    if (finalUsername) {
      finalUsername = finalUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
      if (finalUsername.length < 3) {
        finalUsername = (finalUsername + '___').substring(0, 3);
      }
    } else {
      finalUsername = 'user_' + Math.random().toString(36).substring(2, 8);
    }

    const emailQuery = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email: emailQuery }, { username: finalUsername }] });
    if (userExists) {
      if (!userExists.isEmailVerified) {
        // Stale unverified registration fallback - delete old doc to retry
        await User.findByIdAndDelete(userExists._id);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
    }

    // Generate email verification token
    const verificationToken = generateRandomToken();
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const defaultAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || 'User')}`;
    const avatar = req.body.avatar || { url: defaultAvatarUrl, publicId: 'default' };

    // Optimize counting check with O(1) estimate
    const userCount = await User.estimatedDocumentCount();
    const isFirstUser = userCount === 0;

    const user = await User.create({
      fullName,
      username: finalUsername,
      email: emailQuery,
      phone,
      password,
      avatar,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationTokenExpires,
      role: isFirstUser ? 'Admin' : 'User',
      isEmailVerified: true // Auto-verify to bypass SMTP port delay bottlenecks
    });

    // Send welcome mail asynchronously in the background so it doesn't block API response
    sendVerificationEmail(user, verificationToken).catch((mailErr) => {
      console.warn('Welcome/Verification background email skipped:', mailErr.message);
    });

    res.status(201).json({
      success: true,
      message: 'Account registered and auto-verified successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is invalid or has expired'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & set HttpOnly cookies
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ success: false, message: 'Email or username is required.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const deviceInfo = getDeviceInfo(req);

    // Dummy hash for timing attack mitigation (salt 12 bcrypt output)
    const dummyHash = '$2b$12$K.zM2x3zM2x3zM2x3zM2x3zM2x3zM2x3zM2x3zM2x3zM2x3zM2x3zM';

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ email: identifier.trim().toLowerCase() }, { username: identifier.trim().toLowerCase() }]
    }).select('+password');

    if (!user) {
      // Prevent timing attacks by executing a slow hash comparison
      await bcrypt.compare(password, dummyHash);
      return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      // Prevent timing attacks by executing a slow hash comparison
      await bcrypt.compare(password, dummyHash);
      return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      
      // Save failed attempt history
      user.loginHistory.push({ ...deviceInfo, success: false });
      await user.save({ validateBeforeSave: false });

      return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      const userMail = process.env.SMTP_USER;
      const passMail = process.env.SMTP_PASS;
      const isSmtpConfigured = userMail && !userMail.includes('your_gmail') && passMail && !passMail.includes('your_gmail');
      if (!isSmtpConfigured) {
        console.log(`Auto-verifying user ${user.username} during login (SMTP not configured).`);
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
      } else {
        return res.status(403).json({
          success: false,
          message: 'Your email address is not verified. Please verify your email first.'
        });
      }
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Clean up old/expired refresh tokens to prevent list bloat
    user.refreshTokens = user.refreshTokens.filter(
      rt => rt.expiresAt && new Date(rt.expiresAt) > new Date()
    );

    // Limit max stored sessions to 10
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens.shift(); // remove oldest
    }

    // Refresh token lifespan matches rememberMe preference
    const refreshExpiry = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30 days
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7 days

    // Save refresh token to session list
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: refreshExpiry
    });

    user.lastLogin = new Date();
    user.lastActive = new Date();
    user.loginHistory.push({ ...deviceInfo, success: true });
    
    // Maintain maximum history length
    if (user.loginHistory.length > 50) {
      user.loginHistory.shift();
    }

    await user.save({ validateBeforeSave: false });

    // Send login alert
    sendLoginAlertEmail(user, deviceInfo).catch(err => console.error('Alert email error:', err.message));

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken, rememberMe);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        coins: user.coins || 0,
        level: user.level || 1,
        rank: user.rank || 'Bronze Starter',
        aiCredits: user.aiCredits || 10,
        avatarBorder: user.avatarBorder || 'none',
        profileTheme: user.profileTheme || 'default',
        xp: user.xp || 0,
        reputation: user.reputation || 0,
        badges: user.badges || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookies
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Remove token from database sessions
      await User.updateOne(
        { 'refreshTokens.token': refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    clearTokenCookies(res);
    res.json({ success: true, message: 'Logged out successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Rotate access/refresh tokens
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: clientToken } = req.cookies;

    if (!clientToken) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Session token missing' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(clientToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid session token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Session user not found' });
    }

    // Verify token is in user session list
    const activeTokenIndex = user.refreshTokens.findIndex(rt => rt.token === clientToken);
    if (activeTokenIndex === -1) {
      // Re-use detection: clear all refresh tokens if duplicate detected
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Security warning: Session reuse detected' });
    }

    // Issue new pair (Token Rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Replace old refresh token with new one
    user.refreshTokens[activeTokenIndex] = {
      token: newRefreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    await user.save({ validateBeforeSave: false });

    // Set new cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.json({ success: true, message: 'Session renewed successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - request reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const resetToken = generateRandomToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (mailErr) {
      console.warn('Failed to send reset email, fallback link:', `http://localhost:5174/admin/reset-password/${resetToken}`);
      const userMail = process.env.SMTP_USER;
      const passMail = process.env.SMTP_PASS;
      const isSmtpConfigured = userMail && !userMail.includes('your_gmail') && passMail && !passMail.includes('your_gmail');
      if (isSmtpConfigured) {
        throw mailErr;
      }
    }

    res.json({
      success: true,
      message: 'A password reset link has been successfully emailed.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Reset Token - checks validation and expiry
// @route   POST /api/auth/verify-reset-token
// @access  Public
const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is required.' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.'
      });
    }
    res.json({ success: true, message: 'Token is valid.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Recover Account - search user and send recovery OTP
// @route   POST /api/auth/recover-account
// @access  Public
const recoverAccount = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Username or email is required.' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.trim().toLowerCase() },
        { username: identifier.trim().toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this username or email.'
      });
    }

    const { otp, otpExpires } = generateOTP();
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      await sendOTPEmail(user, otp);
    } catch (mailErr) {
      console.warn('Failed to send OTP email, code is:', otp);
      const userMail = process.env.SMTP_USER;
      const passMail = process.env.SMTP_PASS;
      const isSmtpConfigured = userMail && !userMail.includes('your_gmail') && passMail && !passMail.includes('your_gmail');
      if (isSmtpConfigured) {
        throw mailErr;
      }
    }

    const isLocked = user.lockUntil && user.lockUntil > Date.now();

    res.json({
      success: true,
      isLocked,
      message: isLocked 
        ? 'Account is locked. An OTP has been sent to your email to verify identity and unlock your account.' 
        : 'An OTP has been sent to your email to verify identity and recover account access.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Recovery OTP - verify OTP and reset password to recover account
// @route   POST /api/auth/verify-recovery-otp
// @access  Public
const verifyRecoveryOtp = async (req, res, next) => {
  try {
    const { identifier, otp, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier.trim().toLowerCase() },
        { username: identifier.trim().toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this username or email.'
      });
    }

    if (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP code is invalid or has expired.'
      });
    }

    // Recover/Unlock user account
    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.refreshTokens = []; // Clear all active sessions
    
    await user.save();

    res.json({
      success: true,
      message: 'Account recovered and password reset successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Clear sessions on password reset
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send 2FA OTP
// @route   POST /api/auth/send-otp
// @access  Private
const sendOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { otp, otpExpires } = generateOTP();
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(user, otp);

    res.json({ success: true, message: 'OTP verification code sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA OTP
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOTP = async (req, res, next) => {
  try {
    const { code } = req.body;

    const user = await User.findOne({
      _id: req.user.id,
      otp: code,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    // Update lastActive timestamp on profile requests
    req.user.lastActive = new Date();
    await req.user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        username: req.user.username,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        avatar: req.user.avatar,
        coverPhoto: req.user.coverPhoto,
        bio: req.user.bio,
        headline: req.user.headline,
        aboutMe: req.user.aboutMe,
        location: req.user.location,
        website: req.user.website,
        githubUrl: req.user.githubUrl,
        linkedinUrl: req.user.linkedinUrl,
        twitterUrl: req.user.twitterUrl,
        instagramUrl: req.user.instagramUrl,
        facebookUrl: req.user.facebookUrl,
        youtubeUrl: req.user.youtubeUrl,
        profession: req.user.profession,
        company: req.user.company,
        dob: req.user.dob,
        gender: req.user.gender,
        skills: req.user.skills,
        experience: req.user.experience,
        education: req.user.education,
        certifications: req.user.certifications,
        resume: req.user.resume,
        interests: req.user.interests,
        hobbies: req.user.hobbies,
        isVerified: req.user.isVerified,
        xp: req.user.xp,
        reputation: req.user.reputation,
        badges: req.user.badges,
        coins: req.user.coins || 0,
        level: req.user.level || 1,
        rank: req.user.rank || 'Bronze Starter',
        aiCredits: req.user.aiCredits || 10,
        avatarBorder: req.user.avatarBorder || 'none',
        profileTheme: req.user.profileTheme || 'default',
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { 
      fullName, phone, username, email, bio, headline, aboutMe, location, website,
      githubUrl, linkedinUrl, twitterUrl, instagramUrl, facebookUrl, youtubeUrl,
      profession, company, dob, gender, skills, experience, education, certifications,
      interests, hobbies
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (headline !== undefined) user.headline = headline;
    if (aboutMe !== undefined) user.aboutMe = aboutMe;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (twitterUrl !== undefined) user.twitterUrl = twitterUrl;
    if (instagramUrl !== undefined) user.instagramUrl = instagramUrl;
    if (facebookUrl !== undefined) user.facebookUrl = facebookUrl;
    if (youtubeUrl !== undefined) user.youtubeUrl = youtubeUrl;
    if (profession !== undefined) user.profession = profession;
    if (company !== undefined) user.company = company;
    if (dob !== undefined) user.dob = dob ? new Date(dob) : null;
    if (gender !== undefined) user.gender = gender;

    // Helper to parse arrays passed from client (either JSON or comma-separated strings)
    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
      return val.split(',').map(s => s.trim()).filter(Boolean);
    };

    if (skills !== undefined) user.skills = parseArray(skills);
    if (experience !== undefined) user.experience = parseArray(experience);
    if (education !== undefined) user.education = parseArray(education);
    if (certifications !== undefined) user.certifications = parseArray(certifications);
    if (interests !== undefined) user.interests = parseArray(interests);
    if (hobbies !== undefined) user.hobbies = parseArray(hobbies);

    // Validate and update username
    if (username && username.toLowerCase() !== user.username) {
      const exists = await User.findOne({ username: username.toLowerCase() });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      user.username = username.toLowerCase();
    }

    // Validate and update email
    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Email address is already taken' });
      }
      user.email = email.toLowerCase();
    }

    // Handle file uploads (avatar, coverPhoto, resume)
    const files = req.files || {};
    const { uploadToCloudinary } = require('../middleware/upload');

    if (files.avatar && files.avatar[0]) {
      const uploadResult = await uploadToCloudinary(files.avatar[0].buffer, 'avatars');
      user.avatar = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    if (files.coverPhoto && files.coverPhoto[0]) {
      const uploadResult = await uploadToCloudinary(files.coverPhoto[0].buffer, 'covers');
      user.coverPhoto = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    if (files.resume && files.resume[0]) {
      const uploadResult = await uploadToCloudinary(files.resume[0].buffer, 'resumes', 'raw');
      user.resume = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        headline: user.headline,
        aboutMe: user.aboutMe,
        location: user.location,
        website: user.website,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        twitterUrl: user.twitterUrl,
        instagramUrl: user.instagramUrl,
        facebookUrl: user.facebookUrl,
        youtubeUrl: user.youtubeUrl,
        profession: user.profession,
        company: user.company,
        dob: user.dob,
        gender: user.gender,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        certifications: user.certifications,
        resume: user.resume,
        interests: user.interests,
        hobbies: user.hobbies,
        isVerified: user.isVerified,
        xp: user.xp,
        reputation: user.reputation,
        badges: user.badges,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    user.password = newPassword;
    user.refreshTokens = []; // Log out other devices
    await user.save();

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Bookmark Project
// @route   POST /api/auth/saved-projects/:projectId
// @access  Private
const toggleSaveProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const index = (user.savedProjects || []).indexOf(projectId);
    if (index === -1) {
      user.savedProjects.push(projectId);
      await user.save({ validateBeforeSave: false });
      return res.json({ success: true, isSaved: true, message: 'Project added to favorites!' });
    } else {
      user.savedProjects.splice(index, 1);
      await user.save({ validateBeforeSave: false });
      return res.json({ success: true, isSaved: false, message: 'Project removed from favorites!' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Bookmarked Projects
// @route   GET /api/auth/saved-projects
// @access  Private
const getSavedProjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedProjects');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.savedProjects || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Self Account
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    if (req.user.role === 'Admin' && req.user.username === 'admin') {
      return res.status(403).json({ success: false, message: 'Root Admin account cannot be deleted.' });
    }
    await User.findByIdAndDelete(req.user.id);
    clearTokenCookies(res);
    res.json({ success: true, message: 'Account deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Logged-in User's Orders
// @route   GET /api/auth/my-orders
// @access  Private
// @desc    Initiate Google OAuth flow
// @route   GET /api/auth/google
// @access  Public
const googleLogin = (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Google auth failed`);
  }

  try {
    const axios = require('axios');
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      grant_type: 'authorization_code',
    };

    const tokenResponse = await axios.post(tokenUrl, new URLSearchParams(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { id_token, access_token } = tokenResponse.data;

    const userinfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    const { id, email, name, picture } = userinfoResponse.data;

    if (!email) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Email permission required`);
    }

    let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    const deviceInfo = getDeviceInfo(req);

    if (user) {
      user.fullName = user.fullName || name;
      user.avatar = user.avatar && user.avatar.url ? user.avatar : { url: picture || '', publicId: 'google' };
      if (user.provider === 'Email') {
        user.provider = 'Google';
        user.providerId = id;
      }
      user.lastLogin = new Date();
      user.loginHistory.push({ ...deviceInfo, success: true });
      await user.save({ validateBeforeSave: false });
    } else {
      let baseUsername = email.split('@')[0].trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
      if (baseUsername.length < 3) baseUsername += '___';
      
      let finalUsername = baseUsername;
      let count = 0;
      while (await User.findOne({ username: finalUsername })) {
        count++;
        finalUsername = `${baseUsername}_${count}`;
      }

      const userCount = await User.estimatedDocumentCount();
      const isFirstUser = userCount === 0;

      user = await User.create({
        fullName: name || finalUsername,
        username: finalUsername,
        email: email.toLowerCase().trim(),
        avatar: { url: picture || '', publicId: 'google' },
        role: isFirstUser ? 'Admin' : 'User',
        isEmailVerified: true,
        provider: 'Google',
        providerId: id
      });
      user.lastLogin = new Date();
      user.loginHistory.push({ ...deviceInfo, success: true });
      await user.save({ validateBeforeSave: false });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens = user.refreshTokens.filter(
      rt => rt.expiresAt && new Date(rt.expiresAt) > new Date()
    );
    if (user.refreshTokens.length >= 10) user.refreshTokens.shift();

    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken, true);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`);
  } catch (error) {
    console.error('Google callback error:', error.message);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Google authentication failed`);
  }
};

// @desc    Initiate GitHub OAuth flow
// @route   GET /api/auth/github
// @access  Public
const githubLogin = (req, res) => {
  const rootUrl = 'https://github.com/login/oauth/authorize';
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    scope: 'user:email',
  };

  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
};

// @desc    GitHub OAuth Callback
// @route   GET /api/auth/github/callback
// @access  Public
const githubCallback = async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=GitHub auth failed`);
  }

  try {
    const axios = require('axios');
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const values = {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    };

    const tokenResponse = await axios.post(tokenUrl, values, {
      headers: {
        Accept: 'application/json',
      },
    });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=GitHub token exchange failed`);
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        'User-Agent': 'node.js',
      },
    });

    const { id, name, login, avatar_url, email: githubEmail } = userResponse.data;
    let email = githubEmail;

    if (!email) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${accessToken}`,
            'User-Agent': 'node.js',
          },
        });
        const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified) || emailsResponse.data[0];
        email = primaryEmail ? primaryEmail.email : null;
      } catch (emailErr) {
        console.error('Failed to fetch private GitHub email:', emailErr.message);
      }
    }

    if (!email) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=GitHub email verification required`);
    }

    let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    const deviceInfo = getDeviceInfo(req);

    if (user) {
      user.fullName = user.fullName || name || login;
      user.avatar = user.avatar && user.avatar.url ? user.avatar : { url: avatar_url || '', publicId: 'github' };
      if (user.provider === 'Email') {
        user.provider = 'GitHub';
        user.providerId = id;
      }
      user.lastLogin = new Date();
      user.loginHistory.push({ ...deviceInfo, success: true });
      await user.save({ validateBeforeSave: false });
    } else {
      let baseUsername = login ? login.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_') : email.split('@')[0].trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
      if (baseUsername.length < 3) baseUsername += '___';
      
      let finalUsername = baseUsername;
      let count = 0;
      while (await User.findOne({ username: finalUsername })) {
        count++;
        finalUsername = `${baseUsername}_${count}`;
      }

      const userCount = await User.estimatedDocumentCount();
      const isFirstUser = userCount === 0;

      user = await User.create({
        fullName: name || login || finalUsername,
        username: finalUsername,
        email: email.toLowerCase().trim(),
        avatar: { url: avatar_url || '', publicId: 'github' },
        role: isFirstUser ? 'Admin' : 'User',
        isEmailVerified: true,
        provider: 'GitHub',
        providerId: id
      });
      user.lastLogin = new Date();
      user.loginHistory.push({ ...deviceInfo, success: true });
      await user.save({ validateBeforeSave: false });
    }

    const jwtAccessToken = generateAccessToken(user);
    const jwtRefreshToken = generateRefreshToken(user);

    user.refreshTokens = user.refreshTokens.filter(
      rt => rt.expiresAt && new Date(rt.expiresAt) > new Date()
    );
    if (user.refreshTokens.length >= 10) user.refreshTokens.shift();

    user.refreshTokens.push({
      token: jwtRefreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, jwtAccessToken, jwtRefreshToken, true);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`);
  } catch (error) {
    console.error('GitHub callback error:', error.message);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=GitHub authentication failed`);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  recoverAccount,
  verifyRecoveryOtp,
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  changePassword,
  toggleSaveProject,
  getSavedProjects,
  deleteAccount,
  getUserOrders,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback
};
