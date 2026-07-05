const User = require('../models/User');
const AIChat = require('../models/AIChat');

// Helper to simulate smart AI responses based on category and user prompt
const generateSmartAIResponse = (prompt, category) => {
  const normalizedCat = (category || 'General').toLowerCase();
  
  if (normalizedCat.includes('react')) {
    return `### AI React Assistant ⚛️\n\nI reviewed your query about React updates. To optimize this, here is a clean functional component design implementing state management and dependency optimizations:\n\n\`\`\`jsx\nimport React, { useState, useEffect, useMemo, useCallback } from 'react';\n\nconst OptimizedComponent = ({ items, onItemSelect }) => {\n  const [searchQuery, setSearchQuery] = useState('');\n\n  // Memoize filtered results to prevent expensive re-evaluations\n  const filteredItems = useMemo(() => {\n    return items.filter(item => \n      item.name.toLowerCase().includes(searchQuery.toLowerCase())\n    );\n  }, [items, searchQuery]);\n\n  // Memoize callback to prevent un-necessary child render cycles\n  const handleSelect = useCallback((item) => {\n    onItemSelect(item);\n  }, [onItemSelect]);\n\n  return (\n    <div className="p-4 bg-[#121217] rounded-2xl border border-white/5">\n      <input\n        type="text"\n        placeholder="Search components..."\n        value={searchQuery}\n        onChange={(e) => setSearchQuery(e.target.value)}\n        className="w-full px-3 py-2 bg-[#181822] rounded-xl text-white"\n      />\n      <ul className="mt-3 flex flex-col gap-2">\n        {filteredItems.map(item => (\n          <li \n            key={item.id} \n            onClick={() => handleSelect(item)}\n            className="p-2.5 rounded-lg hover:bg-purple-650/15 cursor-pointer text-xs"\n          >\n            {item.name}\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n};\n\nexport default OptimizedComponent;\n\`\`\`\n\n**💡 Key Recommendations:**\n1. Always wrap callback dependencies passed down to child list rows in \`useCallback\`.\n2. Ensure your \`useEffect\` hooks clean up timers, listeners, and abort active fetch controls to avoid state leakage.`;
  }

  if (normalizedCat.includes('node') || normalizedCat.includes('express')) {
    return `### AI Backend Engineer 🟢\n\nHere is an optimized pattern for Express middleware handling input validations and controller wrapping logic:\n\n\`\`\`javascript\nconst express = require('express');\nconst router = express.Router();\n\n// Reusable controller wrapper to eliminate boiler-plate try-catch\nconst asyncHandler = (fn) => (req, res, next) => {\n  Promise.resolve(fn(req, res, next)).catch(next);\n};\n\n// Route controller example\nconst getUserData = asyncHandler(async (req, res) => {\n  const user = await User.findById(req.user.id).select('-password');\n  if (!user) {\n    return res.status(404).json({ success: false, message: 'Profile not found' });\n  }\n  res.json({ success: true, data: user });\n});\n\nrouter.get('/profile', requireAuth, getUserData);\n\nmodule.exports = router;\n\`\`\`\n\n**🔒 Security Checklist:**\n- Ensure you run Zod or Joi schemas on the incoming requests body payload.\n- Implement CORS whitelist protocols and enable secure cookie HTTPOnly policies.`;
  }

  if (normalizedCat.includes('mongodb') || normalizedCat.includes('sql')) {
    return `### AI Database Administrator 💾\n\nTo queries matching your description, utilize index caching or join maps. Here is a high-performance demonstration:\n\n**MongoDB Aggregation Pipeline:**\n\`\`\`javascript\nconst getThreadAnalytics = async (postId) => {\n  return await CommunityPost.aggregate([\n    { $match: { _id: mongoose.Types.ObjectId(postId) } },\n    {\n      $lookup: {\n        from: 'communitycomments',\n        localField: '_id',\n        foreignField: 'post',\n        as: 'comments'\n      }\n    },\n    {\n      $project: {\n        title: 1,\n        commentCount: { $size: '$comments' },\n        reactionsSummary: { $size: '$reactions' }\n      }\n    }\n  ]);\n};\n\`\`\`\n\n**SQL Equivalent with Indexing:**\n\`\`\`sql\nCREATE INDEX idx_user_posts ON posts(user_id, status);\n\nSELECT p.id, p.title, COUNT(c.id) AS comment_count\nFROM posts p\nLEFT JOIN comments c ON c.post_id = p.id\nWHERE p.user_id = 45 \nGROUP BY p.id;\n\`\`\``;
  }

  if (normalizedCat.includes('dsa') || normalizedCat.includes('algo')) {
    return `### AI DSA Tutor 🧠\n\nLet's break down the optimal solution approach for your problem:\n\n**Approach: Two-Pointer Technique**\nBy sorting the collection first, we can iterate from both boundaries inward, reducing the runtime complexity from \\(O(n^2)\\) down to \\(O(n \\log n)\\).\n\n**Time Complexity:** \\(O(n \\log n)\\)\n**Space Complexity:** \\(O(1)\\)\n\n\`\`\`javascript\nfunction hasPairWithSum(arr, targetSum) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  // Sort in ascending order\n  arr.sort((a, b) => a - b);\n  \n  while (left < right) {\n    const currentSum = arr[left] + arr[right];\n    if (currentSum === targetSum) return true;\n    if (currentSum < targetSum) left++;\n    else right--;\n  }\n  return false;\n}\n\`\`\``;
  }

  if (normalizedCat.includes('roadmap') || normalizedCat.includes('career')) {
    return `### AI Career Strategist 🗺️\n\nHere is a comprehensive Full-Stack Developer career roadmap structured specifically to level up your engineering reputation:\n\n1. **Frontend Core Foundations**:\n   - master Semantic HTML, CSS variables, HSL color maps, and Flexbox/Grid.\n   - Master React, client route configurations, and state engines (Redux Toolkit, Context).\n\n2. **Backend & Databases**:\n   - Learn Node.js runtime environment and Express middleware construction.\n   - Master Mongoose schemas, relational SQL indexes, and aggregation pipelines.\n\n3. **DevOps & Hosting Infrastructure**:\n   - Docker containerization packaging, GitHub actions CI/CD pipelines.\n   - Cloudinary CDN configurations, security locks, and server scalability setups.`;
  }

  if (normalizedCat.includes('interview')) {
    return `### AI Technical Interviewer 🎙️\n\nHere are three typical senior developer interview questions matching your request, along with model answer structures:\n\n1. **Question: How does the virtual DOM in React improve rendering overhead?**\n   - *Response Goal*: Discuss reconciliation, diff algorithms, batching DOM manipulations, and node comparisons.\n\n2. **Question: Explain how you prevent race conditions during distributed updates in MongoDB?**\n   - *Response Goal*: Explain atomic operations (\`$inc\`, \`$set\`), optimistic locking (checking version keys), or session transactions.\n\n3. **Question: What are the differences between access tokens and refresh tokens in secure cookie setups?**\n   - *Response Goal*: Discuss token lifetime (15 mins vs 7 days), HttpOnly scope, XSS risk mitigation, and database revoking.`;
  }

  return `### AI Developer Assistant 🤖\n\nI evaluated your query: *"${prompt.substring(0, 100)}..."*\n\nHere is my professional assessment:\n- **Optimization**: Modularize code layers into separate utility modules.\n- **Error Prevention**: Introduce safety guards and check for undefined elements before running loops.\n- **Readability**: Add detailed descriptive comments explaining complex code paths.\n\nWhat other questions or coding problems can I help you resolve?`;
};

