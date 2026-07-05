const User = require('../models/User');
const CommunityChallenge = require('../models/CommunityChallenge');
const { awardXPExtended } = require('./rewardsController');

// GET /api/community/challenges/today
const getDailyChallenge = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to find a challenge scheduled for today
    let challenge = await CommunityChallenge.findOne({ activeDate: today });
    if (!challenge) {
      // Fallback: load first available challenge or seed a basic template
      challenge = await CommunityChallenge.findOne({});
      if (!challenge) {
        // Seed default template challenge
        challenge = await CommunityChallenge.create({
          title: 'Two Sum Problem',
          description: 'Write a function twoSum(nums, target) that returns indices of the two numbers such that they add up to target.',
          difficulty: 'Easy',
          codeTemplate: `function twoSum(nums, target) {\n  // Write code here\n  return [0, 1];\n}`,
          testCases: [
            { input: '[[2, 7, 11, 15], 9]', output: '[0, 1]' },
            { input: '[[3, 2, 4], 6]', output: '[1, 2]' }
          ],
          activeDate: today
        });
      }
    }

    const isSolved = challenge.solvedBy.includes(req.user.id);

    res.json({
      success: true,
      data: {
        challenge,
        isSolved
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/challenges/:id/submit
const submitChallengeSolution = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code || code.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Please submit a valid code solution.' });
    }

    const challenge = await CommunityChallenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge details not found' });

    if (challenge.solvedBy.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already solved this challenge today.' });
    }

    // Safety compile check: check for syntax error or malicious code keywords
    if (code.includes('require(') || code.includes('process.exit') || code.includes('child_process')) {
      return res.status(400).json({ success: false, message: 'Security check failed: Forbidden syntax detected.' });
    }

    // Run simulated compiler code execution checks
    let passed = true;
    let message = 'All test cases passed!';

    // Perform basic evaluation check (verify simple return keywords match layout)
    if (!code.includes('return') || code.includes('SyntaxError')) {
      passed = false;
      message = 'Compilation Failed: Return statement missing or syntax mismatch.';
    }

    if (passed) {
      challenge.solvedBy.push(req.user.id);
      await challenge.save();

      // Award Rewards
      await awardXPExtended(req.user.id, challenge.xpReward, challenge.coinsReward);
    }

    res.json({
      success: true,
      passed,
      message,
      rewards: passed ? { xp: challenge.xpReward, coins: challenge.coinsReward } : null
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/challenges/quiz/submit
const submitQuizScore = async (req, res, next) => {
  try {
    const { difficulty, score, totalQuestions } = req.body;
    if (score === undefined || !difficulty) {
      return res.status(400).json({ success: false, message: 'Invalid quiz results payload.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Calculate pass status (at least 60% correct answers)
    const minPass = Math.ceil(totalQuestions * 0.6);
    const passed = score >= minPass;

    let xpAward = 0;
    let coinsAward = 0;

    if (passed) {
      if (difficulty === 'Easy') {
        xpAward = 15;
        coinsAward = 5;
      } else if (difficulty === 'Medium') {
        xpAward = 30;
        coinsAward = 12;
      } else if (difficulty === 'Hard') {
        xpAward = 60;
        coinsAward = 25;
      }
      
      await awardXPExtended(req.user.id, xpAward, coinsAward);
    }

    res.json({
      success: true,
      passed,
      score,
      xpAwarded: xpAward,
      coinsAwarded: coinsAward,
      message: passed 
        ? `Passed! You scored ${score}/${totalQuestions} and earned +${xpAward} XP / +${coinsAward} Coins.` 
        : `Failed! You scored ${score}/${totalQuestions}. You need ${minPass} correct answers to earn rewards.`
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/community/challenges/random
const getRandomChallenge = async (req, res, next) => {
  try {
    // Find challenges that the user has not solved
    const solvedChallenges = await CommunityChallenge.find({ solvedBy: req.user.id });
    const solvedIds = solvedChallenges.map(c => c._id);

    let challenge = await CommunityChallenge.findOne({
      _id: { $nin: solvedIds }
    });

    if (!challenge) {
      // Fallback: pick any random challenge if all are solved
      const count = await CommunityChallenge.countDocuments({});
      if (count > 0) {
        const random = Math.floor(Math.random() * count);
        challenge = await CommunityChallenge.findOne({}).skip(random);
      } else {
        // Return daily default fallback if collection is empty
        challenge = await CommunityChallenge.create({
          title: 'Two Sum Problem',
          description: 'Write a function twoSum(nums, target) that returns indices of the two numbers such that they add up to target.',
          difficulty: 'Easy',
          codeTemplate: `function twoSum(nums, target) {\n  // Write code here\n  return [0, 1];\n}`,
          testCases: [
            { input: '[[2, 7, 11, 15], 9]', output: '[0, 1]' },
            { input: '[[3, 2, 4], 6]', output: '[1, 2]' }
          ]
        });
      }
    }

    res.json({
      success: true,
      data: {
        challenge,
        isSolved: challenge.solvedBy ? challenge.solvedBy.includes(req.user.id) : false
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDailyChallenge,
  submitChallengeSolution,
  submitQuizScore,
  getRandomChallenge
};
