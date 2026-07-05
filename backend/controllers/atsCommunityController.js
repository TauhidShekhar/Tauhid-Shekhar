const Resume = require('../models/Resume');
const ResumeComment = require('../models/ResumeComment');
const User = require('../models/User');
const { awardXPExtended } = require('./rewardsController');

// Helper: Award XP for activity and trigger level achievements
const grantActivityRewards = async (userId, xpAmount, coinsAmount) => {
  try {
    await awardXPExtended(userId, xpAmount, coinsAmount);
  } catch (err) {
    console.error('Failed to grant XP rewards:', err.message);
  }
};

// GET /api/community/resume/hub
const getCommunityResumeHub = async (req, res, next) => {
  try {
    const { sort = 'latest', search = '' } = req.query;

    let sortQuery = { createdAt: -1 };
    if (sort === 'score') sortQuery = { atsScore: -1 };
    else if (sort === 'rating') sortQuery = { 'ratings.overall': -1 };

    const query = { isPublic: true, status: 'Approved' };
    if (search.trim()) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { 'parsedData.skills': { $regex: search, $options: 'i' } },
        { 'parsedData.name': { $regex: search, $options: 'i' } }
      ];
    }

    const resumes = await Resume.find(query)
      .populate('uploadedBy', 'fullName username avatar role level rank')
      .sort(sortQuery)
      .limit(30);

    // Compute average ratings for each item
    const formatted = resumes.map(r => {
      const ratings = r.ratings || [];
      const totalRatings = ratings.length;
      let avgOverall = 0;
      if (totalRatings > 0) {
        const sum = ratings.reduce((acc, curr) => acc + curr.overall, 0);
        avgOverall = Math.round((sum / totalRatings) * 10) / 10;
      }

      return {
        _id: r._id,
        fileName: r.fileName,
        fileSize: r.fileSize,
        fileUrl: r.fileUrl,
        atsScore: r.atsScore,
        createdAt: r.createdAt,
        uploadedBy: r.uploadedBy,
        skills: r.parsedData?.skills || [],
        likesCount: r.likes?.length || 0,
        bookmarksCount: r.bookmarks?.length || 0,
        averageRating: avgOverall,
        ratingsCount: totalRatings
      };
    });

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/resume/share/:id
const toggleShareResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublic = true } = req.body;

    const resume = await Resume.findOne({ _id: id, uploadedBy: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume analysis record not found.' });
    }

    resume.isPublic = isPublic;
    if (isPublic) {
      resume.status = 'Approved'; // auto approve user shares
    }
    await resume.save();

    if (isPublic) {
      // Award XP for sharing resume to help others
      await grantActivityRewards(req.user.id, 50, 10);
    }

    res.json({
      success: true,
      message: isPublic ? 'Resume shared to the Community Hub successfully!' : 'Resume private status restored.',
      data: resume
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/resume/review/:id
const submitCommunityReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { layout, projects, skills, experience, design, ats, overall, feedback } = req.body;

    if (!overall || overall < 1 || overall > 5) {
      return res.status(400).json({ success: false, message: 'Please supply a rating score between 1 and 5.' });
    }

    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found.' });
    }

    if (resume.uploadedBy.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot rate your own resume!' });
    }

    // Check if user already reviewed
    const existingIndex = resume.ratings.findIndex(r => r.user.toString() === req.user.id);
    const reviewData = {
      user: req.user.id,
      layout: Number(layout || overall),
      projects: Number(projects || overall),
      skills: Number(skills || overall),
      experience: Number(experience || overall),
      design: Number(design || overall),
      ats: Number(ats || overall),
      overall: Number(overall),
      feedback: feedback || ''
    };

    if (existingIndex !== -1) {
      resume.ratings[existingIndex] = reviewData;
    } else {
      resume.ratings.push(reviewData);
    }

    await resume.save();

    // Award XP to reviewer for helping community
    await grantActivityRewards(req.user.id, 30, 5);

    res.json({
      success: true,
      message: 'Review rating submitted successfully!',
      data: resume.ratings
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/resume/comment/:id
const postComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found.' });
    }

    if (parentId) {
      // It is a nested reply to an existing comment
      const comment = await ResumeComment.findById(parentId);
      if (!comment) {
        return res.status(404).json({ success: false, message: 'Parent comment not found.' });
      }

      comment.replies.push({
        user: req.user.id,
        content
      });

      await comment.save();
      
      const populated = await ResumeComment.findById(parentId)
        .populate('user', 'fullName username avatar role')
        .populate('replies.user', 'fullName username avatar role');

      res.status(201).json({
        success: true,
        message: 'Reply posted successfully!',
        data: populated
      });
    } else {
      // It is a root-level comment
      const newComment = await ResumeComment.create({
        resume: id,
        user: req.user.id,
        content
      });

      // Award XP for contributing to discussion
      await grantActivityRewards(req.user.id, 10, 2);

      const populated = await ResumeComment.findById(newComment._id)
        .populate('user', 'fullName username avatar role');

      res.status(201).json({
        success: true,
        message: 'Comment posted successfully!',
        data: populated
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/community/resume/comment/:id (Get comments for a resume)
const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await ResumeComment.find({ resume: id })
      .populate('user', 'fullName username avatar role level rank')
      .populate('replies.user', 'fullName username avatar role level rank')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: comments
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/resume/like/:id
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const likeIndex = resume.likes.indexOf(req.user.id);
    let isLiked = false;
    if (likeIndex === -1) {
      resume.likes.push(req.user.id);
      isLiked = true;
      // Award XP for liking
      await grantActivityRewards(req.user.id, 5, 1);
    } else {
      resume.likes.splice(likeIndex, 1);
    }

    await resume.save();
    res.json({ success: true, isLiked, likesCount: resume.likes.length });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/resume/bookmark/:id
const toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const bookmarkIndex = resume.bookmarks.indexOf(req.user.id);
    let isBookmarked = false;
    if (bookmarkIndex === -1) {
      resume.bookmarks.push(req.user.id);
      isBookmarked = true;
    } else {
      resume.bookmarks.splice(bookmarkIndex, 1);
    }

    await resume.save();
    res.json({ success: true, isBookmarked });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/resume/report/:id
const reportResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reporting reason is required.' });
    }

    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    resume.reports.push({
      user: req.user.id,
      reason,
      status: 'Pending'
    });

    await resume.save();
    res.json({ success: true, message: 'Resume flagged successfully. Admin will review this shortly.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/community/resume/leaderboard
const getResumeLeaderboard = async (req, res, next) => {
  try {
    // 1. Top ATS Score Resumes
    const topATSResumes = await Resume.find({ isPublic: true, status: 'Approved' })
      .populate('uploadedBy', 'fullName username avatar role')
      .sort({ atsScore: -1 })
      .limit(5);

    // 2. Top Reviewers (Users with the most ratings submissions on resumes)
    const topReviewers = await User.find({ isActive: true })
      .select('fullName username avatar role xp level rank')
      .sort({ xp: -1 }) // simple fallback
      .limit(5);

    res.json({
      success: true,
      data: {
        topATSResumes,
        topReviewers
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/community/resume/analytics
const getResumeAnalytics = async (req, res, next) => {
  try {
    const totalUploads = await Resume.countDocuments({});
    
    // Compute averages
    const scoreStats = await Resume.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$atsScore' },
          highestScore: { $max: '$atsScore' },
          lowestScore: { $min: '$atsScore' }
        }
      }
    ]);

    const stats = scoreStats[0] || { avgScore: 0, highestScore: 0, lowestScore: 0 };

    // Popular skills extraction
    const resumes = await Resume.find({}).select('parsedData.skills');
    const skillsMap = {};
    resumes.forEach(r => {
      const list = r.parsedData?.skills || [];
      list.forEach(s => {
        skillsMap[s] = (skillsMap[s] || 0) + 1;
      });
    });

    const popularSkills = Object.keys(skillsMap)
      .map(k => ({ skill: k, count: skillsMap[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json({
      success: true,
      data: {
        totalUploads,
        avgScore: Math.round(stats.avgScore),
        highestScore: stats.highestScore,
        lowestScore: stats.lowestScore,
        popularSkills
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCommunityResumeHub,
  toggleShareResume,
  submitCommunityReview,
  postComment,
  getComments,
  toggleLike,
  toggleBookmark,
  reportResume,
  getResumeLeaderboard,
  getResumeAnalytics
};
