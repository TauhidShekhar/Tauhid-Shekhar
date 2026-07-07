const mongoose = require('mongoose');

const communityGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    coverImage: {
      type: String,
      default: ''
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'secret'],
      default: 'public'
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'English'
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true
    },
    category: {
      type: String,
      default: 'General'
    },
    tags: [{ type: String }],
    rules: [{ type: String }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    invitedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mutedMembers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        mutedUntil: Date
      }
    ],
    bannedMembers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        bannedAt: { type: Date, default: Date.now }
      }
    ],
    uploads: [
      {
        fileName: { type: String, required: true },
        originalName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number, required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityGroup', communityGroupSchema);
