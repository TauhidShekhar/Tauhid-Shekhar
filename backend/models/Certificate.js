const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true
    },
    issuer: {
      type: String,
      required: [true, 'Issuer is required'],
      trim: true
    },
    date: { type: Date },
    credentialId: { type: String },
    credentialUrl: { type: String },
    image: {
      url: String,
      publicId: String
    },
    pdf: {
      url: String,
      publicId: String
    },
    pdfUrl: { type: String },
    category: { type: String },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
