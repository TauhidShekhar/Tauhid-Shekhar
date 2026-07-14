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
      default: 'Frontend'
    },
    categories: {
      type: [String],
      default: ['Frontend']
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
    useCategoryFallback: {
      type: Boolean,
      default: true
    },
    primaryCategory: {
      type: String,
      default: ''
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

skillSchema.index({ displayOrder: 1 });

// Pre-save hook to normalize category (string) to categories (array)
skillSchema.pre('save', function(next) {
  if (this.category && (!this.categories || this.categories.length === 0)) {
    this.categories = [this.category];
  }
  // Ensure title-case capitalization on categories
  if (this.categories && this.categories.length > 0) {
    this.categories = this.categories.map(cat => {
      if (!cat) return 'Frontend';
      const c = cat.trim().toLowerCase();
      if (c === 'programming') return 'Programming';
      if (c === 'frontend') return 'Frontend';
      if (c === 'backend') return 'Backend';
      if (c === 'database') return 'Database';
      if (c === 'tools') return 'Tools';
      if (c === 'concepts') return 'Concepts';
      return cat.charAt(0).toUpperCase() + cat.slice(1);
    });
    
    // Set primaryCategory if empty
    if (!this.primaryCategory) {
      this.primaryCategory = this.categories[0] || 'Frontend';
    }
  }
  next();
});

module.exports = mongoose.model('Skill', skillSchema);
