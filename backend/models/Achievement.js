const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true
    },
    description: { type: String },
    icon: { type: String },      // Icon class name (e.g. 'fa-trophy')
    date: { type: Date },
    category: { type: String },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

achievementSchema.index({ displayOrder: 1, date: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