// GET /api/community/ai/chats
const getAIChats = async (req, res, next) => {
  try {
    const chats = await AIChat.find({ user: req.user.id })
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: chats });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/ai/chats
const createAIChat = async (req, res, next) => {
  try {
    const { title = 'New AI Consultation', category = 'General' } = req.body;
    
    const chat = await AIChat.create({
      user: req.user.id,
      title,
      category,
      messages: [
        {
          role: 'assistant',
          content: `Hello! I am your AI assistant specialized in **${category}**. Ask me any question, and let's optimize your code!`
        }
      ]
    });

    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/ai/chats/:chatId/messages
const sendAIChatMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(450).json({ success: false, message: 'Message content cannot be blank.' });
    }

    const chat = await AIChat.findOne({ _id: req.params.chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'AI chat session not found.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if ((user.aiCredits || 0) < 1) {
      return res.status(400).json({ success: false, message: 'Insufficient AI credits. Please purchase more credits in the Marketplace!' });
    }

    // Deduct 1 credit
    user.aiCredits -= 1;
    await user.save({ validateBeforeSave: false });

    // Append user message
    chat.messages.push({
      role: 'user',
      content
    });

    // Simulate smart AI reply
    const aiResponse = generateSmartAIResponse(content, chat.category);

    chat.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    // Auto-update title if it's the default and this is the first custom message
    if (chat.title === 'New AI Consultation' && chat.messages.length <= 3) {
      chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    await chat.save();

    res.json({
      success: true,
      data: chat,
      creditsLeft: user.aiCredits
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/community/ai/chats/:chatId
const updateAIChat = async (req, res, next) => {
  try {
    const { title, isBookmarked } = req.body;
    const chat = await AIChat.findOne({ _id: req.params.chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'AI chat session not found.' });
    }

    if (title !== undefined) chat.title = title;
    if (isBookmarked !== undefined) chat.isBookmarked = isBookmarked;

    await chat.save();
    res.json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/community/ai/chats/:chatId
const deleteAIChat = async (req, res, next) => {
  try {
    const chat = await AIChat.findOneAndDelete({ _id: req.params.chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'AI chat session not found.' });
    }
    res.json({ success: true, message: 'AI chat session deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/ai/review-code
const reviewCode = async (req, res, next) => {
  try {
    const { code, language = 'Javascript' } = req.body;
    if (!code || code.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide valid source code to review.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if ((user.aiCredits || 0) < 1) {
      return res.status(400).json({ success: false, message: 'Insufficient AI credits balance. Please buy more credits in the Marketplace.' });
    }

    // Deduct credit
    user.aiCredits -= 1;
    await user.save({ validateBeforeSave: false });

    // Mock rich structural response
    const analysis = {
      score: Math.floor(Math.random() * 30) + 65, // 65-95
      positives: [
        'Clean variable nomenclature matches camelCase standard.',
        'Proper handling of async promises with clean blocks.'
      ],
      warnings: [
        'Ensure global variables do not leak into local execution contexts.',
        'Possible optimization by utilizing memoization hooks.'
      ],
      suggestions: `Consider refactoring the iterations into Array map reduce utilities to improve visual readability.`,
      refactoredCode: `// Optimized version\n${code}\n// Suggestions applied successfully.`
    };

    res.json({
      success: true,
      data: analysis,
      creditsLeft: user.aiCredits
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/ai/review-resume
const reviewResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Please provide resume experience parameters.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if ((user.aiCredits || 0) < 1) {
      return res.status(400).json({ success: false, message: 'Insufficient AI credits.' });
    }

    user.aiCredits -= 1;
    await user.save({ validateBeforeSave: false });

    const review = {
      overallScore: Math.floor(Math.random() * 20) + 75, // 75-95
      atsCompatibility: 'High',
      strengths: [
        'Strong highlight of impact parameters (percentage growth, XP streaking).',
        'Clear framework certifications structure.'
      ],
      gaps: [
        'Missing links to live deployment project builds.',
        'Add developer levels community highlights.'
      ],
      recommendedKeywords: ['RESTful APIs', 'Cloudinary CDN', 'Micro-Frontend Architecture']
    };

    res.json({
      success: true,
      data: review,
      creditsLeft: user.aiCredits
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/ai/generate-content
const generateContent = async (req, res, next) => {
  try {
    const { topic, category = 'General' } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: 'Topic is required.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if ((user.aiCredits || 0) < 1) {
      return res.status(400).json({ success: false, message: 'Insufficient AI credits.' });
    }

    user.aiCredits -= 1;
    await user.save({ validateBeforeSave: false });

    let generatedText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.includes('your_gemini_api_key')) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: topic }] }]
          })
        });
        const result = await response.json();
        generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (err) {
        console.error('Gemini content generator error:', err.message);
      }
    }

    // Fallback templates in case of offline or missing key
    if (!generatedText) {
      if (category === 'Cover Letter') {
        const titleMatch = topic.match(/role of (.*?) at/i);
        const companyMatch = topic.match(/at (.*?)(\.|$)/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Software Developer';
        const company = companyMatch ? companyMatch[1].trim() : 'your esteemed organization';

        generatedText = `Dear Hiring Manager,

I am writing to express my strong interest in the ${title} position at ${company}. With a solid foundation in full-stack software development and a proven history of designing clean web components, database indices, and REST API structures, I am confident in my capacity to deliver immediately.

In my recent projects, I have built highly scalable portals utilizing React for intuitive front-end interfaces and Node.js/Express backed by MongoDB on the server side. I focus on writing modular, reusable code, securing authentication handshakes, and optimizing query speeds.

Thank you for your consideration. I am excited about the opportunity to join ${company} and look forward to discussing how my technical background aligns with your project goals.

Sincerely,
${user.fullName}`;
      } else {
        generatedText = `💡 Dev Tip: Let's discuss ${topic} today!\n\nBuilding apps around ${topic} requires careful consideration of performance indexes. Here is how I usually approach it:\n\n1. Use pre-loaded CDN cache states.\n2. Optimize asynchronous database updates.\n\nWhat are your thoughts or guidelines on this? Let me know in the comments below! 👇\n\n#development #tips #${category.toLowerCase()}`;
      }
    }

    res.json({
      success: true,
      data: generatedText,
      creditsLeft: user.aiCredits
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  reviewCode,
  reviewResume,
  generateContent,
  getAIChats,
  createAIChat,
  sendAIChatMessage,
  updateAIChat,
  deleteAIChat
};
