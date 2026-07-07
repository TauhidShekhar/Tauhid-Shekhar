const mongoose = require('mongoose');

const contentVersionSchema = new mongoose.Schema(
  {
    resourceModel: {
      type: String,
      required: true,
      enum: ['Project', 'Setting', 'Skill', 'Experience', 'Education', 'Certificate', 'Achievement', 'Testimonial', 'Blog']
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    version: {
      type: Number,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of versions per resource
contentVersionSchema.index({ resourceModel: 1, resourceId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('ContentVersion', contentVersionSchema);
