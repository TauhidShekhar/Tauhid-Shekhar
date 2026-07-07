const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number, // Positive for earning, negative for spending
      required: true
    },
    type: {
      type: String,
      enum: ['earn', 'spend'],
      required: true
    },
    source: {
      type: String,
      enum: [
        'challenge_solve',
        'daily_login',
        'streak',
        'community_participation',
        'group_activity',
        'event',
        'hint_unlock',
        'badge_purchase',
        'quiz_pass',
        'wheel_spin'
      ],
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

coinTransactionSchema.index({ user: 1 });
coinTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
