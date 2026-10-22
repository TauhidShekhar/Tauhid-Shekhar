const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resource, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};

    if (action) query.action = { $regex: action, $options: 'i' };
    if (resource && resource !== 'All') query.resource = resource;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (page - 1) * limit;
    const count = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'fullName username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit) || 1,
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
