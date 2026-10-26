const Service = require('../models/Service');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const defaultPackagesMap = {
  'mern': [
    {
      name: 'Basic',
      price: '$149',
      description: 'Single-page or small business MERN stack app with base CRUD & responsive UI.',
      deliveryDays: 7,
      revisions: '3 Revisions',
      features: ['React 19 + Tailwind CSS Frontend', 'Node.js/Express REST API', 'MongoDB Schema Modeling', 'Basic JWT Authentication'],
      isPopular: false
    },
    {
      name: 'Standard',
      price: '$299',
      description: 'Full-featured full stack application with role-based auth, admin dashboard, and cloud storage.',
      deliveryDays: 14,
      revisions: 'Unlimited',
      features: ['Full Stack MERN Architecture', 'Admin Dashboard & Role Guards', 'Cloudinary Asset Uploads', 'Socket.IO Real-time Events', 'Email Notifications & Error Handling'],
      isPopular: true
    },
    {
      name: 'Premium',
      price: '$549',
      description: 'Enterprise grade SaaS/E-commerce platform with automated tests, CI/CD, and scaling architecture.',
      deliveryDays: 21,
      revisions: 'Unlimited',
      features: ['High-Performance Server Architecture', 'Stripe / Payment Gateway Integration', 'Advanced Security & Rate Limiting', 'Full SEO & Performance Audit', '30-Day Post-Launch Technical Support'],
      isPopular: false
    }
  ],
  'frontend': [
    {
      name: 'Basic',
      price: '$99',
      description: 'Pixel-perfect conversion of Figma/Adobe design to interactive React components.',
      deliveryDays: 5,
      revisions: '2 Revisions',
      features: ['Responsive React Components', 'Tailwind CSS Layout', 'Cross-browser Verification'],
      isPopular: false
    },
    {
      name: 'Standard',
      price: '$199',
      description: 'Complete multi-page responsive web app with Apple-style smooth animations.',
      deliveryDays: 8,
      revisions: 'Unlimited',
      features: ['Framer Motion Animations', 'Dark & Light Theme Mode', 'API State Hooks Integration', 'Speed & Accessibility Optimization'],
      isPopular: true
    },
    {
      name: 'Premium',
      price: '$349',
      description: 'Complex dashboard or dynamic web application with advanced interactive charts and custom widgets.',
      deliveryDays: 12,
      revisions: 'Unlimited',
      features: ['Dynamic Data Visualizations', 'PWA & Offline Caching', 'Micro-interactions & Sound UI', 'Full Design System & Component Library'],
      isPopular: false
    }
  ],
  'rest': [
    {
      name: 'Basic',
      price: '$79',
      description: 'Clean REST endpoints for CRUD operations with data validation and error handling.',
      deliveryDays: 4,
      revisions: '2 Revisions',
      features: ['Express.js Routing', 'Mongoose / MySQL Models', 'Request Payload Validation'],
      isPopular: false
    },
    {
      name: 'Standard',
      price: '$169',
      description: 'Complete backend server with JWT auth, password encryption, rate limiting, and email dispatch.',
      deliveryDays: 7,
      revisions: 'Unlimited',
      features: ['JWT Auth & Refresh Rotation', 'Email Queue & Verification', 'File Upload Pipeline', 'Database Connection Resilience'],
      isPopular: true
    },
    {
      name: 'Premium',
      price: '$319',
      description: 'Microservices or high-throughput API with caching, webhooks, and third-party integrations.',
      deliveryDays: 14,
      revisions: 'Unlimited',
      features: ['Redis / Memory Cache Layer', 'Webhook & Third-party Integrations', 'Swagger / OpenAPI Documentation', 'Automated Health Check & Monitoring'],
      isPopular: false
    }
  ],
  'thumbnail': [
    {
      name: 'Basic',
      price: '$15',
      description: 'Single high-CTR custom YouTube thumbnail or banner.',
      deliveryDays: 1,
      revisions: '2 Revisions',
      features: ['High-Resolution 1080p Export', 'Click-Through Rate Optimized', 'Photoshop Source PSD'],
      isPopular: false
    },
    {
      name: 'Standard',
      price: '$45',
      description: 'Bundle of 3 high-converting thumbnails with A/B variant concepts.',
      deliveryDays: 2,
      revisions: 'Unlimited',
      features: ['3 Premium Custom Thumbnails', 'A/B Testing Variants', 'Custom Typography & Color Grading', 'Fast 24-48h Delivery'],
      isPopular: true
    },
    {
      name: 'Premium',
      price: '$99',
      description: 'Full channel branding kit (Banner, Avatar, 7 Thumbnails, and Story graphics).',
      deliveryDays: 5,
      revisions: 'Unlimited',
      features: ['7 Custom YouTube Thumbnails', 'Matching Channel Banner & Logo', 'Social Media Story Assets', 'Unlimited Concept Revisions'],
      isPopular: false
    }
  ]
};

const reconcileServices = async () => {
  try {
    const services = await Service.find({});
    if (!services || services.length === 0) return;

    for (const svc of services) {
      let needsSave = false;
      const generatedSlug = slugify(svc.title);

      if (!svc.slug) {
        svc.slug = generatedSlug;
        needsSave = true;
      }
      if (!svc.status) {
        svc.status = 'published';
        needsSave = true;
      }
      if (!svc.shortDescription && svc.desc) {
        svc.shortDescription = svc.desc;
        needsSave = true;
      }
      if (!svc.fullDescription && svc.desc) {
        svc.fullDescription = svc.desc;
        needsSave = true;
      }
      if (svc.showPortfolioReferences === undefined) {
        svc.showPortfolioReferences = true;
        needsSave = true;
      }

      // Check packages
      if (!svc.packages || svc.packages.length === 0) {
        const titleLower = svc.title.toLowerCase();
        let key = 'mern';
        if (titleLower.includes('frontend')) key = 'frontend';
        else if (titleLower.includes('rest') || titleLower.includes('backend')) key = 'rest';
        else if (titleLower.includes('thumbnail') || titleLower.includes('graphic')) key = 'thumbnail';
        svc.packages = defaultPackagesMap[key] || defaultPackagesMap['mern'];
        needsSave = true;
      }

      // Check deliverables
      if (!svc.deliverables || svc.deliverables.length === 0) {
        svc.deliverables = (svc.features || []).map(f => ({
          title: f,
          description: 'Delivered to complete technical specifications with verification.'
        }));
        needsSave = true;
      }

      // Check timeline
      if (!svc.timeline || !svc.timeline.estimatedDays) {
        svc.timeline = {
          estimatedDays: 7,
          revisionsIncluded: 'Unlimited',
          clientDependencies: ['Design wireframes or project brief', 'API keys / credentials', 'Milestone review feedback'],
          milestones: [
            { step: 1, title: 'Discovery & System Design', duration: '1-2 Days', description: 'Reviewing specs and wireframes.' },
            { step: 2, title: 'Core Implementation', duration: '3-4 Days', description: 'Developing features and REST APIs.' },
            { step: 3, title: 'Testing & Production Deployment', duration: '1-2 Days', description: 'Quality assurance and deployment.' }
          ]
        };
        needsSave = true;
      }

      if (needsSave) {
        await svc.save();
      }
    }
  } catch (err) {
    console.warn('[ServiceReconciler] Background reconciliation error:', err.message);
  }
};

module.exports = { reconcileServices };
