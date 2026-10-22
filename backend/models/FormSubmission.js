const mongoose = require('mongoose');

const fileAttachmentSchema = new mongoose.Schema(
  {
    fieldKey: { type: String, required: true },
    fileId: {
      type: String,
      required: true,
      default: () => `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    isSecure: { type: Boolean, default: true }
  },
  { _id: false }
);

const adminNoteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true, trim: true },
    author: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const formSubmissionSchema = new mongoose.Schema(
  {
    formRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
      index: true
    },
    formId: {
      type: String,
      required: true,
      index: true
    },
    formTitleSnapshot: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'General',
      index: true
    },
    formVersion: {
      type: Number,
      default: 1
    },
    fieldSnapshots: {
      type: Array,
      default: []
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    files: {
      type: [fileAttachmentSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['New', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected', 'Archived'],
      default: 'New',
      index: true
    },
    adminNotes: {
      type: [adminNoteSchema],
      default: []
    },
    emailDeliveryStatus: {
      adminEmailSent: { type: Boolean, default: false },
      adminEmailError: { type: String, default: '' },
      userEmailSent: { type: Boolean, default: false },
      userEmailError: { type: String, default: '' },
      sentAt: { type: Date, default: null }
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// High performance compound indexes for fast searching & filtering
formSubmissionSchema.index({ formRef: 1, createdAt: -1 });
formSubmissionSchema.index({ formId: 1, createdAt: -1 });
formSubmissionSchema.index({ formRef: 1, status: 1 });
formSubmissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
