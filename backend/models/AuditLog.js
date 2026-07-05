const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      required: [true, 'Action is required']
      // e.g. 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    },
    resource: {
      type: String
      // e.g. 'Project', 'Skill', 'User'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
