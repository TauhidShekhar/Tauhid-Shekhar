// Force nodemon restart trigger
const Resume = require('../models/Resume');
const Setting = require('../models/Setting');
const Hero = require('../models/Hero');
const About = require('../models/About');

// @desc    Get active/all resumes
// @route   GET /api/resume
// @access  Public
const getResumes = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const jwt = require('jsonwebtoken');
    const admins = await User.find({ role: 'Admin' }).select('_id');
    const adminIds = admins.map(a => a._id);

    let isAdminRequest = false;
    const token = req.cookies?.accessToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret_key_here');
        const reqUser = await User.findById(decoded.id || decoded.userId);
        if (reqUser && reqUser.role === 'Admin') {
          isAdminRequest = true;
        }
      } catch (err) {
        // Ignore token verify failures
      }
    }

    let query = {};
    if (isAdminRequest) {
      query = { uploadedBy: { $in: adminIds } };
    } else {
      query = { uploadedBy: { $in: adminIds }, isActive: true };
    }

    const resumes = await Resume.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload/Replace resume PDF
// @route   POST /api/resume
// @access  Private/Admin
const { analyzeAndSaveResume } = require('./atsResumeController');

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF document file is required' });
    }

    // Deactivate previous active resumes of the current admin
    await Resume.updateMany({ uploadedBy: req.user._id }, { isActive: false });

    // Run real analysis and save the resume with active status
    const resume = await analyzeAndSaveResume(req.file, req.user._id, { isActive: true });

    // 1. Sync resume URL with Settings
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = await Setting.create({ resumeUrl: resume.fileUrl });
    } else {
      settings.resumeUrl = resume.fileUrl;
      await settings.save();
    }

    // 2. Sync resume URL with Hero
    let hero = await Hero.findOne({});
    if (hero) {
      hero.resumeUrl = resume.fileUrl;
      await hero.save();
    }

    // 3. Sync resume URL with About
    let about = await About.findOne({});
    if (about) {
      about.resumeUrl = resume.fileUrl;
      await about.save();
    }

    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume file
// @route   DELETE /api/resume/:id
// @access  Private/Admin
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found' });
    }

    if (resume.publicId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      const resourceType = resume.fileType === 'pdf' ? 'image' : 'raw';
      await deleteFromCloudinary(resume.publicId, resourceType).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    await resume.deleteOne();
    res.json({ success: true, message: 'Resume record deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

const getActiveResume = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const admins = await User.find({ role: 'Admin' }).select('_id');
    const adminIds = admins.map(a => a._id);

    const activeResume = await Resume.findOne({ uploadedBy: { $in: adminIds }, isActive: true }).sort({ createdAt: -1 });
    if (!activeResume) {
      return res.status(404).json({ success: false, message: 'No active resume found' });
    }
    res.json({ success: true, data: activeResume });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResumes,
  uploadResume,
  deleteResume,
  getActiveResume
};
