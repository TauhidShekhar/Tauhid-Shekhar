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

// @desc    Get share stats
// @route   GET /api/analytics/shares
// @access  Private/Admin
const getShareStats = async (req, res, next) => {
  try {
    const Share = require('../models/Share');
    const CommunityPost = require('../models/CommunityPost');
    const CommunityQuestion = require('../models/CommunityQuestion');

    const totalShares = await Share.countDocuments({});

    // Platform breakdown
    const platformsRaw = await Share.aggregate([
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const platformBreakdown = platformsRaw.map(p => ({ platform: p._id, count: p.count }));

    // Daily graph (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyRaw = await Share.aggregate([
      { $match: { sharedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$sharedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const dailyGraph = dailyRaw.map(d => ({ date: d._id, count: d.count }));

    // Monthly graph (last 12 months)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const monthlyRaw = await Share.aggregate([
      { $match: { sharedAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$sharedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const monthlyGraph = monthlyRaw.map(m => ({ month: m._id, count: m.count }));

    // Top shared users (profile contentType)
    const topUsersRaw = await Share.aggregate([
      { $match: { contentType: 'profile' } },
      { $group: { _id: '$contentId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Resolve user details
    const topSharedUsers = [];
    for (const item of topUsersRaw) {
      const query = mongoose.isValidObjectId(item._id) ? { _id: item._id } : { username: item._id };
      const user = await User.findOne(query).select('fullName username avatar');
      topSharedUsers.push({
        identifier: item._id,
        fullName: user ? user.fullName : item._id,
        username: user ? user.username : item._id,
        avatar: user?.avatar?.url || '',
        count: item.count
      });
    }

    // Top shared posts
    const topPostsRaw = await Share.aggregate([
      { $match: { contentType: 'post' } },
      { $group: { _id: '$contentId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topSharedPosts = [];
    for (const item of topPostsRaw) {
      if (mongoose.isValidObjectId(item._id)) {
        const post = await CommunityPost.findById(item._id).select('title author').populate('author', 'fullName');
        topSharedPosts.push({
          id: item._id,
          title: post ? post.title : 'Deleted Post',
          author: post?.author?.fullName || 'Unknown',
          count: item.count
        });
      }
    }

    // Top shared doubts
    const topDoubtsRaw = await Share.aggregate([
      { $match: { contentType: 'doubt' } },
      { $group: { _id: '$contentId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topSharedDoubts = [];
    for (const item of topDoubtsRaw) {
      if (mongoose.isValidObjectId(item._id)) {
        const doubt = await CommunityQuestion.findById(item._id).select('title author').populate('author', 'fullName');
        topSharedDoubts.push({
          id: item._id,
          title: doubt ? doubt.title : 'Deleted Doubt',
          author: doubt?.author?.fullName || 'Unknown',
          count: item.count
        });
      }
    }

    res.json({
      success: true,
      data: {
        totalShares,
        platformBreakdown,
        dailyGraph,
        monthlyGraph,
        topSharedUsers,
        topSharedPosts,
        topSharedDoubts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export share stats to CSV
// @route   GET /api/analytics/shares/export
// @access  Private/Admin
const exportShareCSV = async (req, res, next) => {
  try {
    const Share = require('../models/Share');
    const shares = await Share.find({})
      .populate('userId', 'fullName email')
      .sort({ sharedAt: -1 });

    let csvContent = 'Date,Platform,ContentType,ContentID,SharedBy,Email\n';
    shares.forEach(s => {
      const date = s.sharedAt.toISOString();
      const platform = s.platform;
      const contentType = s.contentType;
      const contentId = s.contentId;
      const sharedBy = s.userId ? s.userId.fullName : 'Guest';
      const email = s.userId ? s.userId.email : 'N/A';
      csvContent += `"${date}","${platform}","${contentType}","${contentId}","${sharedBy}","${email}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=share_analytics.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackView,
  getStats,
  getSystemPerformance,
  getShareStats,
  exportShareCSV
};

