const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Login History Sub-Schema ────────────────────────────────────────
const loginHistorySchema = new mongoose.Schema(
  {
    ip: String,
    device: String,
    browser: String,
    os: String,
    timestamp: { type: Date, default: Date.now },
    success: Boolean
  },
  { _id: false }
);

// ─── Refresh Token Sub-Schema ────────────────────────────────────────
const refreshTokenSchema = new mongoose.Schema(
  {
    token: String,
    createdAt: Date,
    expiresAt: Date
  },
  { _id: false }
);

// ─── User Schema ─────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String
    },
    password: {
      type: String,
      select: false // Exclude from queries by default
    },
    provider: {
      type: String,
      enum: ['Email', 'Google', 'GitHub'],
      default: 'Email'
    },
    providerId: {
      type: String
    },
    avatar: {
      url: String,
      publicId: String
    },
    role: {
      type: String,
      enum: ['Admin', 'User'],
      default: 'User'
    },

    // ── Email Verification ─────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // ── Password Reset ─────────────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // ── OTP ────────────────────────────────────────────────────────
    otp: String,
    otpExpires: Date,

    // ── Sessions / Tokens ──────────────────────────────────────────
    refreshTokens: [refreshTokenSchema],

    // ── Security / Audit ───────────────────────────────────────────
    loginHistory: [loginHistorySchema],
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    // ── Status ─────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    lastActive: { type: Date, default: Date.now },
    savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

    // ── Community Profile & Social ───────────────────────────────────
    coverPhoto: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    bio: { type: String, default: '' },
    headline: { type: String, default: '' },
    aboutMe: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    profession: { type: String, default: '' },
    company: { type: String, default: '' },
    dob: { type: Date },
    gender: { type: String, default: '' },
    skills: [{ type: String }],
    experience: [{ type: String }],
    education: [{ type: String }],
    certifications: [{ type: String }],
    resume: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    interests: [{ type: String }],
    hobbies: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Gamification & Streaks ───────────────────────────────────────
    xp: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    challengesSolvedCount: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    rank: { type: String, default: 'Bronze' },
    dailyStreak: { type: Number, default: 0 },
    weeklyStreak: { type: Number, default: 0 },
    monthlyStreak: { type: Number, default: 0 },
    contributionScore: { type: Number, default: 0 },
    trustScore: { type: Number, default: 100 },
    communityRank: { type: Number },
    aiCredits: { type: Number, default: 10 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date },
    avatarBorder: { type: String, default: '' },
    avatarFrame: { type: String, default: '' },
    profileTheme: { type: String, default: '' },
    spinWheelLastUsed: { type: Date },
    loginStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null },
    onboardingTourCompleted: { type: Boolean, default: false },
    viewedFeatures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feature' }],
    badges: [
      {
        name: { type: String, required: true },
        icon: { type: String, required: true },
        dateEarned: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true, optimisticConcurrency: true }
);

userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Instance Methods ────────────────────────────────────────────────

/**
 * Compare a candidate password against the stored hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if the account is currently locked.
 */
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/**
 * Increment failed login attempts; lock account for 30 min after 5 failures.
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // If a previous lock has expired, reset before incrementing
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock the account after 5 failed attempts (30-minute window)
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

/**
 * Reset failed login attempts and clear any lock.
 */
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
