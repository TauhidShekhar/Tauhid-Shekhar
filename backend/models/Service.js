const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Standard', 'Premium', 'Custom'],
    default: 'Standard'
  },
  price: {
    type: String,
    required: true,
    default: '$99'
  },
  description: {
    type: String,
    default: ''
  },
  deliveryDays: {
    type: Number,
    default: 5
  },
  revisions: {
    type: String,
    default: 'Unlimited'
  },
  features: [{ type: String }],
  isPopular: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const deliverableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' }
}, { _id: true });

const milestoneSchema = new mongoose.Schema({
  step: { type: Number, default: 1 },
  title: { type: String, required: true },
  duration: { type: String, default: '1-2 Days' },
  description: { type: String, default: '' }
}, { _id: true });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const portfolioReferenceSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  customTitle: { type: String, default: '' },
  customDesc: { type: String, default: '' },
  demoUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  isCustom: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true }
}, { _id: true });

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Web Development',
      trim: true
    },
    shortDescription: {
      type: String,
      default: ''
    },
    fullDescription: {
      type: String,
      default: ''
    },
    // Backward compatibility for existing cards
    desc: {
      type: String,
      default: function () {
        return this.shortDescription || '';
      }
    },
    price: {
      type: String,
      required: [true, 'Starting price is required'],
      default: '$99'
    },
    pricingModel: {
      type: String,
      enum: ['starting_at', 'fixed', 'hourly', 'custom_quote'],
      default: 'starting_at'
    },
    packages: [packageSchema],
    deliverables: [deliverableSchema],
    timeline: {
      estimatedDays: { type: Number, default: 7 },
      milestones: [milestoneSchema],
      clientDependencies: [{ type: String }],
      revisionsIncluded: { type: String, default: 'Unlimited' }
    },
    process: [{
      step: { type: Number, default: 1 },
      title: { type: String, required: true },
      description: { type: String, default: '' }
    }],
    faqs: [faqSchema],
    portfolioReferences: [portfolioReferenceSchema],
    showPortfolioReferences: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'disabled', 'archived'],
      default: 'published'
    },
    featured: {
      type: Boolean,
      default: false
    },
    features: [{ type: String }],
    iconName: {
      type: String,
      default: 'FaLaptopCode'
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: String, default: '' },
      ogImage: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

// Auto-generate slug and sync shortDescription/desc if missing
serviceSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  if (!this.desc && this.shortDescription) {
    this.desc = this.shortDescription;
  }
  if (!this.shortDescription && this.desc) {
    this.shortDescription = this.desc;
  }
  next();
});

serviceSchema.index({ status: 1, displayOrder: 1, createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);
