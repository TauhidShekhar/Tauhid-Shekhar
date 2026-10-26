const mongoose = require('mongoose');

const adminNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  author: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const orderSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      index: true
    },
    requestType: {
      type: String,
      enum: ['order', 'inquiry'],
      default: 'order'
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    packageName: {
      type: String,
      default: 'Custom'
    },
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    selectedService: {
      type: String,
      required: [true, 'Selected service is required'],
      trim: true
    },
    budget: {
      type: String,
      default: 'Flexible / To Discuss',
      trim: true
    },
    projectType: {
      type: String,
      trim: true,
      default: ''
    },
    deadline: {
      type: Date,
      default: null
    },
    timelineExpectation: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Project description or inquiry note is required'],
      trim: true
    },
    attachment: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      fileName: { type: String, default: '' },
      fileSize: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: [
        'New',
        'Pending Review',
        'Contacted',
        'Quotation Sent',
        'In Progress',
        'Completed',
        'Rejected',
        'Cancelled'
      ],
      default: 'New'
    },
    adminNotes: [adminNoteSchema]
  },
  { timestamps: true }
);

// Auto-generate human-friendly reference ID before validation if missing
orderSchema.pre('validate', function (next) {
  if (!this.referenceId) {
    const prefix = this.requestType === 'inquiry' ? 'TS-INQ' : 'TS-ORD';
    const year = new Date().getFullYear();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    this.referenceId = `${prefix}-${year}-${randomCode}`;
  }
  next();
});

orderSchema.index({ requestType: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
