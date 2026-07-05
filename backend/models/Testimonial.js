const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Testimonial name is required'],
      trim: true
    },
    role: { type: String },
    company: { type: String },
    avatar: {
      url: String,
      publicId: String
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5
    },
    content: {
      type: String,
      required: [true, 'Testimonial content is required']
    },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
