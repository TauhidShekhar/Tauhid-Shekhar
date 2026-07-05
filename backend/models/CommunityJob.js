const mongoose = require('mongoose');

const communityJobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    location: {
      type: String,
      default: 'Remote'
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Freelance'],
      required: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    requirements: [{ type: String }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

communityJobSchema.index({ jobType: 1 });
communityJobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityJob', communityJobSchema);
