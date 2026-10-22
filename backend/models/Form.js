const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    },
    key: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'text',
        'textarea',
        'number',
        'email',
        'phone',
        'fullName',
        'firstLastName',
        'date',
        'select',
        'radio',
        'checkbox',
        'yesNo',
        'file',
        'resume',
        'multipleFile',
        'url',
        'address',
        'heading',
        'consent'
      ],
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },
    options: {
      type: [String],
      default: []
    },
    required: {
      type: Boolean,
      default: false
    },
    validation: {
      minLength: { type: Number, default: null },
      maxLength: { type: Number, default: null },
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      allowedExtensions: {
        type: [String],
        default: []
      },
      maxFileSizeMB: { type: Number, default: 10 },
      customErrorMessage: { type: String, default: '' },
      regex: { type: String, default: '' }
    },
    order: {
      type: Number,
      default: 0
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    formId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Form URL slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived', 'Closed'],
      default: 'Draft',
      index: true
    },
    isSubmissionsEnabled: {
      type: Boolean,
      default: true
    },
    closingDate: {
      type: Date,
      default: null
    },
    fields: {
      type: [formFieldSchema],
      default: []
    },
    confirmationMessage: {
      type: String,
      default: 'Thank you! Your submission has been received successfully.'
    },
    redirectUrl: {
      type: String,
      default: ''
    },
    emailNotifications: {
      notifyAdmin: { type: Boolean, default: true },
      adminEmails: {
        type: [String],
        default: ['shekhartauhid@gmail.com']
      },
      notifyUser: { type: Boolean, default: false },
      userEmailFieldKey: { type: String, default: 'email' },
      customSubject: { type: String, default: '' },
      customMessage: { type: String, default: '' }
    },
    appearance: {
      theme: {
        type: String,
        enum: ['brand', 'dark', 'light'],
        default: 'brand'
      },
      coverImage: { type: String, default: '' },
      submitButtonText: { type: String, default: 'Submit' },
      accentColor: { type: String, default: '#C2272D' }
    },
    placements: {
      type: [String],
      enum: ['directory', 'contact', 'careers', 'internship', 'community', 'standalone'],
      default: ['directory', 'standalone']
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FormCategory',
      default: null,
      index: true
    },
    isTemplate: {
      type: Boolean,
      default: false
    },
    templateCategory: {
      type: String,
      default: 'Custom'
    },
    submissionCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

formSchema.index({ status: 1, updatedAt: -1 });
formSchema.index({ placements: 1 });

module.exports = mongoose.model('Form', formSchema);
