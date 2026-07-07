const mongoose = require('mongoose');

const communityNotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'reply', 'invite', 'follow', 'join_request', 'join_accept', 'challenge_reward', 'coin_reward'],
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      default: null
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityGroup',
      default: null
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

communityNotificationSchema.index({ recipient: 1, read: 1 });
communityNotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityNotification', communityNotificationSchema);
