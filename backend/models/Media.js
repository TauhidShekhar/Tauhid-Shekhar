const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required']
    },
    originalName: { type: String },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    publicId: { type: String },
    fileType: {
      type: String,
      enum: ['image', 'video', 'pdf', 'document', 'archive'],
      required: [true, 'File type is required']
    },
    fileSize: { type: Number },
    mimeType: { type: String },
    dimensions: {
      width: Number,
      height: Number
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [{ type: String }],
    alt: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
