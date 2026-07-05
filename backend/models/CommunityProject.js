const mongoose = require('mongoose');

const communityProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Project description is required']
    },
    screenshots: [{ type: String }],
    demoVideo: {
      type: String,
      default: ''
    },
    githubUrl: {
      type: String,
      default: ''
    },
    liveUrl: {
      type: String,
      default: ''
    },
    techUsed: [{ type: String }],
    progress: {
      type: String,
      enum: ['Idea', 'In Progress', 'Beta', 'Completed'],
      default: 'Idea'
    },
    lookingFor: [{ type: String }], // Contributors, Designers, Developers
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        content: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

communityProjectSchema.index({ author: 1 });
communityProjectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityProject', communityProjectSchema);
