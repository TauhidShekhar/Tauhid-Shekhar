const mongoose = require('mongoose');

const communityChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    codeTemplate: { type: String },
    testCases: [
      {
        input: String,
        output: String
      }
    ],
    xpReward: { type: Number, default: 100 },
    coinsReward: { type: Number, default: 20 },
    solvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    activeDate: { type: Date, unique: true, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityChallenge', communityChallengeSchema);
