const mongoose = require('mongoose');

const aiChatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'New AI Consultation'
    },
    category: {
      type: String,
      required: true,
      default: 'General'
    },
    isBookmarked: {
      type: Boolean,
      default: false
    },
    messages: [aiChatMessageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIChat', aiChatSchema);
