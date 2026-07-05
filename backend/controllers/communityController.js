const CommunityPost = require('../models/CommunityPost');
const CommunityComment = require('../models/CommunityComment');
const CommunityGroup = require('../models/CommunityGroup');
const CommunityConversation = require('../models/CommunityConversation');
const CommunityMessage = require('../models/CommunityMessage');
const CommunityResource = require('../models/CommunityResource');
const CommunityJob = require('../models/CommunityJob');
const CommunityNotification = require('../models/CommunityNotification');
const User = require('../models/User');
const CommunityQuestion = require('../models/CommunityQuestion');
const CommunityAnswer = require('../models/CommunityAnswer');
const CommunityProject = require('../models/CommunityProject');
const CommunityReport = require('../models/CommunityReport');
const CommunityEvent = require('../models/CommunityEvent');

// Helper to award XP points to users for engagement
const awardXP = async (userId, amount) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.xp = (user.xp || 0) + amount;
      user.coins = (user.coins || 0) + Math.max(1, Math.floor(amount / 5)); // Award coins on XP gain
      user.reputation = (user.reputation || 0) + Math.floor(amount / 10);
      
      // Calculate Level
      let targetLevel = 1;
      if (user.xp >= 100000) targetLevel = 50;
      else if (user.xp >= 25000) targetLevel = 20;
      else if (user.xp >= 5000) targetLevel = 10;
      else if (user.xp >= 1000) targetLevel = 5;
      else if (user.xp >= 500) targetLevel = 4;
      else if (user.xp >= 250) targetLevel = 3;
      else if (user.xp >= 100) targetLevel = 2;

      if (targetLevel > (user.level || 1)) {
        user.level = targetLevel;
        if (targetLevel >= 50) user.rank = 'Legendary Grandmaster';
        else if (targetLevel >= 20) user.rank = 'Elite Master';
        else if (targetLevel >= 10) user.rank = 'Senior Developer';
        else if (targetLevel >= 5) user.rank = 'Professional';
        else if (targetLevel >= 3) user.rank = 'Intermediate';
        else if (targetLevel >= 2) user.rank = 'Novice';
      }

      // Award basic badges based on thresholds
      const currentBadgeNames = user.badges.map(b => b.name);
      if (user.xp >= 100 && !currentBadgeNames.includes('Contributor')) {
        user.badges.push({ name: 'Contributor', icon: 'FaAward' });
      }
      if (user.xp >= 500 && !currentBadgeNames.includes('Rising Star')) {
        user.badges.push({ name: 'Rising Star', icon: 'FaStar' });
      }
      if (user.xp >= 1500 && !currentBadgeNames.includes('Community Guru')) {
        user.badges.push({ name: 'Community Guru', icon: 'FaCrown' });
      }

      await user.save({ validateBeforeSave: false });
    }
  } catch (err) {
    console.error('Award XP error:', err.message);
  }
};

// ==========================================
// POSTS CRUD & INTERACTIONS
// ==========================================

const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, group = null, category = '', search = '', tag = '' } = req.query;
    const filter = { status: 'active' };

    if (group) filter.group = group;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await CommunityPost.find(filter)
      .populate('author', 'fullName username avatar role xp reputation')
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments(filter);

    res.json({
      success: true,
      count: posts.length,
      total,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, mediaUrl, mediaType, group, category, tags } = req.body;

    const post = await CommunityPost.create({
      title,
      content,
      mediaUrl,
      mediaType,
      group: group || null,
      category: category || 'General',
      tags: tags || [],
      author: req.user.id
    });

    // Award XP to the creator
    await awardXP(req.user.id, 20);

    // Update daily/weekly mission post counter
    const CommunityMission = require('../models/CommunityMission');
    await CommunityMission.updateMany(
      { user: req.user.id, resetAt: { $gt: new Date() } },
      { $inc: { postsCreated: 1 } }
    );

    const populatedPost = await CommunityPost.findById(post._id).populate('author', 'fullName username avatar role xp reputation');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Moderator') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    const { title, content, mediaUrl, mediaType, category, tags } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.mediaUrl = mediaUrl !== undefined ? mediaUrl : post.mediaUrl;
    post.mediaType = mediaType !== undefined ? mediaType : post.mediaType;
    post.category = category || post.category;
    post.tags = tags || post.tags;

    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Moderator') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

const reactToPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // Like, Love, Celebrate, Insightful, Funny

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.reactions = post.reactions || [];
    const existingIndex = post.reactions.findIndex(r => r.user.toString() === req.user.id);

    if (existingIndex > -1) {
      if (post.reactions[existingIndex].type === type) {
        // Toggle off reaction
        post.reactions.splice(existingIndex, 1);
      } else {
        // Change reaction type
        post.reactions[existingIndex].type = type;
      }
    } else {
      // Add new reaction
      post.reactions.push({ user: req.user.id, type });
      
      // Update daily/weekly mission likes counter
      const CommunityMission = require('../models/CommunityMission');
      await CommunityMission.updateMany(
        { user: req.user.id, resetAt: { $gt: new Date() } },
        { $inc: { likesGiven: 1 } }
      );

      // Send notification if not self
      if (post.author.toString() !== req.user.id) {
        await CommunityNotification.create({
          recipient: post.author,
          sender: req.user.id,
          type: 'like',
          post: post._id
        });
        await awardXP(post.author, 5); // Award author XP for likes
      }
    }

    await post.save();
    res.json({ success: true, data: post.reactions });
  } catch (error) {
    next(error);
  }
};

const bookmarkPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.bookmarks = post.bookmarks || [];
    const index = post.bookmarks.indexOf(req.user.id);

    if (index === -1) {
      post.bookmarks.push(req.user.id);
      res.json({ success: true, isBookmarked: true, message: 'Post bookmarked!' });
    } else {
      post.bookmarks.splice(index, 1);
      res.json({ success: true, isBookmarked: false, message: 'Bookmark removed!' });
    }
    await post.save();
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COMMENTS SECTION
// ==========================================

const getComments = async (req, res, next) => {
  try {
    const { id } = req.params; // post ID
    const comments = await CommunityComment.find({ postId: id })
      .populate('author', 'fullName username avatar role xp reputation')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { id } = req.params; // post ID
    const { content, parentCommentId } = req.body;

    const comment = await CommunityComment.create({
      postId: id,
      parentCommentId: parentCommentId || null,
      author: req.user.id,
      content
    });

    const populated = await CommunityComment.findById(comment._id).populate('author', 'fullName username avatar role xp reputation');

    // Notifications
    const post = await CommunityPost.findById(id);
    if (post && post.author.toString() !== req.user.id) {
      await CommunityNotification.create({
        recipient: post.author,
        sender: req.user.id,
        type: parentCommentId ? 'reply' : 'comment',
        post: post._id
      });
      await awardXP(post.author, 10);
    }

    await awardXP(req.user.id, 5);

    // Update daily/weekly mission comment counter
    const CommunityMission = require('../models/CommunityMission');
    await CommunityMission.updateMany(
      { user: req.user.id, resetAt: { $gt: new Date() } },
      { $inc: { commentsCreated: 1 } }
    );

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comm = await CommunityComment.findById(req.params.commentId);
    if (!comm) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comm.author.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Moderator') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    await CommunityComment.findByIdAndDelete(req.params.commentId);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GROUPS SECTION
// ==========================================

const populateGroupData = async (groupQuery) => {
  return groupQuery
    .populate('owner', 'fullName username avatar xp reputation role')
    .populate('admins', 'fullName username avatar xp reputation role')
    .populate('members', 'fullName username avatar xp reputation role')
    .populate('moderators', 'fullName username avatar xp reputation role')
    .populate('pendingRequests', 'fullName username avatar xp reputation role');
};

const getGroups = async (req, res, next) => {
  try {
    const allGroups = await CommunityGroup.find({});
    // Filter groups by visibility: Secret groups are only visible to members, admins, moderators, owner, or global admins
    const filteredGroups = allGroups.filter(group => {
      if (group.visibility !== 'secret') return true;
      const isOwner = group.owner.toString() === req.user.id;
      const isGrpAdmin = group.admins && group.admins.some(a => a.toString() === req.user.id);
      const isMod = group.moderators && group.moderators.some(m => m.toString() === req.user.id);
      const isMember = group.members && group.members.some(m => m.toString() === req.user.id);
      const isGlobalAdmin = req.user.role === 'Admin';
      return isOwner || isGrpAdmin || isMod || isMember || isGlobalAdmin;
    });

    const populated = await Promise.all(filteredGroups.map(async (group) => {
      return await populateGroupData(CommunityGroup.findById(group._id));
    }));

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { name, description, coverImage, logo, category, tags, rules, isPrivate, visibility, location, language } = req.body;

    const exists = await CommunityGroup.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'Group name already taken' });

    // Generate unique 6-character short invitation code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await CommunityGroup.create({
      name,
      description,
      coverImage: coverImage || '',
      logo: logo || { url: '', publicId: '' },
      category: category || 'General',
      tags: tags || [],
      rules: rules || [],
      isPrivate: isPrivate || (visibility === 'private' || visibility === 'secret'),
      visibility: visibility || (isPrivate ? 'private' : 'public'),
      location: location || '',
      language: language || 'English',
      inviteCode,
      owner: req.user.id,
      members: [req.user.id]
    });

    await awardXP(req.user.id, 50);

    const populated = await populateGroupData(CommunityGroup.findById(group._id));
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const joinLeaveGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = await CommunityGroup.findById(id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Check if banned
    const isBanned = group.bannedMembers && group.bannedMembers.some(b => b.user.toString() === req.user.id);
    if (isBanned) {
      return res.status(403).json({ success: false, message: 'You have been banned from this group.' });
    }

    const index = group.members.indexOf(req.user.id);
    if (index === -1) {
      if (group.isPrivate || group.visibility === 'secret') {
        if (group.pendingRequests.includes(req.user.id)) {
          return res.status(400).json({ success: false, message: 'Join request is already pending.' });
        }
        group.pendingRequests.push(req.user.id);
        await group.save();
        res.json({ success: true, joined: false, pending: true, message: 'Join request sent successfully.' });
      } else {
        group.members.push(req.user.id);
        await group.save();
        res.json({ success: true, joined: true, message: 'Joined group successfully!' });
      }
    } else {
      if (group.owner.toString() === req.user.id) {
        return res.status(400).json({ success: false, message: 'Owner cannot leave group.' });
      }
      group.members.splice(index, 1);
      // Remove from admins/moderators if leaving
      if (group.admins) group.admins = group.admins.filter(a => a.toString() !== req.user.id);
      group.moderators = group.moderators.filter(m => m.toString() !== req.user.id);
      await group.save();
      res.json({ success: true, joined: false, message: 'Left group successfully.' });
    }
  } catch (error) {
    next(error);
  }
};

