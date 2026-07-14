const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const {
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
  
  // Extended group controllers
  updateGroup,
  deleteGroup,
  getGroupDetails,
  uploadGroupAssets,
  manageGroupMembers,
  uploadGroupFile,

  // Doubt Section controllers
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

  // Project discussions controllers
  getProjects,
  createProject,
  deleteProject,
  updateProject,
  likeProject,
  commentOnProject,
  uploadImageController,
  deleteCommunityImageController,
  getEvents,
  createEvent,
  rsvpEvent,
  deleteEvent,
  updateEvent,
  submitReport,
  getReports,
  actionReport,
  deleteResource,
  updateResource,
  votePollOption
} = require('../controllers/communityController');

// Gamification / Rewards & Ecosystem Controllers
const {
  getRewardsDashboard,
  claimMissionReward,
  triggerSpinWheel,
  getLeaderboards
} = require('../controllers/rewardsController');

const {
  getDailyChallenge,
  submitChallengeSolution,
  submitQuizScore,
  getRandomChallenge,
  unlockChallengeHint
} = require('../controllers/challengeController');

const {
  getMarketplaceProducts,
  createMarketplaceProduct,
  createMarketplaceCoupon,
  checkoutMarketplaceProduct,
  getPurchaseHistory,
  requestOrderRefund
} = require('../controllers/marketplaceController');

const {
  reviewCode,
  reviewResume,
  generateContent,
  getAIChats,
  createAIChat,
  sendAIChatMessage,
  updateAIChat,
  deleteAIChat
} = require('../controllers/aiController');

// ─── PUBLIC COMMUNITY GET ROUTES (Using optionalAuth) ─────────────────
router.get('/posts', optionalAuth, getPosts);
router.get('/posts/:id/comments', optionalAuth, getComments);
router.get('/groups', optionalAuth, getGroups);
router.get('/questions', optionalAuth, getQuestions);
router.get('/questions/:id', optionalAuth, getQuestionDetails);
router.get('/projects', optionalAuth, getProjects);
router.get('/resources', optionalAuth, getResources);
router.get('/jobs', optionalAuth, getJobs);
router.get('/leaderboard', optionalAuth, getLeaderboard);
router.get('/users/:id/profile', optionalAuth, getPublicProfile);
router.get('/events', optionalAuth, getEvents);
router.get('/store/products', optionalAuth, getMarketplaceProducts);
router.get('/groups/:id', optionalAuth, getGroupDetails);

// ─── PROTECTED COMMUNITY ROUTES (Requires Authentication) ────────────
router.use(protect);

// Posts
router.post('/posts', createPost);
router.route('/posts/:id')
  .put(updatePost)
  .delete(deletePost);

router.post('/posts/:id/react', reactToPost);
router.post('/posts/:id/bookmark', bookmarkPost);
router.post('/posts/:id/poll/vote', votePollOption);

// Comments
router.post('/posts/:id/comments', addComment);
router.route('/comments/:commentId')
  .put(updateComment)
  .delete(deleteComment);

// Groups
router.post('/groups', createGroup);
router.route('/groups/:id')
  .put(updateGroup)
  .delete(deleteGroup);

router.post('/groups/:id/join', joinLeaveGroup);
router.post('/groups/:id/assets', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), uploadGroupAssets);
router.post('/groups/:id/members', manageGroupMembers);
router.post('/groups/:id/files', upload.fields([{ name: 'file', maxCount: 1 }]), uploadGroupFile);

// Doubt Lounge (Q&A)
router.post('/questions', createQuestion);
router.route('/questions/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);

router.post('/questions/:id/vote', voteQuestion);
router.post('/questions/:id/bookmark', bookmarkQuestion);
router.post('/questions/:id/answers', createAnswer);

router.post('/answers/:answerId/vote', voteAnswer);
router.post('/answers/:answerId/accept', acceptAnswer);
router.route('/answers/:answerId')
  .put(updateAnswer)
  .delete(deleteAnswer);

// Project Showcase
router.post('/projects', createProject);
router.route('/projects/:id')
  .put(updateProject)
  .delete(deleteProject);

router.post('/projects/:id/like', likeProject);
router.post('/projects/:id/comments', commentOnProject);

// Resources
router.post('/resources', uploadResource);
router.route('/resources/:id')
  .put(updateResource)
  .delete(deleteResource);

router.post('/resources/:id/download', incrementDownload);

// Career Jobs
router.post('/jobs', postJob);
router.route('/jobs/:id')
  .put(updateJob)
  .post(applyToJob)
  .delete(deleteJob);

// Gamification / Follows / Notifications
router.post('/users/:id/follow', toggleFollowUser);
router.get('/notifications', getNotifications);
router.put('/notifications/read', readNotifications);

// Chat / Messaging Timelines
router.route('/chats/conversations')
  .get(getConversations)
  .post(startConversation);

router.get('/chats/messages/:conversationId', getMessages);

// Events
router.post('/events', createEvent);
router.route('/events/:id')
  .put(updateEvent)
  .delete(deleteEvent);

router.post('/events/:id/rsvp', rsvpEvent);

// Reports / Flagging / Moderation
router.route('/reports')
  .get(getReports)
  .post(submitReport);

router.post('/reports/:id/action', actionReport);

router.post('/upload-image', upload.fields([{ name: 'image', maxCount: 1 }]), uploadImageController);
router.post('/delete-image', protect, deleteCommunityImageController);

// Gamification / Rewards & Ecosystem Routes
router.get('/rewards/dashboard', getRewardsDashboard);
router.post('/rewards/claim-mission/:missionId', claimMissionReward);
router.post('/rewards/spin-wheel', triggerSpinWheel);
router.get('/rewards/leaderboard-ecosystem', getLeaderboards);

router.get('/challenges/today', getDailyChallenge);
router.get('/challenges/random', getRandomChallenge);
router.post('/challenges/:id/submit', submitChallengeSolution);
router.post('/challenges/:id/unlock-hint', protect, unlockChallengeHint);
router.post('/challenges/quiz/submit', submitQuizScore);

// Store / Marketplace
router.post('/store/products', createMarketplaceProduct);
router.post('/store/coupons', createMarketplaceCoupon);
router.post('/store/checkout/:productId', checkoutMarketplaceProduct);
router.get('/store/history', getPurchaseHistory);
router.post('/store/refund/:orderId', requestOrderRefund);

// AI Advisor
router.post('/ai/review-code', reviewCode);
router.post('/ai/review-resume', reviewResume);
router.post('/ai/generate-content', generateContent);

router.route('/ai/chats')
  .get(getAIChats)
  .post(createAIChat);

router.route('/ai/chats/:chatId')
  .put(updateAIChat)
  .delete(deleteAIChat);

router.post('/ai/chats/:chatId/messages', sendAIChatMessage);

module.exports = router;
