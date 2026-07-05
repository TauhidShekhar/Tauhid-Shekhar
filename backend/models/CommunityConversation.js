const mongoose = require('mongoose');

const communityConversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isGroup: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    groupAvatar: {
      type: String,
      default: ''
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityMessage'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityConversation', communityConversationSchema);
