const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Sender email is required'],
      trim: true
    },
    phone: {
      type: String
    },
    subject: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: [true, 'Message text is required']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    reply: {
      type: String
    },
    repliedAt: {
      type: Date
    },
    dynamicFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

messageSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
