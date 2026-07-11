const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Message = require('../models/Message');
const User = require('../models/User');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Blog = require('../models/Blog');
const AuditLog = require('../models/AuditLog');

// @desc    Track page view
// @route   POST /api/analytics/track
// @access  Public
const trackView = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { page, browser, device } = req.body;

    let stats = await Analytics.findOne({ date: today });
    if (!stats) {
      stats = new Analytics({ date: today, pageViews: 1, uniqueVisitors: 1 });
    } else {
      stats.pageViews += 1;
      // Simple IP/unique tracking can be expanded, but let's do simple increment
      stats.uniqueVisitors += 1;
    }

    // Update top pages
    if (page) {
      const pageIndex = stats.topPages.findIndex(p => p.page === page);
      if (pageIndex === -1) {
        stats.topPages.push({ page, views: 1 });
      } else {
        stats.topPages[pageIndex].views += 1;
      }
    }

    // Update device
    if (device) {
      if (device === 'mobile') stats.deviceBreakdown.mobile += 1;
      else if (device === 'tablet') stats.deviceBreakdown.tablet += 1;
      else stats.deviceBreakdown.desktop += 1;
    }

    // Update browser
    if (browser) {
      const browserIndex = stats.browserBreakdown.findIndex(b => b.browser === browser);
      if (browserIndex === -1) {
        stats.browserBreakdown.push({ browser, count: 1 });
      } else {
        stats.browserBreakdown[browserIndex].count += 1;
      }
    }

    await stats.save();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics metrics
// @route   GET /api/analytics/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const projectsCount = await Project.countDocuments({});
    const skillsCount = await Skill.countDocuments({});
    const messagesCount = await Message.countDocuments({});
    const unreadMessagesCount = await Message.countDocuments({ isRead: false });
    const usersCount = await User.countDocuments({});
    const experienceCount = await Experience.countDocuments({});
    const educationCount = await Education.countDocuments({});
    const certificateCount = await Certificate.countDocuments({});
    const achievementCount = await Achievement.countDocuments({});
    const blogCount = await Blog.countDocuments({});

    // Calculate total visitors (aggregate of all uniqueVisitors)
    const totalVisitorsAgg = await Analytics.aggregate([
      { $group: { _id: null, total: { $sum: '$uniqueVisitors' } } }
    ]);
    const totalVisitors = totalVisitorsAgg[0]?.total || 0;

    // Fetch recent admin activities
    const recentActivity = await AuditLog.find({})
      .populate('user', 'fullName username')
      .sort({ createdAt: -1 })
      .limit(6);

    // Fetch analytics history for past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const history = await Analytics.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: 1 });

    // Fetch top landing pages
    const aggResult = await Analytics.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      { $unwind: '$topPages' },
      { $group: { _id: '$topPages.page', totalViews: { $sum: '$topPages.views' } } },
      { $sort: { totalViews: -1 } },
      { $limit: 5 }
    ]);

    // Aggregate device breakdown
    const devices = await Analytics.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          desktop: { $sum: '$deviceBreakdown.desktop' },
          mobile: { $sum: '$deviceBreakdown.mobile' },
          tablet: { $sum: '$deviceBreakdown.tablet' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          projects: projectsCount,
          skills: skillsCount,
          messages: messagesCount,
          unreadMessages: unreadMessagesCount,
          users: usersCount,
          experiences: experienceCount,
          educations: educationCount,
          certificates: certificateCount,
          achievements: achievementCount,
          blogs: blogCount,
          visitors: totalVisitors
        },
        system: {
          database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
          api: 'Online',
          website: 'Online'
        },
        recentActivity: recentActivity.map(act => ({
          id: act._id,
          user: act.user?.fullName || 'System',
          action: act.action,
          resource: act.resource,
          timestamp: act.createdAt
        })),
        visitorChart: history.map(h => ({
          date: h.date.toISOString().slice(0, 10),
          views: h.pageViews,
          visitors: h.uniqueVisitors
        })),
        topPages: aggResult.map(a => ({ page: a._id, views: a.totalViews })),
        deviceBreakdown: devices[0] || { desktop: 0, mobile: 0, tablet: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time system performance health metrics
// @route   GET /api/analytics/system-metrics
// @access  Private/Admin
const getSystemPerformance = async (req, res, next) => {
  try {
    const { getSystemMetrics } = require('../middleware/performanceMiddleware');
    const data = await getSystemMetrics();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackView,
  getStats,
  getSystemPerformance
};
