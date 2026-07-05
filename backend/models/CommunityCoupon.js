const mongoose = require('mongoose');

const communityCouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    maxUses: {
      type: Number,
      default: 100
    },
    usesCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityCoupon', communityCouponSchema);
