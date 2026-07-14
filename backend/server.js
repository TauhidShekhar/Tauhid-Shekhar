// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const mongoose = require('mongoose');
const socketUtil = require('./utils/socketUtil');
mongoose.plugin(socketUtil.contentSyncPlugin);

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { performanceMiddleware } = require('./middleware/performanceMiddleware');

const app = express();

// Register performance tracker at the very start of request lifecycle
app.use(performanceMiddleware);

// Enable GZIP compression to reduce payload transfer sizes
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Middleware to ensure DB connection and admin seeder on Serverless hosts (Vercel)
app.use(async (req, res, next) => {
  // Bypass DB check for root path, static assets, and uploads
  if (
    req.path === '/' || 
    req.path === '/api/health' || 
    req.path.startsWith('/admin/assets') || 
    req.path.startsWith('/uploads') || 
    req.path.endsWith('.ico') || 
    req.path.endsWith('.css') || 
    req.path.endsWith('.js')
  ) {
    return next();
  }
  try {
    await connectDB();
    // In serverless environments, check and run seeders on demand
    if (process.env.VERCEL) {
      const User = require('./models/User');
      const adminExists = await User.findOne({ username: 'admin' });
      if (!adminExists) {
        await User.create({
          fullName: 'Portfolio Administrator',
          username: 'admin',
          email: 'admin@example.com',
          password: 'password123',
          role: 'Admin',
          isEmailVerified: true
        });
        const seedEcosystem = require('./utils/seeder');
        await seedEcosystem();
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Trust reverse proxies (Cloudflare, Heroku, Nginx, Vercel, etc.)
app.set('trust proxy', 1);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Serve static uploads locally
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'", 
          "data:", 
          "blob:", 
          "https://res.cloudinary.com", 
          "https://*.cloudinary.com"
        ],
        connectSrc: [
          "'self'", 
          "http://localhost:5000", 
          "http://127.0.0.1:5000", 
          "ws://localhost:5000", 
          "ws://127.0.0.1:5000",
          "http://localhost:5173",
          "http://localhost:5174",
          "ws://localhost:5173",
          "ws://localhost:5174"
        ]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://tauhidshekhar.vercel.app',
  'https://tauhidshekhar-admin.vercel.app',
  'https://tauhid-shekhar-portfolio-f4xf.vercel.app'
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}
if (process.env.ADMIN_URL) {
  allowedOrigins.push(process.env.ADMIN_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development mode, allow localhost/127.0.0.1 sub-ports
    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cache-Control', 'Pragma', 'x-refresh-token', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Disable caching for all API responses and register Socket.io content update broadcast
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Intercept json responses to broadcast mutation updates in real-time
  const originalJson = res.json;
  res.json = function (data) {
    originalJson.apply(this, arguments);

    if (['POST', 'PUT', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      const io = req.app.get('io');
      if (io) {
        io.emit('content_update', {
          path: req.originalUrl,
          method: req.method
        });
      }
    }
  };

  next();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const skillRoutes = require('./routes/skillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const messageRoutes = require('./routes/messageRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const educationRoutes = require('./routes/educationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const seoRoutes = require('./routes/seoRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const auditRoutes = require('./routes/auditRoutes');
const backupRoutes = require('./routes/backupRoutes');
const userRoutes = require('./routes/userRoutes');
const heroRoutes = require('./routes/heroRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const orderRoutes = require('./routes/orderRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const communityRoutes = require('./routes/communityRoutes');
const featureRoutes = require('./routes/featureRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');

// Mount Routes
const { cacheMiddleware } = require('./middleware/cacheMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/skills', cacheMiddleware('skills'), skillRoutes);
app.use('/api/projects', cacheMiddleware('projects'), projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', messageRoutes);
app.use('/api/experience', cacheMiddleware('experience'), experienceRoutes);
app.use('/api/education', cacheMiddleware('education'), educationRoutes);
app.use('/api/settings', cacheMiddleware('settings'), settingsRoutes);
app.use('/api/blogs', cacheMiddleware('blogs'), blogRoutes);
app.use('/api/testimonials', cacheMiddleware('testimonials'), testimonialRoutes);
app.use('/api/certificates', cacheMiddleware('certificates'), certificateRoutes);
app.use('/api/achievements', cacheMiddleware('achievements'), achievementRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/resume', cacheMiddleware('resume'), resumeRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hero', cacheMiddleware('hero'), heroRoutes);
app.use('/api/about', cacheMiddleware('about'), aboutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', cacheMiddleware('services'), serviceRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/cms', cmsRoutes);

// Dynamic Sitemap generator
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const Blog = require('./models/Blog');
    const Project = require('./models/Project');
    const SEO = require('./models/SEO');

    const seo = await SEO.findOne({});
    const siteUrl = (seo && seo.siteUrl) ? seo.siteUrl.replace(/\/$/, '') : 'https://tauhidshekhar.vercel.app';

    // Static pages
    const pages = [
      { url: '', changefreq: 'daily', priority: 1.0 },
      { url: '/resume', changefreq: 'weekly', priority: 0.8 },
      { url: '/projects', changefreq: 'weekly', priority: 0.8 },
      { url: '/blog', changefreq: 'daily', priority: 0.8 },
      { url: '/community', changefreq: 'daily', priority: 0.9 },
      { url: '/contact', changefreq: 'monthly', priority: 0.7 }
    ];

    // Fetch dynamic blogs
    const blogs = await Blog.find({ status: 'Published' }).select('slug updatedAt');
    blogs.forEach(b => {
      pages.push({
        url: `/blog/${b.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: b.updatedAt.toISOString().split('T')[0]
      });
    });

    // Fetch dynamic projects
    const projects = await Project.find({}).select('_id updatedAt');
    projects.forEach(p => {
      pages.push({
        url: `/projects/${p._id}`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: p.updatedAt.toISOString().split('T')[0]
      });
    });

    // Build XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    pages.forEach(p => {
      xml += '  <url>\n';
      xml += `    <loc>${siteUrl}${p.url}</loc>\n`;
      if (p.lastmod) {
        xml += `    <lastmod>${p.lastmod}</lastmod>\n`;
      } else {
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      }
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

// Dynamic Robots.txt generator
app.get('/robots.txt', async (req, res, next) => {
  try {
    const SEO = require('./models/SEO');
    const seo = await SEO.findOne({});
    const siteUrl = (seo && seo.siteUrl) ? seo.siteUrl.replace(/\/$/, '') : 'https://tauhidshekhar.vercel.app';
    const robotsContent = (seo && seo.robotsTxt) ? seo.robotsTxt : `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml`;
    
    res.header('Content-Type', 'text/plain');
    res.send(robotsContent);
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Portfolio Enterprise API Server is running smoothly!' });
});

// Seed default Admin User if DB is empty
const User = require('./models/User');
const { seedAll } = require('./utils/dbSeeder');
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        fullName: 'Portfolio Administrator',
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'Admin',
        isEmailVerified: true
      });
      console.log('Seeded default Admin User: username="admin", password="password123", email="admin@example.com"');
    }
    await seedAll();
  } catch (error) {
    console.error('Error seeding default user:', error.message);
  }
};

// Serve static built files dynamically (based on build outputs)
const fs = require('fs');
const adminDistExists = fs.existsSync(path.join(__dirname, '../admin/dist'));
const frontendDistExists = fs.existsSync(path.join(__dirname, '../frontend/dist'));

if (adminDistExists) {
  // Serve admin static files at /admin path
  app.use('/admin', express.static(path.join(__dirname, '../admin/dist'), { maxAge: '1y', immutable: true }));
  
  // Route admin SPA routes to admin/index.html
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/dist', 'index.html'));
  });
}

if (frontendDistExists) {
  // Serve frontend static files at root path
  app.use(express.static(path.join(__dirname, '../frontend/dist'), { maxAge: '1y', immutable: true }));

  // Route all other pages (except API) to frontend/index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Error Handler Middleware
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Socket.io Server Setup Wrapping Express
// ---------------------------------------------------------------------------
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});
app.set('io', io);
socketUtil.setIO(io);

global.activeSocketConnections = 0;

io.on('connection', (socket) => {
  global.activeSocketConnections += 1;

  socket.on('disconnect', () => {
    global.activeSocketConnections = Math.max(0, global.activeSocketConnections - 1);
  });

  // Join room conversation
  socket.on('join_room', (room) => {
    socket.join(room);
  });

  // Handle messages relaying
  socket.on('send_message', async (data) => {
    const CommunityMessage = require('./models/CommunityMessage');
    const CommunityConversation = require('./models/CommunityConversation');
    try {
      const msg = await CommunityMessage.create({
        conversationId: data.conversationId,
        sender: data.senderId,
        text: data.text,
        mediaUrl: data.mediaUrl || '',
        mediaType: data.mediaType || 'none'
      });

      await CommunityConversation.findByIdAndUpdate(data.conversationId, { lastMessage: msg._id });

      const populated = await CommunityMessage.findById(msg._id).populate('sender', 'fullName username avatar');
      io.to(data.conversationId).emit('receive_message', populated);
    } catch (err) {
      console.error('Socket message save error:', err.message);
    }
  });

  // Handle typing statuses
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('typing_status', { senderId: data.senderId, isTyping: data.isTyping });
  });
});

// Start server listening (for Render / Local development)
if (!process.env.VERCEL) {
  connectDB()
    .then(async () => {
      // Seed default admin user
      await seedAdmin();
      
      // Seed default ecosystem configurations
      const seedEcosystem = require('./utils/seeder');
      await seedEcosystem();

      // Start Express + Socket.io Server listening
      const PORT = process.env.PORT || 5000;
      server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
        
        // Start self-ping keep-alive routine to prevent sleeping
        try {
          const startKeepAlive = require('./utils/keepAlive');
          startKeepAlive();
        } catch (err) {
          console.warn('Failed to start keep-alive routine:', err.message);
        }
      });
    })
    .catch((err) => {
      console.error('Critical Database Connection Failure: Server could not be started.', err.message);
      process.exit(1);
    });
}

// Export app for Vercel Serverless hosting
module.exports = app;
