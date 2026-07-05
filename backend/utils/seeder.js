const CommunityProduct = require('../models/CommunityProduct');
const CommunityChallenge = require('../models/CommunityChallenge');
const CommunityXPConfig = require('../models/CommunityXPConfig');

const seedEcosystem = async () => {
  try {
    // 1. Seed Marketplace Products
    const productCount = await CommunityProduct.countDocuments({});
    if (productCount === 0) {
      await CommunityProduct.create([
        {
          name: 'Premium Member Status',
          description: 'Unlock premium badge, priority search, and extra cloud storage space.',
          priceCoins: 500,
          priceReal: 299,
          category: 'membership',
          itemKey: 'premium_status',
          imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100'
        },
        {
          name: 'Verified Developer Badge',
          description: 'Gain a purple verified checkmark badge next to your user name.',
          priceCoins: 300,
          priceReal: 199,
          category: 'badge',
          itemKey: 'verified_badge',
          imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=100'
        },
        {
          name: 'Gold Profile Border',
          description: 'Surround your profile avatar with an elegant glowing gold outline.',
          priceCoins: 150,
          priceReal: 99,
          category: 'avatar_frame',
          itemKey: 'gold_border',
          imageUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=100'
        },
        {
          name: 'Neon Cyberpunk Theme',
          description: 'A special color palette cosmetic setting for user profiles.',
          priceCoins: 200,
          priceReal: 149,
          category: 'theme',
          itemKey: 'neon_theme',
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100'
        },
        {
          name: 'AI Consulting Pack (100 credits)',
          description: 'Adds 100 AI credits for code analysis and resume reviews.',
          priceCoins: 100,
          priceReal: 49,
          category: 'ai_credits',
          itemKey: 'ai_credits_100',
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=100'
        }
      ]);
      console.log('Ecosystem Marketplace Products seeded successfully.');
    }

    // 2. Seed Daily Challenge
    const challengeCount = await CommunityChallenge.countDocuments({});
    if (challengeCount < 3) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Delete existing to avoid duplicate title keys if any
      await CommunityChallenge.deleteMany({});

      await CommunityChallenge.create([
        {
          title: 'Two Sum Problem',
          description: 'Write a function twoSum(nums, target) that returns indices of the two numbers such that they add up to target.',
          difficulty: 'Easy',
          codeTemplate: `function twoSum(nums, target) {\n  // Write code here\n  return [0, 1];\n}`,
          testCases: [
            { input: '[[2, 7, 11, 15], 9]', output: '[0, 1]' },
            { input: '[[3, 2, 4], 6]', output: '[1, 2]' }
          ],
          activeDate: today,
          xpReward: 100,
          coinsReward: 20
        },
        {
          title: 'Reverse a String',
          description: 'Write a function reverseString(str) that returns the reversed version of the input string.',
          difficulty: 'Easy',
          codeTemplate: `function reverseString(str) {\n  // Write code here\n  return str;\n}`,
          testCases: [
            { input: '["hello"]', output: '"olleh"' },
            { input: '["world"]', output: '"dlrow"' }
          ],
          activeDate: new Date(today.getTime() - 24 * 60 * 60 * 1000), // yesterday
          xpReward: 80,
          coinsReward: 15
        },
        {
          title: 'Palindrome Check',
          description: 'Write a function isPalindrome(str) that returns true if str reads the same forward and backward, else false.',
          difficulty: 'Easy',
          codeTemplate: `function isPalindrome(str) {\n  // Write code here\n  return true;\n}`,
          testCases: [
            { input: '["racecar"]', output: 'true' },
            { input: '["hello"]', output: 'false' }
          ],
          activeDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          xpReward: 90,
          coinsReward: 18
        }
      ]);
      console.log('Ecosystem Daily & Practice Challenges seeded successfully.');
    }

    // 3. Seed XP Configuration
    const xpConfigCount = await CommunityXPConfig.countDocuments({});
    if (xpConfigCount === 0) {
      await CommunityXPConfig.create([
        { actionKey: 'create_post', xpReward: 10, coinsReward: 2 },
        { actionKey: 'comment', xpReward: 5, coinsReward: 1 },
        { actionKey: 'accepted_answer', xpReward: 100, coinsReward: 25 },
        { actionKey: 'daily_challenge', xpReward: 100, coinsReward: 20 },
        { actionKey: 'spin_wheel', xpReward: 20, coinsReward: 5 }
      ]);
      console.log('Ecosystem XP Config parameters seeded successfully.');
    }
  } catch (err) {
    console.error('Ecosystem Seeding failed:', err);
  }
};

module.exports = seedEcosystem;
