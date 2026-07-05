const mongoose = require('mongoose');

const communityOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityProduct', required: true },
    purchaseType: { type: String, enum: ['coins', 'payment'], required: true },
    pricePaid: { type: Number, required: true },
    paymentId: { type: String }, // Stripe or Razorpay receipt / checkout session reference
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'cancelled'],
      default: 'delivered'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityOrder', communityOrderSchema);
