const mongoose = require('mongoose');

const contentDraftSchema = new mongoose.Schema(
  {
    resourceModel: {
      type: String,
      required: true,
      enum: ['Project', 'Setting', 'Skill', 'Experience', 'Education', 'Certificate', 'Achievement', 'Testimonial', 'Blog']
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false // Null if it is a draft for a new resource creation
    },
    draftData: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContentDraft', contentDraftSchema);
