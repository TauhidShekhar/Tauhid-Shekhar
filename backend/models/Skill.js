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
      enum: ['Programming', 'Frontend', 'Backend', 'Database', 'Tools', 'Concepts', 'All', 'programming', 'frontend', 'backend', 'database', 'tools', 'concepts'],
      default: 'Frontend'
    },
    logoType: {
      type: String,
      enum: ['auto', 'custom'],
      default: 'auto'
    },
    logoUrl: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
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
