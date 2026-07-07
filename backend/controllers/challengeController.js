const vm = require('vm');
const User = require('../models/User');
const CommunityChallenge = require('../models/CommunityChallenge');
const ChallengeUnlock = require('../models/ChallengeUnlock');
const CoinTransaction = require('../models/CoinTransaction');
const { awardXPExtended } = require('./rewardsController');

// Helper to extract function name from code template
function getFunctionName(template) {
  if (!template) return 'solution';
  const match = template.match(/function\s+(\w+)/);
  return match ? match[1] : 'solution';
}

// Helper to run VM test cases
function runTestCases(userCode, testCases, fnName) {
  const results = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      const sandbox = { result: null };
      
      // Compile function and call it with arguments parsed from tc.input
      const codeToRun = `
        ${userCode}
        const inputArgs = ${tc.input};
        result = ${fnName}(...inputArgs);
      `;

      const script = new vm.Script(codeToRun, { timeout: 1000 }); // 1 second timeout
      vm.createContext(sandbox);
      script.runInContext(sandbox);

      const actualString = JSON.stringify(sandbox.result);
      const expectedString = JSON.stringify(JSON.parse(tc.output));

      if (actualString === expectedString) {
        passedCount++;
        results.push({ testCaseIndex: i, passed: true });
      } else {
        results.push({ 
          testCaseIndex: i, 
          passed: false, 
          error: `Expected: ${expectedString}, Got: ${actualString}` 
        });
      }
    } catch (err) {
      results.push({ testCaseIndex: i, passed: false, error: err.message });
    }
  }

  return {
    passed: passedCount === testCases.length,
    passedCount,
    totalCount: testCases.length,
    results
  };
}

