const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    tag: {
      type: String,
      required: [true, 'Project tag is required'],
      enum: ['website', 'graphic', 'branding', 'ui'],
      default: 'website'
    },
    tech: [{ type: String }],
    image: {
      type: String, // Cloudinary image URL
      required: [true, 'Project image is required']
    },
    github: {
      type: String,
      default: ''
    },
    demo: {
      type: String,
      default: ''
    },
    features: [{ type: String }],
    description: {
      type: String,
      required: [true, 'Description is required']
    },

    // ── New Fields ─────────────────────────────────────────────────
    images: [{ type: String }],
    videos: [{ type: String }],
    displayOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active'
    },
    featured: {
      type: Boolean,
      default: false
    },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        userAvatar: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

projectSchema.index({ displayOrder: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
