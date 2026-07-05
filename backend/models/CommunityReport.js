const mongoose = require('mongoose');

const communityReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetType: {
      type: String,
      enum: ['Post', 'Comment', 'User'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType'
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending'
    },
    actionTaken: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

communityReportSchema.index({ status: 1 });
communityReportSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('CommunityReport', communityReportSchema);