// GET /api/community/challenges/today
const getDailyChallenge = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenge = await CommunityChallenge.findOne({ activeDate: today });
    if (!challenge) {
      challenge = await CommunityChallenge.findOne({});
      if (!challenge) {
        challenge = await CommunityChallenge.create({
          title: 'Two Sum Problem',
          description: 'Write a function twoSum(nums, target) that returns indices of the two numbers such that they add up to target.',
          difficulty: 'Easy',
          codeTemplate: `function twoSum(nums, target) {\n  // Write code here\n  return [0, 1];\n}`,
          testCases: [
            { input: '[[2, 7, 11, 15], 9]', output: '[0, 1]' },
            { input: '[[3, 2, 4], 6]', output: '[1, 2]' }
          ],
          hint1: 'Look at the input parameters and return the expected array indices.',
          hint2: 'Algorithm: Iterate through the array and use a hash map/object to store visited numbers and their indices.',
          hint3: 'Pseudo Code:\nInitialize an empty map\nFor i from 0 to nums.length:\n  diff = target - nums[i]\n  If diff in map:\n    return [map[diff], i]\n  map[nums[i]] = i',
          hint4: 'Partial Code:\nfunction twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (diff in map) {\n      // complete return logic\n    }\n    map[nums[i]] = i;\n  }\n}',
          hint5: 'Full Solution:\nfunction twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (diff in map) {\n      return [map[diff], i];\n    }\n    map[nums[i]] = i;\n  }\n  return [];\n}',
          activeDate: today
        });
      }
    }

    const isSolved = challenge.solvedBy.includes(req.user.id);
    const unlockedLevels = await ChallengeUnlock.find({ user: req.user.id, challenge: challenge._id }).distinct('unlockedLevel');

    // Secure payload: strip locked hints to prevent devtools inspection cheating
    const challengeObj = challenge.toObject();
    if (!unlockedLevels.includes(1)) challengeObj.hint1 = undefined;
    if (!unlockedLevels.includes(2)) challengeObj.hint2 = undefined;
    if (!unlockedLevels.includes(3)) challengeObj.hint3 = undefined;
    if (!unlockedLevels.includes(4)) challengeObj.hint4 = undefined;
    if (!unlockedLevels.includes(5)) challengeObj.hint5 = undefined;

    res.json({
      success: true,
      data: {
        challenge: challengeObj,
        isSolved,
        unlockedLevels
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/community/challenges/random
const getRandomChallenge = async (req, res, next) => {
  try {
    const solvedChallenges = await CommunityChallenge.find({ solvedBy: req.user.id });
    const solvedIds = solvedChallenges.map(c => c._id);

    let challenge = await CommunityChallenge.findOne({ _id: { $nin: solvedIds } });
    if (!challenge) {
      const count = await CommunityChallenge.countDocuments({});
      if (count > 0) {
        const random = Math.floor(Math.random() * count);
        challenge = await CommunityChallenge.findOne({}).skip(random);
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        challenge = await CommunityChallenge.create({
          title: 'Two Sum Problem',
          description: 'Write a function twoSum(nums, target) that returns indices of the two numbers such that they add up to target.',
          difficulty: 'Easy',
          codeTemplate: `function twoSum(nums, target) {\n  // Write code here\n  return [0, 1];\n}`,
          testCases: [
            { input: '[[2, 7, 11, 15], 9]', output: '[0, 1]' },
            { input: '[[3, 2, 4], 6]', output: '[1, 2]' }
          ],
          hint1: 'Look at the input parameters and return the expected array indices.',
          hint2: 'Algorithm: Iterate through the array and use a hash map/object to store visited numbers and their indices.',
          hint3: 'Pseudo Code:\nInitialize an empty map\nFor i from 0 to nums.length:\n  diff = target - nums[i]\n  If diff in map:\n    return [map[diff], i]\n  map[nums[i]] = i',
          hint4: 'Partial Code:\nfunction twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (diff in map) {\n      // complete return logic\n    }\n    map[nums[i]] = i;\n  }\n}',
          hint5: 'Full Solution:\nfunction twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (diff in map) {\n      return [map[diff], i];\n    }\n    map[nums[i]] = i;\n  }\n  return [];\n}',
          activeDate: today
        });
      }
    }

    const isSolved = challenge.solvedBy ? challenge.solvedBy.includes(req.user.id) : false;
    const unlockedLevels = await ChallengeUnlock.find({ user: req.user.id, challenge: challenge._id }).distinct('unlockedLevel');

    // Secure payload
    const challengeObj = challenge.toObject();
    if (!unlockedLevels.includes(1)) challengeObj.hint1 = undefined;
    if (!unlockedLevels.includes(2)) challengeObj.hint2 = undefined;
    if (!unlockedLevels.includes(3)) challengeObj.hint3 = undefined;
    if (!unlockedLevels.includes(4)) challengeObj.hint4 = undefined;
    if (!unlockedLevels.includes(5)) challengeObj.hint5 = undefined;

    res.json({
      success: true,
      data: {
        challenge: challengeObj,
        isSolved,
        unlockedLevels
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/challenges/:id/unlock-hint
const unlockChallengeHint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { level } = req.body;

    const challenge = await CommunityChallenge.findById(id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const costs = { 1: 0, 2: 5, 3: 10, 4: 15, 5: 25 };
    const cost = costs[level];
    if (cost === undefined) {
      return res.status(400).json({ success: false, message: 'Invalid hint level.' });
    }

    // Check if already unlocked
    const existing = await ChallengeUnlock.findOne({ user: req.user.id, challenge: id, unlockedLevel: level });
    if (existing) {
      return res.json({
        success: true,
        message: 'Hint already unlocked.',
        hint: level === 1 ? challenge.hint1 : level === 2 ? challenge.hint2 : level === 3 ? challenge.hint3 : level === 4 ? challenge.hint4 : challenge.hint5,
        coins: user.coins
      });
    }

    // Verify coin balance
    if (user.coins < cost) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient Developer Coins. You need ${cost} coins, but you only have ${user.coins} coins.` 
      });
    }

    // Deduct coins if there is a cost
    if (cost > 0) {
      user.coins -= cost;
      await user.save({ validateBeforeSave: false });

      // Save Coin Transaction
      await CoinTransaction.create({
        user: req.user.id,
        amount: -cost,
        type: 'spend',
        source: 'hint_unlock',
        description: `Unlocked Level ${level} Hint for "${challenge.title}"`
      });
    }

    // Save unlock record
    await ChallengeUnlock.create({
      user: req.user.id,
      challenge: id,
      unlockedLevel: level,
      coinsSpent: cost
    });

    res.json({
      success: true,
      message: 'Hint unlocked successfully.',
      hint: level === 1 ? challenge.hint1 : level === 2 ? challenge.hint2 : level === 3 ? challenge.hint3 : level === 4 ? challenge.hint4 : challenge.hint5,
      coins: user.coins
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/challenges/:id/submit
const submitChallengeSolution = async (req, res, next) => {
  try {
    const { code, runOnly } = req.body;
    if (!code || code.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Please submit a valid code solution.' });
    }

    const challenge = await CommunityChallenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge details not found' });

    // Compile check safety guards
    if (code.includes('require(') || code.includes('process.exit') || code.includes('child_process')) {
      return res.status(400).json({ success: false, message: 'Security check failed: Forbidden keywords detected.' });
    }

    const fnName = getFunctionName(challenge.codeTemplate);
    const evaluation = runTestCases(code, challenge.testCases, fnName);

    if (runOnly) {
      return res.json({
        success: true,
        passed: evaluation.passed,
        message: evaluation.passed 
          ? 'All example test cases passed successfully!' 
          : `${evaluation.totalCount - evaluation.passedCount} test cases failed.`,
        results: evaluation.results,
        runOnly: true
      });
    }

    // Submit Logic: user must not solve twice
    if (challenge.solvedBy.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already solved this challenge today.' });
    }

    if (evaluation.passed) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User profile not found.' });

      // Determine reward multiplier based on unlocked hints
      const unlocks = await ChallengeUnlock.find({ user: req.user.id, challenge: challenge._id }).distinct('unlockedLevel');
      
      let multiplier = 1.0;
      let usedFullSolution = false;

      if (unlocks.includes(5)) {
        multiplier = 0.0;
        usedFullSolution = true;
      } else if (unlocks.includes(4)) {
        multiplier = 0.3;
      } else if (unlocks.includes(3)) {
        multiplier = 0.6;
      } else if (unlocks.includes(2)) {
        multiplier = 0.8;
      }

      const xpEarned = Math.round(challenge.xpReward * multiplier);
      const coinsEarned = Math.round(challenge.coinsReward * multiplier);

      // Save user rewards
      user.xp += xpEarned;
      user.coins += coinsEarned;
      user.challengesSolvedCount += 1;
      await user.save({ validateBeforeSave: false });

      // Add user to solved list
      challenge.solvedBy.push(req.user.id);
      await challenge.save();

      // Log Coin Transaction
      if (coinsEarned > 0) {
        await CoinTransaction.create({
          user: req.user.id,
          amount: coinsEarned,
          type: 'earn',
          source: 'challenge_solve',
          description: `Solved challenge "${challenge.title}" (Multiplier: ${multiplier * 100}%)`
        });
      }

      // Add Notification
      const CommunityNotification = require('../models/CommunityNotification');
      await CommunityNotification.create({
        recipient: req.user.id,
        sender: req.user.id,
        type: 'challenge_reward',
        message: `Congrats! Solved "${challenge.title}". Earned +${xpEarned} XP / +${coinsEarned} Coins.`
      });

      return res.json({
        success: true,
        passed: true,
        message: usedFullSolution 
          ? 'Challenge submitted! However, since you viewed the full solution, you earned 0 rewards.' 
          : `Challenge solved successfully! Earned +${xpEarned} XP and +${coinsEarned} Coins.`,
        rewards: { xp: xpEarned, coins: coinsEarned }
      });
    } else {
      return res.json({
        success: true,
        passed: false,
        message: `${challenge.testCases.length - evaluation.passedCount} test cases failed. Try again!`,
        results: evaluation.results
      });
    }
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
      
      user.xp += xpAward;
      user.coins += coinsAward;
      await user.save({ validateBeforeSave: false });

      if (coinsAward > 0) {
        await CoinTransaction.create({
          user: req.user.id,
          amount: coinsAward,
          type: 'earn',
          source: 'quiz_pass',
          description: `Passed ${difficulty} Quiz (${score}/${totalQuestions})`
        });
      }

      const CommunityNotification = require('../models/CommunityNotification');
      await CommunityNotification.create({
        recipient: req.user.id,
        sender: req.user.id,
        type: 'coin_reward',
        message: `Passed ${difficulty} Quiz! Earned +${xpAward} XP / +${coinsAward} Coins.`
      });
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

module.exports = {
  getDailyChallenge,
  submitChallengeSolution,
  submitQuizScore,
  getRandomChallenge,
  unlockChallengeHint
};
