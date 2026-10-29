const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');
const CommunityQuestion = require('../models/CommunityQuestion');
const Share = require('../models/Share');
const SEO = require('../models/SEO');

// Helper to resolve dynamic CLIENT_URL from DB SEO or fallback env
const getClientUrl = async () => {
  try {
    const seo = await SEO.findOne({});
    if (seo && seo.siteUrl) {
      return seo.siteUrl.replace(/\/$/, '');
    }
  } catch (err) {
    console.error('Failed to get siteUrl from SEO:', err);
  }
  return process.env.CLIENT_URL || 'https://tauhidshekhar.com';
};

// POST /api/share/track
exports.trackShare = async (req, res) => {
  try {
    const { contentType, contentId, platform } = req.body;
    if (!contentType || !contentId || !platform) {
      return res.status(400).json({ success: false, message: 'Missing sharing parameters' });
    }

    const shareLog = await Share.create({
      userId: req.user ? req.user._id : null,
      contentType,
      contentId,
      platform
    });

    res.status(201).json({ success: true, data: shareLog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/share/profile/:username
exports.shareProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase(), status: 'Active' });
    const clientUrl = await getClientUrl();

    if (!user) {
      return res.redirect(`${clientUrl}/`);
    }

    // Dynamic metadata
    const title = `${user.fullName} (@${user.username}) | Developer Profile`;
    const description = user.bio || user.profession || `Check out ${user.fullName}'s profile, achievements, and contributions.`;
    const imageUrl = user.avatar?.url || `${clientUrl}/assits/Profile_Pic.png`;
    const redirectUrl = `${clientUrl}/community/profile/${user._id}`;

    res.send(generateMetaHtml(title, description, imageUrl, redirectUrl));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

// GET /api/share/post/:id
exports.sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findOne({ _id: id, status: 'active' }).populate('author', 'fullName');
    const clientUrl = await getClientUrl();

    if (!post) {
      return res.redirect(`${clientUrl}/community`);
    }

    const title = `${post.title || 'Community Post'} by ${post.author?.fullName || 'User'}`;
    const description = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : 'Check out this post on the community network.';
    const imageUrl = post.mediaUrl || (post.mediaUrls && post.mediaUrls[0]) || `${clientUrl}/assits/Profile_Pic.png`;
    const redirectUrl = `${clientUrl}/community?post=${post._id}`;

    res.send(generateMetaHtml(title, description, imageUrl, redirectUrl));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

// GET /api/share/doubt/:id
exports.shareDoubt = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await CommunityQuestion.findById(id).populate('author', 'fullName');
    const clientUrl = await getClientUrl();

    if (!question) {
      return res.redirect(`${clientUrl}/community/doubts`);
    }

    const title = `Doubt: ${question.title} | Developer Network`;
    const description = question.content ? question.content.replace(/<[^>]*>/g, '').substring(0, 160) : 'Help solve this programming doubt on our community!';
    const imageUrl = (question.images && question.images[0]?.url) || `${clientUrl}/assits/Profile_Pic.png`;
    const redirectUrl = `${clientUrl}/community/doubts?id=${question._id}`;

    res.send(generateMetaHtml(title, description, imageUrl, redirectUrl));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

// Utility function to generate crawler HTML with OpenGraph tags
function generateMetaHtml(title, description, imageUrl, redirectUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(redirectUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${escapeHtml(redirectUrl)}">
  <meta property="twitter:title" content="${escapeHtml(title)}">
  <meta property="twitter:description" content="${escapeHtml(description)}">
  <meta property="twitter:image" content="${escapeHtml(imageUrl)}">

  <!-- Search Engine Previews & Redirect -->
  <link rel="canonical" href="${escapeHtml(redirectUrl)}">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(redirectUrl)}">
  <script type="text/javascript">
    window.location.href = "${escapeHtml(redirectUrl)}";
  </script>
</head>
<body>
  <p>Redirecting you to the content at <a href="${escapeHtml(redirectUrl)}">${escapeHtml(redirectUrl)}</a>...</p>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
