const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Reply content cannot be blank'],
      trim: true
    }
  },
  { timestamps: true }
);

const resumeCommentSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be blank'],
      trim: true
    },
    replies: [replySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeComment', resumeCommentSchema);
