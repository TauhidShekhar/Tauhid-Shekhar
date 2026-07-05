const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
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
      trim: true
    },
    companyName: {
      type: String,
      trim: true
    },
    selectedService: {
      type: String,
      required: [true, 'Selected service is required'],
      trim: true
    },
    budget: {
      type: String,
      required: [true, 'Budget requirement is required'],
      trim: true
    },
    projectType: {
      type: String,
      trim: true
    },
    deadline: {
      type: Date
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
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
      enum: ['New', 'Contacted', 'In Progress', 'Completed', 'Rejected'],
      default: 'New'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
