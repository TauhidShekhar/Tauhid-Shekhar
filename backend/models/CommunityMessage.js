const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityConversation',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      trim: true,
      default: ''
    },
    mediaUrl: {
      type: String,
      default: ''
    },
    mediaType: {
      type: String,
      enum: ['image', 'file', 'audio', 'none'],
      default: 'none'
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

communityMessageSchema.index({ conversationId: 1 });
communityMessageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);
