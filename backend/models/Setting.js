const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    // ── Branding ───────────────────────────────────────────────────
    siteName: { type: String, default: 'Tauhid Shekhar' },
    siteTagline: { type: String },
    title: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: { type: String, default: '' },
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
    workingHours: { type: String, default: 'Mon - Fri: 9:00 AM - 6:00 PM' },
    locations: {
      type: [{
        title: { type: String, required: true },
        address: { type: String, required: true },
        mapEmbed: { type: String, required: true },
        workingHours: { type: String, default: 'Mon - Fri: 9:00 AM - 6:00 PM' },
        email: { type: String },
        phone: { type: String },
        isPrimary: { type: Boolean, default: false }
      }],
      default: [
        {
          title: 'Office Location',
          address: 'Delhi, Sangam Vihar, India',
          mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108604.38204859068!2d74.80284487532353!3d31.633979268875355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4d74.87226424999999!3m2!1m2!1s0x391964aa569e7355%3A0xe021a60ccab1c0ef!2sAmritsar%2C%20Punjab!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
          workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
          email: 'shekhartauhid@gmail.com',
          phone: '+91 9142725562',
          isPrimary: true
        }
      ]
    },
    contactFormFields: {
      type: [{
        id: String,
        name: String,
        label: String,
        type: { type: String },
        required: { type: Boolean, default: false },
        placeholder: String,
        options: [String]
      }],
      default: [
        { id: '1', name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter your name' },
        { id: '2', name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter your email address' },
        { id: '3', name: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'What is this about?' },
        { id: '4', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Your message here' }
      ]
    },

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
    },

    // ── Maintenance & Status ────────────────────────────────────────
    maintenanceMode: { type: Boolean, default: false },
    websiteStatus: {
      enabled: { type: Boolean, default: true }
    },

    // ── Announcement Banner ─────────────────────────────────────────
    announcementBanner: {
      show: { type: Boolean, default: false },
      text: { type: String, default: '' },
      link: { type: String, default: '' }
    },

    // ── Cookie Notice ───────────────────────────────────────────────
    cookieSettings: {
      show: { type: Boolean, default: true },
      text: { type: String, default: 'We use cookies to improve your user experience.' }
    },

    // ── Email Notifications ─────────────────────────────────────────
    emailNotifications: {
      orderRecipient: { type: String, default: 'shekhartauhid@gmail.com' },
      inquiryRecipient: { type: String, default: 'shekhartauhid@gmail.com' },
      contactRecipient: { type: String, default: 'shekhartauhid@gmail.com' },
      senderName: { type: String, default: 'Tauhid Shekhar' },
      enabled: { type: Boolean, default: true }
    },

    // ── Scripts ─────────────────────────────────────────────────────
    customFooterScripts: { type: String }
  },
  { timestamps: true, optimisticConcurrency: true }
);

module.exports = mongoose.model('Setting', settingSchema);
