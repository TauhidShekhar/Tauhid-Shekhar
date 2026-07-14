const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const Hero = require('../models/Hero');
const About = require('../models/About');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Service = require('../models/Service');
const Resume = require('../models/Resume');
const Education = require('../models/Education');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Get consolidated portfolio data (cached for 1 hour)
router.get('/all', cacheMiddleware('portfolio_all'), async (req, res, next) => {
  try {
    const [
      settings,
      hero,
      about,
      skills,
      projects,
      experiences,
      services,
      education,
      certificates,
      achievements,
      admins
    ] = await Promise.all([
      Setting.findOne({}),
      Hero.findOne({}),
      About.findOne({}),
      Skill.find({}).sort({ displayOrder: 1 }),
      Project.find({}).sort({ displayOrder: 1, createdAt: -1 }),
      Experience.find({}).sort({ createdAt: -1 }),
      Service.find({}).sort({ displayOrder: 1, createdAt: -1 }),
      Education.find({}).sort({ createdAt: -1 }),
      Certificate.find({}).sort({ displayOrder: 1, date: -1 }),
      Achievement.find({}).sort({ displayOrder: 1, date: -1 }),
      User.find({ role: 'Admin' }).select('_id')
    ]);

    // Handle initial document seeds if empty
    let finalSettings = settings;
    if (!finalSettings) {
      finalSettings = await Setting.create({});
    }

    let finalHero = hero;
    if (!finalHero) {
      finalHero = await Hero.create({});
    }

    let finalAbout = about;
    if (!finalAbout) {
      finalAbout = await About.create({});
    }

    const adminIds = admins.map(a => a._id);
    const activeResume = await Resume.findOne({ uploadedBy: { $in: adminIds }, isActive: true }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        settings: finalSettings,
        hero: finalHero,
        about: finalAbout,
        skills,
        projects,
        experiences,
        services,
        activeResume,
        education,
        certificates,
        achievements
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
