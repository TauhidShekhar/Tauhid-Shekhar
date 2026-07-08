// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

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

const app = express();

// Enable GZIP compression to reduce payload transfer sizes
app.use(compression());

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cache-Control', 'Pragma']
}));
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Disable caching for all API responses to ensure fresh DB sync on every request
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
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

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', messageRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/cms', cmsRoutes);

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
  app.use('/admin', express.static(path.join(__dirname, '../admin/dist')));
  
  // Route admin SPA routes to admin/index.html
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/dist', 'index.html'));
  });
}

if (frontendDistExists) {
  // Serve frontend static files at root path
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

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

io.on('connection', (socket) => {
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
      });
    })
    .catch((err) => {
      console.error('Critical Database Connection Failure: Server could not be started.', err.message);
      process.exit(1);
    });
}

// Export app for Vercel Serverless hosting
module.exports = app;
