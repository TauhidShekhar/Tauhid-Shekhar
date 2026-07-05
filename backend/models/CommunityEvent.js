const mongoose = require('mongoose');

const communityEventSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityGroup',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Event title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [1000, 'Event description cannot exceed 1000 characters']
    },
    banner: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['online', 'offline'],
      required: true
    },
    location: {
      type: String,
      required: [true, 'Location or meeting link is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
);

communityEventSchema.index({ group: 1 });
communityEventSchema.index({ startDate: 1 });

module.exports = mongoose.model('CommunityEvent', communityEventSchema);
