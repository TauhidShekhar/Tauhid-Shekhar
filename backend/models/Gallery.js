const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    image: {
      url: { type: String, required: [true, 'Image URL is required'] },
      publicId: { type: String }
    },
    category: { type: String },
    tags: [{ type: String }],
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

gallerySchema.index({ displayOrder: 1, createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
