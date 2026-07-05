const User = require('../models/User');
const CommunityMission = require('../models/CommunityMission');
const CommunityNotification = require('../models/CommunityNotification');

// Dynamic XP Awards helper (duplicated here for modularity)
const awardXPExtended = async (userId, xpAmount, coinsAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.xp = (user.xp || 0) + xpAmount;
    user.coins = (user.coins || 0) + coinsAmount;
    user.reputation = (user.reputation || 0) + Math.floor(xpAmount / 5);

    // Level Calculation
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
      // Auto upgrade rank
      if (targetLevel >= 50) user.rank = 'Legendary Grandmaster';
      else if (targetLevel >= 20) user.rank = 'Elite Master';
      else if (targetLevel >= 10) user.rank = 'Senior Developer';
      else if (targetLevel >= 5) user.rank = 'Professional';
      else if (targetLevel >= 3) user.rank = 'Intermediate';
      else if (targetLevel >= 2) user.rank = 'Novice';
    }

    await user.save({ validateBeforeSave: false });
  } catch (err) {
    console.error('awardXPExtended error:', err);
  }
};

// GET /api/community/rewards/dashboard
const getRewardsDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('xp coins level rank dailyStreak weeklyStreak monthlyStreak trustScore contributionScore badges lastLoginDate spinWheelLastUsed');

    // Create or retrieve daily/weekly missions
    const resetDate = new Date();
    resetDate.setHours(23, 59, 59, 999);

    let dailyMission = await CommunityMission.findOne({ user: req.user.id, type: 'daily', resetAt: { $gt: new Date() } });
    if (!dailyMission) {
      dailyMission = await CommunityMission.create({
        user: req.user.id,
        type: 'daily',
        postsRequired: 2,
        commentsRequired: 4,
        likesRequired: 5,
        resetAt: resetDate
      });
    }

    let weeklyMission = await CommunityMission.findOne({ user: req.user.id, type: 'weekly', resetAt: { $gt: new Date() } });
    if (!weeklyMission) {
      const sunday = new Date();
      sunday.setDate(sunday.getDate() + (7 - sunday.getDay()));
      sunday.setHours(23, 59, 59, 999);

      weeklyMission = await CommunityMission.create({
        user: req.user.id,
        type: 'weekly',
        postsRequired: 7,
        commentsRequired: 20,
        likesRequired: 25,
        resetAt: sunday
      });
    }

    res.json({
      success: true,
      data: {
        profile: user,
        missions: {
          daily: dailyMission,
          weekly: weeklyMission
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/rewards/claim-mission/:missionId
const claimMissionReward = async (req, res, next) => {
  try {
    const mission = await CommunityMission.findOne({ _id: req.params.missionId, user: req.user.id });
    if (!mission) return res.status(404).json({ success: false, message: 'Mission tracking not found' });

    if (mission.rewardClaimed) {
      return res.status(400).json({ success: false, message: 'Rewards already claimed.' });
    }

    // Verify completion
    const isPostDone = mission.postsCreated >= mission.postsRequired;
    const isCommentDone = mission.commentsCreated >= mission.commentsRequired;
    const isLikeDone = mission.likesGiven >= mission.likesRequired;

    if (!isPostDone || !isCommentDone || !isLikeDone) {
      return res.status(400).json({ success: false, message: 'Mission goals not completed yet.' });
    }

    mission.isCompleted = true;
    mission.rewardClaimed = true;
    await mission.save();

    // Award Rewards
    const xpReward = mission.type === 'daily' ? 100 : 350;
    const coinsReward = mission.type === 'daily' ? 25 : 100;

    await awardXPExtended(req.user.id, xpReward, coinsReward);

    res.json({
      success: true,
      message: 'Mission reward claimed successfully!',
      rewards: { xp: xpReward, coins: coinsReward }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/rewards/spin-wheel
const triggerSpinWheel = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const now = new Date();
    if (user.spinWheelLastUsed) {
      const diffMs = now.getTime() - new Date(user.spinWheelLastUsed).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < 24) {
        const remainingHours = Math.ceil(24 - diffHours);
        return res.status(400).json({
          success: false,
          message: `Wheel already spun today. Try again in ${remainingHours} hours.`
        });
      }
    }

    // Spin sector items
    const sectors = [
      { name: '10 Coins', coins: 10, xp: 0 },
      { name: '20 Coins', coins: 20, xp: 0 },
      { name: '50 Coins', coins: 50, xp: 0 },
      { name: '100 XP', coins: 0, xp: 100 },
      { name: '200 XP', coins: 0, xp: 200 },
      { name: 'Jackpot (100 Coins + 250 XP)', coins: 100, xp: 250 },
      { name: 'Try Again Next Time', coins: 0, xp: 0 },
      { name: '5 Coins', coins: 5, xp: 0 }
    ];

    const spinIndex = Math.floor(Math.random() * sectors.length);
    const resultSector = sectors[spinIndex];

    user.spinWheelLastUsed = now;
    await user.save({ validateBeforeSave: false });

    if (resultSector.coins > 0 || resultSector.xp > 0) {
      await awardXPExtended(req.user.id, resultSector.xp, resultSector.coins);
    }

    res.json({
      success: true,
      data: {
        spinIndex,
        resultName: resultSector.name,
        coinsEarned: resultSector.coins,
        xpEarned: resultSector.xp
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/community/rewards/leaderboard
const getLeaderboards = async (req, res, next) => {
  try {
    const { category = 'xp' } = req.query; // xp, followers, reputation, projects
    let sortQuery = { xp: -1 };
    
    if (category === 'followers') sortQuery = { followers: -1 };
    else if (category === 'reputation') sortQuery = { reputation: -1 };
    else if (category === 'projects') sortQuery = { savedProjects: -1 };

    const board = await User.find({ isActive: true })
      .select('fullName username avatar role xp reputation badges followers')
      .sort(sortQuery)
      .limit(10);

    res.json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRewardsDashboard,
  claimMissionReward,
  triggerSpinWheel,
  getLeaderboards,
  awardXPExtended
};
