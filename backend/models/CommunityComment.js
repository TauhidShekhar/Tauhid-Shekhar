const mongoose = require('mongoose');

const communityCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityComment',
      default: null
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required']
    },
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPinned: {
      type: Boolean,
      default: false
    },
    reports: [
      {
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

communityCommentSchema.index({ postId: 1 });
communityCommentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model('CommunityComment', communityCommentSchema);
