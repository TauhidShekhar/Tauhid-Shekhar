const mongoose = require('mongoose');

const communityQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Question content details are required']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please select a language/topic category'],
      default: 'Other'
    },
    tags: [{ type: String }],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityAnswer',
      default: null
    },
    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

communityQuestionSchema.index({ author: 1 });
communityQuestionSchema.index({ category: 1 });
communityQuestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityQuestion', communityQuestionSchema);
