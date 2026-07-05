const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, 'Role/Position is required'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    points: [{ type: String }],
    type: {
      type: String,
      enum: ['design', 'development', 'other'],
      default: 'development'
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experience', experienceSchema);
