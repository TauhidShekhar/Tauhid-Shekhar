const mongoose = require('mongoose');

const communityXPConfigSchema = new mongoose.Schema(
  {
    actionKey: { type: String, unique: true, required: true }, // e.g. 'create_post', 'comment', 'daily_challenge'
    xpReward: { type: Number, required: true },
    coinsReward: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityXPConfig', communityXPConfigSchema);
