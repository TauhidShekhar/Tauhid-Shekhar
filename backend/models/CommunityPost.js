const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Post content is required']
    },
    mediaUrl: {
      type: String,
      default: ''
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'pdf', 'document', 'none'],
      default: 'none'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityGroup',
      default: null
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['Like', 'Love', 'Celebrate', 'Insightful', 'Funny'] }
      }
    ],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['active', 'reported', 'archived'],
      default: 'active'
    },
    category: {
      type: String,
      default: 'General'
    },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

// Indexes for faster feed search & indexing
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ group: 1 });
communityPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