// ==========================================
// RESOURCES SECTION
// ==========================================

const getResources = async (req, res, next) => {
  try {
    const { search = '', category = '' } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await CommunityResource.find(filter)
      .populate('uploadedBy', 'fullName username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
};

const uploadResource = async (req, res, next) => {
  try {
    const { title, description, fileUrl, fileType, fileSize, category, tags } = req.body;

    const resource = await CommunityResource.create({
      title,
      description,
      fileUrl,
      fileType,
      fileSize,
      category: category || 'General',
      tags: tags || [],
      uploadedBy: req.user.id
    });

    await awardXP(req.user.id, 30); // Award for sharing resources

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

const incrementDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await CommunityResource.findById(id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    resource.downloadsCount = (resource.downloadsCount || 0) + 1;
    await resource.save();

    await awardXP(resource.uploadedBy, 5); // Award owner for resource download popularity

    res.json({ success: true, downloads: resource.downloadsCount });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const resource = await CommunityResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    // Only original uploader or admin can delete
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    await CommunityResource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CAREERS / JOBS SECTION
// ==========================================

const getJobs = async (req, res, next) => {
  try {
    const { search = '', type = '' } = req.query;
    const filter = {};
    if (type) filter.jobType = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await CommunityJob.find(filter)
      .populate('postedBy', 'fullName username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

const postJob = async (req, res, next) => {
  try {
    const { title, company, location, jobType, description, requirements } = req.body;

    const job = await CommunityJob.create({
      title,
      company,
      location: location || 'Remote',
      jobType,
      description,
      requirements: requirements || [],
      postedBy: req.user.id
    });

    await awardXP(req.user.id, 25);

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

const applyToJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await CommunityJob.findById(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.applicants = job.applicants || [];
    if (job.applicants.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already applied for this opening.' });
    }

    job.applicants.push(req.user.id);
    await job.save();

    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GAMIFICATION LEADERBOARDS & FOLLOWERS
// ==========================================

const getLeaderboard = async (req, res, next) => {
  try {
    const leaders = await User.find({ isActive: true })
      .select('fullName username avatar role xp reputation badges followers')
      .sort({ xp: -1 })
      .limit(10);

    res.json({ success: true, data: leaders });
  } catch (error) {
    next(error);
  }
};

const toggleFollowUser = async (req, res, next) => {
  try {
    const { id } = req.params; // Target user id
    if (id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser || !currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    targetUser.followers = targetUser.followers || [];
    currentUser.following = currentUser.following || [];

    const index = targetUser.followers.findIndex(fid => fid && fid.toString() === req.user.id.toString());

    if (index === -1) {
      targetUser.followers.push(req.user.id);
      currentUser.following.push(id);
      
      // Notify target user
      await CommunityNotification.create({
        recipient: id,
        sender: req.user.id,
        type: 'follow'
      });
      await awardXP(id, 15); // Target gets xp for gaining followers
      res.json({ success: true, followed: true, message: 'User followed successfully!' });
    } else {
      targetUser.followers.splice(index, 1);
      const curIndex = currentUser.following.findIndex(fid => fid && fid.toString() === id.toString());
      if (curIndex > -1) currentUser.following.splice(curIndex, 1);
      res.json({ success: true, followed: false, message: 'User unfollowed.' });
    }

    await targetUser.save({ validateBeforeSave: false });
    await currentUser.save({ validateBeforeSave: false });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await CommunityNotification.find({ recipient: req.user.id })
      .populate('sender', 'fullName username avatar')
      .populate('post', 'title')
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

const readNotifications = async (req, res, next) => {
  try {
    await CommunityNotification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'Notifications cleared.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CHAT API SYSTEMS
// ==========================================

const getConversations = async (req, res, next) => {
  try {
    const convs = await CommunityConversation.find({ participants: req.user.id })
      .populate('participants', 'fullName username avatar xp role')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username' }
      })
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: convs });
  } catch (error) {
    next(error);
  }
};

const startConversation = async (req, res, next) => {
  try {
    const { targetUserId, isGroup, name, groupAvatar } = req.body;

    if (!isGroup) {
      // For personal chat: check if conversation already exists
      const existing = await CommunityConversation.findOne({
        isGroup: false,
        participants: { $all: [req.user.id, targetUserId] }
      }).populate('participants', 'fullName username avatar xp role');

      if (existing) {
        return res.json({ success: true, data: existing });
      }

      const conv = await CommunityConversation.create({
        participants: [req.user.id, targetUserId],
        isGroup: false
      });
      const populated = await CommunityConversation.findById(conv._id).populate('participants', 'fullName username avatar xp role');
      return res.status(201).json({ success: true, data: populated });
    } else {
      const conv = await CommunityConversation.create({
        participants: [req.user.id, ...(req.body.participants || [])],
        isGroup: true,
        name: name || 'Unnamed Group',
        groupAvatar: groupAvatar || ''
      });
      const populated = await CommunityConversation.findById(conv._id).populate('participants', 'fullName username avatar xp role');
      return res.status(201).json({ success: true, data: populated });
    }
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await CommunityMessage.find({ conversationId })
      .populate('sender', 'fullName username avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens -loginHistory -failedLoginAttempts -lockUntil -emailVerificationToken -resetPasswordToken');
    
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── EXTENDED GROUP MANAGEMENT ──────────────────────────────────────────────

const updateGroup = async (req, res, next) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Only owner or moderator can edit
    const isOwner = group.owner.toString() === req.user.id;
    const isMod = group.moderators.some(m => m.toString() === req.user.id);
    if (!isOwner && !isMod && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this group' });
    }

    const { name, description, category, tags, rules, isPrivate, logo, coverImage } = req.body;
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (category) group.category = category;
    if (tags !== undefined) group.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
    if (rules !== undefined) group.rules = Array.isArray(rules) ? rules : rules.split('\n').map(r => r.trim()).filter(Boolean);
    if (isPrivate !== undefined) group.isPrivate = isPrivate;
    if (logo !== undefined) group.logo = logo;
    if (coverImage !== undefined) group.coverImage = coverImage;

    await group.save();
    const populated = await populateGroupData(CommunityGroup.findById(group._id));
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isOwner = group.owner.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only group owners or admins can delete groups' });
    }

    await CommunityGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const uploadGroupAssets = async (req, res, next) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isOwner = group.owner.toString() === req.user.id;
    const isMod = group.moderators.some(m => m.toString() === req.user.id);
    if (!isOwner && !isMod && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to upload group assets' });
    }

    const files = req.files || {};
    const { uploadToCloudinary } = require('../middleware/upload');

    if (files.logo && files.logo[0]) {
      const uploadResult = await uploadToCloudinary(files.logo[0].buffer, 'groups/logos');
      group.logo = { url: uploadResult.url, publicId: uploadResult.publicId };
    }

    if (files.coverImage && files.coverImage[0]) {
      const uploadResult = await uploadToCloudinary(files.coverImage[0].buffer, 'groups/covers');
      group.coverImage = uploadResult.url;
    }

    await group.save();
    const populated = await populateGroupData(CommunityGroup.findById(group._id));
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const manageGroupMembers = async (req, res, next) => {
  try {
    const { action, targetUserId, reason, duration } = req.body; 
    // Actions: request_join, approve_join, reject_join, invite, make_admin, remove_admin, make_mod, remove_mod, remove_member, leave, mute_member, unmute_member, ban_member, unban_member
    
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isOwner = group.owner.toString() === req.user.id;
    const isGrpAdmin = group.admins && group.admins.some(a => a.toString() === req.user.id);
    const isMod = group.moderators.some(m => m.toString() === req.user.id);
    const isGlobalAdmin = req.user.role === 'Admin';

    const hasModPrivileges = isOwner || isGrpAdmin || isMod || isGlobalAdmin;
    const hasAdminPrivileges = isOwner || isGrpAdmin || isGlobalAdmin;

    if (action === 'request_join') {
      if (group.members.includes(req.user.id)) {
        return res.status(400).json({ success: false, message: 'Already a member' });
      }
      // Check if banned
      const isBanned = group.bannedMembers && group.bannedMembers.some(b => b.user.toString() === req.user.id);
      if (isBanned) {
        return res.status(403).json({ success: false, message: 'You have been banned from this group.' });
      }

      if (group.isPrivate || group.visibility === 'secret') {
        if (group.pendingRequests.includes(req.user.id)) {
          return res.status(400).json({ success: false, message: 'Request already pending' });
        }
        group.pendingRequests.push(req.user.id);
      } else {
        group.members.push(req.user.id);
      }
    } else if (action === 'approve_join') {
      if (!hasModPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== targetUserId);
      if (!group.members.includes(targetUserId)) {
        group.members.push(targetUserId);
      }
    } else if (action === 'reject_join') {
      if (!hasModPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== targetUserId);
    } else if (action === 'make_admin') {
      if (!isOwner && !isGlobalAdmin) return res.status(403).json({ success: false, message: 'Only owner can assign group admins' });
      group.admins = group.admins || [];
      if (!group.admins.includes(targetUserId)) {
        group.admins.push(targetUserId);
      }
    } else if (action === 'remove_admin') {
      if (!isOwner && !isGlobalAdmin) return res.status(403).json({ success: false, message: 'Only owner can remove group admins' });
      group.admins = group.admins || [];
      group.admins = group.admins.filter(id => id.toString() !== targetUserId);
    } else if (action === 'make_mod') {
      if (!hasAdminPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      if (!group.moderators.includes(targetUserId)) {
        group.moderators.push(targetUserId);
      }
    } else if (action === 'remove_mod') {
      if (!hasAdminPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      group.moderators = group.moderators.filter(id => id.toString() !== targetUserId);
    } else if (action === 'mute_member') {
      if (!hasModPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      group.mutedMembers = group.mutedMembers || [];
      const muteHours = Number(duration) || 24;
      const mutedUntil = new Date(Date.now() + muteHours * 60 * 60 * 1000);
      
      const muteIndex = group.mutedMembers.findIndex(m => m.user.toString() === targetUserId);
      if (muteIndex === -1) {
        group.mutedMembers.push({ user: targetUserId, mutedUntil });
      } else {
        group.mutedMembers[muteIndex].mutedUntil = mutedUntil;
      }
    } else if (action === 'unmute_member') {
      if (!hasModPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      group.mutedMembers = group.mutedMembers || [];
      group.mutedMembers = group.mutedMembers.filter(m => m.user.toString() !== targetUserId);
    } else if (action === 'ban_member') {
      if (!hasAdminPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      if (targetUserId === group.owner.toString()) return res.status(400).json({ success: false, message: 'Cannot ban group owner' });
      
      group.bannedMembers = group.bannedMembers || [];
      if (!group.bannedMembers.some(b => b.user.toString() === targetUserId)) {
        group.bannedMembers.push({ user: targetUserId, reason: reason || 'Violation of group rules', bannedAt: new Date() });
      }
      // Remove from members list
      group.members = group.members.filter(id => id.toString() !== targetUserId);
      group.moderators = group.moderators.filter(id => id.toString() !== targetUserId);
      if (group.admins) group.admins = group.admins.filter(id => id.toString() !== targetUserId);
    } else if (action === 'unban_member') {
      if (!hasAdminPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      group.bannedMembers = group.bannedMembers || [];
      group.bannedMembers = group.bannedMembers.filter(b => b.user.toString() !== targetUserId);
    } else if (action === 'remove_member') {
      if (!hasModPrivileges) return res.status(403).json({ success: false, message: 'Not authorized' });
      if (targetUserId === group.owner.toString()) return res.status(400).json({ success: false, message: 'Cannot remove owner' });
      group.members = group.members.filter(id => id.toString() !== targetUserId);
      group.moderators = group.moderators.filter(id => id.toString() !== targetUserId);
      if (group.admins) group.admins = group.admins.filter(id => id.toString() !== targetUserId);
    } else if (action === 'leave') {
      if (req.user.id === group.owner.toString()) {
        return res.status(400).json({ success: false, message: 'Owner cannot leave group without transfer' });
      }
      group.members = group.members.filter(id => id.toString() !== req.user.id);
      group.moderators = group.moderators.filter(id => id.toString() !== req.user.id);
      if (group.admins) group.admins = group.admins.filter(id => id.toString() !== req.user.id);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action type' });
    }

    await group.save();
    const populated = await populateGroupData(CommunityGroup.findById(group._id));
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const uploadGroupFile = async (req, res, next) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Verify membership
    const isMember = group.members.includes(req.user.id) || group.owner.toString() === req.user.id;
    if (!isMember && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Must be a group member to upload files' });
    }

    const files = req.files || {};
    const file = (files.file && files.file[0]) || (req.file);
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { uploadToCloudinary } = require('../middleware/upload');
    
    // Map mime-type to file category
    let fileType = 'other';
    if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype.startsWith('video/')) fileType = 'video';
    else if (file.mimetype === 'application/pdf') fileType = 'pdf';
    else if (['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'].includes(file.mimetype)) fileType = 'zip';
    else if (['text/plain', 'text/javascript', 'application/json', 'text/html', 'text/css', 'application/x-python-code'].includes(file.mimetype)) fileType = 'code';

    // Store in Cloudinary raw folder for non-media types to preserve extensions
    const resourceType = ['image', 'video'].includes(fileType) ? fileType : 'raw';
    const uploadResult = await uploadToCloudinary(file.buffer, 'groups/uploads', resourceType);

    const newUpload = {
      fileName: file.originalname,
      originalName: file.originalname,
      fileUrl: uploadResult.url,
      fileType,
      fileSize: file.size,
      uploadedBy: req.user.id,
      createdAt: new Date()
    };

    group.uploads = group.uploads || [];
    group.uploads.push(newUpload);
    await group.save();

    await awardXP(req.user.id, 10); // Award XP for resource sharing

    res.status(201).json({ success: true, data: group.uploads });
  } catch (error) {
    next(error);
  }
};

// ─── DOUBT Q&A LOUNGE ───────────────────────────────────────────────────────

const getQuestions = async (req, res, next) => {
  try {
    const { category = 'All', search = '', tag = '', sort = 'newest' } = req.query;
    const filter = {};
    if (category !== 'All') filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'top') sortOption = { upvotes: -1 };
    else if (sort === 'views') sortOption = { views: -1 };

    const questions = await CommunityQuestion.find(filter)
      .populate('author', 'fullName username avatar role xp reputation')
      .populate('acceptedAnswer', 'content')
      .sort(sortOption);

    res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    const question = await CommunityQuestion.create({
      title,
      content,
      category: category || 'Other',
      tags: tagsArray,
      author: req.user.id
    });

    await awardXP(req.user.id, 15); // XP for asking questions

    const populated = await CommunityQuestion.findById(question._id).populate('author', 'fullName username avatar role xp reputation');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const getQuestionDetails = async (req, res, next) => {
  try {
    const question = await CommunityQuestion.findById(req.params.id)
      .populate('author', 'fullName username avatar role xp reputation');
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    // Increment views
    question.views = (question.views || 0) + 1;
    await question.save();

    const answers = await CommunityAnswer.find({ question: question._id })
      .populate('author', 'fullName username avatar role xp reputation')
      .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 });

    res.json({ success: true, data: { question, answers } });
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await CommunityQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (question.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await CommunityQuestion.findByIdAndDelete(req.params.id);
    await CommunityAnswer.deleteMany({ question: req.params.id });

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const voteQuestion = async (req, res, next) => {
  try {
    const { voteType } = req.body; // upvote, downvote
    const question = await CommunityQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    question.upvotes = question.upvotes || [];
    question.downvotes = question.downvotes || [];

    const hasUpvoted = question.upvotes.includes(req.user.id);
    const hasDownvoted = question.downvotes.includes(req.user.id);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        question.upvotes = question.upvotes.filter(id => id.toString() !== req.user.id);
      } else {
        question.upvotes.push(req.user.id);
        question.downvotes = question.downvotes.filter(id => id.toString() !== req.user.id);
        await awardXP(question.author, 5); // author earns xp for upvote
      }
    } else {
      if (hasDownvoted) {
        question.downvotes = question.downvotes.filter(id => id.toString() !== req.user.id);
      } else {
        question.downvotes.push(req.user.id);
        question.upvotes = question.upvotes.filter(id => id.toString() !== req.user.id);
      }
    }

    await question.save();
    res.json({ success: true, upvotes: question.upvotes, downvotes: question.downvotes });
  } catch (error) {
    next(error);
  }
};

const bookmarkQuestion = async (req, res, next) => {
  try {
    const question = await CommunityQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    question.bookmarks = question.bookmarks || [];
    const index = question.bookmarks.indexOf(req.user.id);

    if (index === -1) {
      question.bookmarks.push(req.user.id);
      res.json({ success: true, bookmarked: true, message: 'Question bookmarked' });
    } else {
      question.bookmarks.splice(index, 1);
      res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    }
    await question.save();
  } catch (error) {
    next(error);
  }
};

const createAnswer = async (req, res, next) => {
  try {
    const { content } = req.body;
    const question = await CommunityQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const answer = await CommunityAnswer.create({
      question: question._id,
      content,
      author: req.user.id
    });

    await awardXP(req.user.id, 10); // XP for writing answers

    // Notify author of question
    if (question.author.toString() !== req.user.id) {
      await CommunityNotification.create({
        recipient: question.author,
        sender: req.user.id,
        type: 'comment',
        post: question.title
      });
    }

    const populated = await CommunityAnswer.findById(answer._id).populate('author', 'fullName username avatar role xp reputation');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const voteAnswer = async (req, res, next) => {
  try {
    const { voteType } = req.body;
    const answer = await CommunityAnswer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    answer.upvotes = answer.upvotes || [];
    answer.downvotes = answer.downvotes || [];

    const hasUpvoted = answer.upvotes.includes(req.user.id);
    const hasDownvoted = answer.downvotes.includes(req.user.id);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        answer.upvotes = answer.upvotes.filter(id => id.toString() !== req.user.id);
      } else {
        answer.upvotes.push(req.user.id);
        answer.downvotes = answer.downvotes.filter(id => id.toString() !== req.user.id);
        await awardXP(answer.author, 5);
      }
    } else {
      if (hasDownvoted) {
        answer.downvotes = answer.downvotes.filter(id => id.toString() !== req.user.id);
      } else {
        answer.downvotes.push(req.user.id);
        answer.upvotes = answer.upvotes.filter(id => id.toString() !== req.user.id);
      }
    }

    await answer.save();
    res.json({ success: true, upvotes: answer.upvotes, downvotes: answer.downvotes });
  } catch (error) {
    next(error);
  }
};

const acceptAnswer = async (req, res, next) => {
  try {
    const answer = await CommunityAnswer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    const question = await CommunityQuestion.findById(answer.question);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (question.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only question owner can accept answers' });
    }

    // Reset previous accepted answer
    await CommunityAnswer.updateMany({ question: question._id }, { isAccepted: false });

    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    await awardXP(answer.author, 30); // Earn major XP for accepted answer

    res.json({ success: true, data: answer });
  } catch (error) {
    next(error);
  }
};

const deleteAnswer = async (req, res, next) => {
  try {
    const answer = await CommunityAnswer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    if (answer.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await CommunityAnswer.findByIdAndDelete(req.params.answerId);

    // If it was accepted answer, clear reference on question
    await CommunityQuestion.updateOne({ acceptedAnswer: req.params.answerId }, { acceptedAnswer: null });

    res.json({ success: true, message: 'Answer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── PROJECT DISCUSSIONS ────────────────────────────────────────────────────

const getProjects = async (req, res, next) => {
  try {
    const { progress = '', search = '' } = req.query;
    const filter = {};
    if (progress) filter.progress = progress;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await CommunityProject.find(filter)
      .populate('author', 'fullName username avatar role xp reputation')
      .populate('comments.author', 'fullName username avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, demoVideo, githubUrl, liveUrl, techUsed, progress, lookingFor } = req.body;
    
    // Parse arrays
    const parseList = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(',').map(s => s.trim()).filter(Boolean);
    };

    const project = await CommunityProject.create({
      title,
      description,
      demoVideo: demoVideo || '',
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      techUsed: parseList(techUsed),
      progress: progress || 'Idea',
      lookingFor: parseList(lookingFor),
      author: req.user.id
    });

    await awardXP(req.user.id, 25); // XP for sharing projects

    const populated = await CommunityProject.findById(project._id).populate('author', 'fullName username avatar role xp reputation');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await CommunityProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await CommunityProject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project showcase deleted' });
  } catch (error) {
    next(error);
  }
};

const likeProject = async (req, res, next) => {
  try {
    const project = await CommunityProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.likes = project.likes || [];
    const index = project.likes.indexOf(req.user.id);

    if (index === -1) {
      project.likes.push(req.user.id);
      await awardXP(project.author, 5); // author earns xp for project likes
      res.json({ success: true, liked: true, likes: project.likes });
    } else {
      project.likes.splice(index, 1);
      res.json({ success: true, liked: false, likes: project.likes });
    }
    await project.save();
  } catch (error) {
    next(error);
  }
};

const commentOnProject = async (req, res, next) => {
  try {
    const { content } = req.body;
    const project = await CommunityProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const newComment = {
      author: req.user.id,
      content,
      createdAt: new Date()
    };

    project.comments = project.comments || [];
    project.comments.push(newComment);
    await project.save();

    await awardXP(req.user.id, 5); // commenter gets 5 xp

    // Notify author
    if (project.author.toString() !== req.user.id) {
      await CommunityNotification.create({
        recipient: project.author,
        sender: req.user.id,
        type: 'comment',
        post: project.title
      });
    }

    const populatedProject = await CommunityProject.findById(project._id)
      .populate('author', 'fullName username avatar role xp reputation')
      .populate('comments.author', 'fullName username avatar');

    res.status(201).json({ success: true, data: populatedProject.comments });
  } catch (error) {
    next(error);
  }
};

// Auto keyword filtering
const BANNED_WORDS = ['spam', 'scam', 'free money', 'buy bitcoin', 'hack tool', 'cheat sheet leaks'];
const autoModerateText = (text) => {
  if (!text) return { isSpam: false, cleanText: '' };
  let isSpam = false;
  let cleanText = text;
  
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    if (regex.test(text)) {
      isSpam = true;
      cleanText = cleanText.replace(regex, '***');
    }
  });
  return { isSpam, cleanText };
};

// ==========================================
// EVENTS SECTION
// ==========================================

const getEvents = async (req, res, next) => {
  try {
    const { groupId } = req.query;
    const filter = {};
    if (groupId) filter.group = groupId;

    const events = await CommunityEvent.find(filter)
      .populate('organizer', 'fullName username avatar')
      .populate('attendees', 'fullName username avatar')
      .sort({ startDate: 1 });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { group, title, description, banner, type, location, startDate, endDate } = req.body;

    const grp = await CommunityGroup.findById(group);
    if (!grp) return res.status(404).json({ success: false, message: 'Group not found' });

    // Permissions: owner, admin, moderator, or global admin
    const isOwner = grp.owner.toString() === req.user.id;
    const isGrpAdmin = grp.admins && grp.admins.some(a => a.toString() === req.user.id);
    const isMod = grp.moderators.some(m => m.toString() === req.user.id);
    const isGlobalAdmin = req.user.role === 'Admin';
    if (!isOwner && !isGrpAdmin && !isMod && !isGlobalAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to create events in this group' });
    }

    const event = await CommunityEvent.create({
      group,
      title,
      description,
      banner: banner || '',
      type,
      location,
      startDate,
      endDate,
      organizer: req.user.id,
      attendees: [req.user.id]
    });

    await awardXP(req.user.id, 30); // XP for organizing event

    const populated = await CommunityEvent.findById(event._id)
      .populate('organizer', 'fullName username avatar')
      .populate('attendees', 'fullName username avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const rsvpEvent = async (req, res, next) => {
  try {
    const event = await CommunityEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const index = event.attendees.indexOf(req.user.id);
    if (index === -1) {
      event.attendees.push(req.user.id);
      await awardXP(req.user.id, 10); // XP for attending
    } else {
      event.attendees.splice(index, 1);
    }
    await event.save();

    const populated = await CommunityEvent.findById(event._id)
      .populate('organizer', 'fullName username avatar')
      .populate('attendees', 'fullName username avatar');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await CommunityEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const grp = await CommunityGroup.findById(event.group);
    const isOwner = grp && grp.owner.toString() === req.user.id;
    const isOrganizer = event.organizer.toString() === req.user.id;
    const isGlobalAdmin = req.user.role === 'Admin';

    if (!isOwner && !isOrganizer && !isGlobalAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await CommunityEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REPORTS & MODERATION SECTION
// ==========================================

const submitReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const report = await CommunityReport.create({
      reportedBy: req.user.id,
      targetType,
      targetId,
      reason
    });
    res.status(201).json({ success: true, data: report, message: 'Report submitted successfully. Thank you for keeping our community safe!' });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const reports = await CommunityReport.find({ status: 'pending' })
      .populate('reportedBy', 'fullName username email')
      .populate({
        path: 'targetId',
        populate: { path: 'author', select: 'fullName username' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

const actionReport = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const { id } = req.params;
    const { action } = req.body; // dismiss, delete_content, ban

    const report = await CommunityReport.findById(id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    if (action === 'dismiss') {
      report.status = 'dismissed';
      report.actionTaken = 'Dismissed report';
    } else if (action === 'delete_content') {
      if (report.targetType === 'Post') {
        await CommunityPost.findByIdAndDelete(report.targetId);
      } else if (report.targetType === 'Comment') {
        await CommunityComment.findByIdAndDelete(report.targetId);
      }
      report.status = 'resolved';
      report.actionTaken = 'Deleted reported content';
    } else if (action === 'ban') {
      let targetUser = null;
      if (report.targetType === 'Post') {
        const p = await CommunityPost.findById(report.targetId);
        if (p) targetUser = p.author;
      } else if (report.targetType === 'Comment') {
        const c = await CommunityComment.findById(report.targetId);
        if (c) targetUser = c.author;
      } else if (report.targetType === 'User') {
        targetUser = report.targetId;
      }

      if (targetUser) {
        await User.findByIdAndUpdate(targetUser, { isActive: false });
        report.actionTaken = `Banned user: ${targetUser}`;
      }
      report.status = 'resolved';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await report.save();
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const uploadImageController = async (req, res, next) => {
  try {
    const file = (req.files && req.files.image && req.files.image[0]) || req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const { uploadToCloudinary } = require('../middleware/upload');
    const uploadResult = await uploadToCloudinary(file.buffer, 'community/images', 'auto');

    res.status(200).json({ success: true, url: uploadResult.url, publicId: uploadResult.publicId });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const comment = await CommunityComment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    comment.content = content;
    await comment.save();
    const populated = await CommunityComment.findById(comment._id).populate('author', 'fullName username avatar role xp reputation');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const question = await CommunityQuestion.findById(id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (question.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.category = category || question.category;
    if (tags) {
      question.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    await question.save();
    const populated = await CommunityQuestion.findById(question._id).populate('author', 'fullName username avatar role xp reputation');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;
    const answer = await CommunityAnswer.findById(answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    if (answer.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    answer.content = content;
    await answer.save();
    const populated = await CommunityAnswer.findById(answer._id).populate('author', 'fullName username avatar role xp reputation');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, techStack, githubLink, liveLink } = req.body;
    const project = await CommunityProject.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.githubLink = githubLink !== undefined ? githubLink : project.githubLink;
    project.liveLink = liveLink !== undefined ? liveLink : project.liveLink;
    if (techStack) {
      project.techStack = Array.isArray(techStack) ? techStack : techStack.split(',').map(t => t.trim()).filter(Boolean);
    }

    await project.save();
    const populated = await CommunityProject.findById(project._id).populate('author', 'fullName username avatar role xp reputation');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, maxAttendees } = req.body;
    const event = await CommunityEvent.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.maxAttendees = maxAttendees !== undefined ? maxAttendees : event.maxAttendees;

    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, company, description, location, salary, tags } = req.body;
    const job = await CommunityJob.findById(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    job.title = title || job.title;
    job.company = company || job.company;
    job.description = description || job.description;
    job.location = location || job.location;
    job.salary = salary !== undefined ? salary : job.salary;
    if (tags) {
      job.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    await job.save();
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await CommunityJob.findById(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    await CommunityJob.findByIdAndDelete(id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags } = req.body;
    const resource = await CommunityResource.findById(id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    resource.title = title || resource.title;
    resource.description = description || resource.description;
    resource.category = category || resource.category;
    if (tags) {
      resource.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    await resource.save();
    res.json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  awardXP,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  reactToPost,
  bookmarkPost,
  getComments,
  addComment,
  deleteComment,
  updateComment,
  getGroups,
  createGroup,
  joinLeaveGroup,
  getResources,
  uploadResource,
  incrementDownload,
  deleteResource,
  updateResource,
  getJobs,
  postJob,
  applyToJob,
  updateJob,
  deleteJob,
  getLeaderboard,
  toggleFollowUser,
  getNotifications,
  readNotifications,
  getConversations,
  startConversation,
  getMessages,
  getPublicProfile,
  updateGroup,
  deleteGroup,
  uploadGroupAssets,
  manageGroupMembers,
  uploadGroupFile,
  getQuestions,
  createQuestion,
  getQuestionDetails,
  deleteQuestion,
  updateQuestion,
  voteQuestion,
  bookmarkQuestion,
  createAnswer,
  voteAnswer,
  acceptAnswer,
  deleteAnswer,
  updateAnswer,
  getProjects,
  createProject,
  deleteProject,
  updateProject,
  likeProject,
  commentOnProject,
  uploadImageController,
  getEvents,
  createEvent,
  rsvpEvent,
  deleteEvent,
  updateEvent,
  submitReport,
  getReports,
  actionReport,
  autoModerateText
};
