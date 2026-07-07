const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    // ── Branding ───────────────────────────────────────────────────
    siteName: { type: String, default: 'Tauhid Shekhar' },
    siteTagline: { type: String },
    logo: { url: String, publicId: String },
    favicon: { url: String, publicId: String },
    heroImage: { url: String, publicId: String },
    profilePicture: { url: String, publicId: String },

    // ── Contact ────────────────────────────────────────────────────
    email: { type: String },
    phone: { type: String },
    whatsapp: { type: String },
    address: { type: String },
    mapEmbed: { type: String },

    // ── Resume ─────────────────────────────────────────────────────
    resumeUrl: { type: String },

    // ── Social Links ───────────────────────────────────────────────
    socialLinks: {
      github: String,
      linkedin: String,
      twitter: String,
      instagram: String,
      youtube: String,
      facebook: String
    },

    // ── Content ────────────────────────────────────────────────────
    aboutContent: { type: String },
    footerText: { type: String },
    copyrightText: { type: String, default: '© 2026 Tauhid Shekhar. All Rights Reserved.' },
    legalContent: { type: String, default: "" },
    termsContent: { type: String, default: "" },
    privacyContent: { type: String, default: "" },

    // ── Hero Section ───────────────────────────────────────────────
    heroRoles: {
      type: [String],
      default: ['Full Stack Developer', 'MERN Stack Developer', 'React Developer', 'Backend Developer']
    },
    heroHeading: { type: String, default: "I'm" },
    heroDescription: { type: String },
    heroBackground: { url: String, publicId: String },
    heroCtaButtons: {
      showHireMe: { type: Boolean, default: true },
      showContactMe: { type: Boolean, default: true },
      showResume: { type: Boolean, default: true }
    },

    // ── About Section ──────────────────────────────────────────────
    aboutTitle: { type: String, default: 'About Me' },
    aboutSkillsSummary: { type: String },
    aboutStats: {
      yearsExp: { type: String, default: '2-3' },
      projects: { type: String, default: '50+' },
      clients: { type: String, default: '30+' }
    },
    coreStrengths: {
      type: [{ title: String, desc: String }],
      default: [
        { title: 'Problem Solving', desc: 'Analytical approach to complex debugging, scripting, and code structures.' },
        { title: 'Quick Learner', desc: 'Rapid adaptation to emerging web frameworks, packages, and design tools.' },
        { title: 'Team Collaboration', desc: 'Cooperative alignment in workflows, clear peer reviews, and group sprints.' },
        { title: 'Communication', desc: 'Articulate documentation, transparent project updates, and active feedback loops.' },
        { title: 'Adaptability', desc: 'Versatile adjustment to project requirements, shifting technologies, and layout specs.' }
      ]
    },
    languages: {
      type: [{ name: String, level: String }],
      default: [
        { name: 'Hindi', level: 'Native' },
        { name: 'English', level: 'Professional Working Proficiency' }
      ]
    },
    aboutPersonalInfo: {
      type: [{ label: String, value: String }],
      default: [
        { label: ' Freelance', value: 'Available' },
        { label: 'Age', value: '21' },
        { label: 'Address', value: 'Patna, Bihar, India' }
      ]
    },
    aboutContactInfo: {
      email: { type: String, default: 'shekhartauhid@gmail.com' },
      phone: { type: String, default: '+91 9142725562' },
      address: { type: String, default: 'Amritsar, Punjab, India' }
    },

    // ── Navbar Config ──────────────────────────────────────────────
    navbarConfig: {
      showResume: { type: Boolean, default: true },
      showHireMe: { type: Boolean, default: true }
    },

    // ── Theme ──────────────────────────────────────────────────────
    theme: {
      defaultMode: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark'
      },
      primaryColor: { type: String, default: '#0071e3' }
    }
  },
  { timestamps: true, optimisticConcurrency: true }
);

module.exports = mongoose.model('Setting', settingSchema);
