const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      required: [true, 'Slug is required']
    },
    content: {
      type: String,
      required: [true, 'Blog content is required']
    },
    excerpt: {
      type: String
    },
    coverImage: {
      url: String,
      publicId: String
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [{ type: String }],
    category: { type: String },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },

    // ── SEO Meta ───────────────────────────────────────────────────
    metaTitle: { type: String },
    metaDescription: { type: String }
  },
  { timestamps: true, optimisticConcurrency: true }
);

blogSchema.index({ slug: 1, status: 1 });

// ─── Pre-save: Auto-generate slug from title if not set ──────────────
blogSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')   // Remove special characters
      .replace(/[\s_]+/g, '-')     // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, '');    // Trim leading/trailing hyphens
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
