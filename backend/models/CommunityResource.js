const mongoose = require('mongoose');

const communityResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true
    },
    description: {
      type: String
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      default: 'General'
    },
    tags: [{ type: String }],
    downloadsCount: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

communityResourceSchema.index({ category: 1 });
communityResourceSchema.index({ downloadsCount: -1 });

module.exports = mongoose.model('CommunityResource', communityResourceSchema);
