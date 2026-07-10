const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema(
  {
    siteName: { type: String },
    siteUrl: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    author: { type: String },

    // ── Assets ──────────────────────────────────────────────────────
    favicon: {
      url: String,
      publicId: String
    },
    logo: {
      url: String,
      publicId: String
    },

    // ── Open Graph ─────────────────────────────────────────────────
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: {
      url: String,
      publicId: String
    },

    // ── Twitter Card ───────────────────────────────────────────────
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image'],
      default: 'summary_large_image'
    },

    // ── Analytics & Search Console ─────────────────────────────────
    googleAnalyticsId: { type: String },
    googleSearchConsoleId: { type: String },
    microsoftClarityId: { type: String },
    facebookPixel: { type: String },

    // ── Crawling ───────────────────────────────────────────────────
    robotsTxt: {
      type: String,
      default: 'User-agent: *\nAllow: /\nSitemap: https://tauhidshekhar.vercel.app/sitemap.xml'
    },

    // ── Structured Data / JSON-LD ─────────────────────────────────
    schemaSettings: {
      type: String,
      default: '{}'
    },

    // ── Custom Scripts ─────────────────────────────────────────────
    customHeadScripts: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SEO', seoSchema);
