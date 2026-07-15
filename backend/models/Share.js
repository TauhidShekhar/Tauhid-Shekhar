const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    contentType: {
      type: String,
      required: true,
      enum: ['profile', 'post', 'doubt', 'blog', 'course', 'community', 'event', 'achievement', 'certificate', 'portfolio']
    },
    contentId: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      required: true
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Share', shareSchema);
