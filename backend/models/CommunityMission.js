const mongoose = require('mongoose');

const communityMissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['daily', 'weekly'], required: true },
    postsRequired: { type: Number, default: 0 },
    postsCreated: { type: Number, default: 0 },
    commentsRequired: { type: Number, default: 0 },
    commentsCreated: { type: Number, default: 0 },
    likesRequired: { type: Number, default: 0 },
    likesGiven: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    rewardClaimed: { type: Boolean, default: false },
    resetAt: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityMission', communityMissionSchema);
