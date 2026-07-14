const mongoose = require('mongoose');

const communityAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityQuestion',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Answer content is required']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    images: [{ url: String, publicId: String }],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAccepted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

communityAnswerSchema.index({ question: 1 });
communityAnswerSchema.index({ author: 1 });

module.exports = mongoose.model('CommunityAnswer', communityAnswerSchema);
