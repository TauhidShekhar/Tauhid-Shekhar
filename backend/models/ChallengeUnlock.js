const mongoose = require('mongoose');

const challengeUnlockSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityChallenge',
      required: true
    },
    unlockedLevel: {
      type: Number, // 1 (Free), 2 (Algorithm), 3 (Pseudo Code), 4 (Partial Code), 5 (Full Solution)
      required: true
    },
    coinsSpent: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Unique index to prevent duplicate unlocks/charges
challengeUnlockSchema.index({ user: 1, challenge: 1, unlockedLevel: 1 }, { unique: true });

module.exports = mongoose.model('ChallengeUnlock', challengeUnlockSchema);
