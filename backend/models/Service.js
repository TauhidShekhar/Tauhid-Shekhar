const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true
    },
    desc: {
      type: String,
      required: [true, 'Service description is required']
    },
    price: {
      type: String,
      required: [true, 'Starting price is required'],
      default: '$99'
    },
    features: [{ type: String }],
    iconName: {
      type: String,
      default: 'FaLaptopCode'
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

serviceSchema.index({ displayOrder: 1, createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);
