const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Feature name is required'],
    trim: true
  },
  category: { 
    type: String, 
    required: [true, 'Feature category is required'],
    trim: true
  },
  icon: { 
    type: String, 
    default: 'FaCog' 
  },
  description: { 
    type: String, 
    required: [true, 'Feature description is required'],
    trim: true
  },
  screenshot: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  version: { 
    type: String, 
    default: '1.0.0' 
  },
  releaseDate: { 
    type: Date, 
    default: Date.now 
  },
  loginRequired: { 
    type: Boolean, 
    default: false 
  },
  isNewFeature: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  isPublished: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Feature', featureSchema);
