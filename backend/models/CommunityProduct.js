const mongoose = require('mongoose');

const communityProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    priceCoins: { type: Number, default: 0 },
    priceReal: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['membership', 'theme', 'avatar_frame', 'badge', 'template', 'ebook', 'course', 'ai_credits'],
      required: true
    },
    itemKey: { type: String, unique: true, required: true }, // e.g. 'premium_yearly', 'gold_border', 'ai_credits_100'
    imageUrl: { type: String, default: '' },
    stock: { type: Number, default: -1 }, // -1 means unlimited
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityProduct', communityProductSchema);
