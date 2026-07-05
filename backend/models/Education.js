const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      required: [true, 'Degree/Certificate name is required'],
      trim: true
    },
    school: {
      type: String,
      required: [true, 'Institute/Board name is required'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true
    },
    grade: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Education', educationSchema);
