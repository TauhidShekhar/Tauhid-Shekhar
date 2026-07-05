const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      unique: true
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage is required'],
      min: 0,
      max: 100
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['programming', 'frontend', 'backend', 'database', 'tools', 'concepts'],
      default: 'frontend'
    },
    iconName: {
      type: String,
      default: '' // react-icons name for dynamic lookup (e.g. 'SiReact')
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
