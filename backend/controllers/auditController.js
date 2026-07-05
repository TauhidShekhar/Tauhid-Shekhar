const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resource, page = 1, limit = 20 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (resource) query.resource = resource;

    const skip = (page - 1) * limit;
    const count = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'fullName username email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
