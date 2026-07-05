const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      unique: true
    },
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    topPages: [
      {
        page: String,
        views: Number
      }
    ],
    deviceBreakdown: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    },
    browserBreakdown: [
      {
        browser: String,
        count: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
