const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Tauhid Shekhar' },
    heroHeading: { type: String, default: "Hi, I'm" },
    heroDescription: { 
      type: String, 
      default: 'Results-oriented Full Stack Web Developer with practical experience in building responsive web applications using HTML5, CSS3, JavaScript, React.js, Node.js, Express.js, MongoDB, and MySQL.' 
    },
    heroImage: {
      url: { type: String, default: 'assits/Profile_Pic.png' },
      publicId: { type: String, default: '' }
    },
    heroBackground: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    heroRoles: {
      type: [String],
      default: ['Full Stack Developer', 'MERN Stack Developer', 'React Developer', 'Backend Developer']
    },
    resumeUrl: { type: String, default: 'assits/Resume-file.pdf' },
    socialLinks: {
      github: { type: String, default: 'https://github.com/TauhidShekhar' },
      linkedin: { type: String, default: 'https://www.linkedin.com/in/tauhidshekhar/' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      facebook: { type: String, default: '' }
    },
    heroCtaButtons: {
      showHireMe: { type: Boolean, default: true },
      showContactMe: { type: Boolean, default: true },
      showResume: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hero', heroSchema);
