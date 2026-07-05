const Experience = require('../models/Experience');

// @desc    Get all experience records
// @route   GET /api/experience
// @access  Public
const getExperience = async (req, res) => {
  try {
    const experience = await Experience.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: experience.length, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an experience record
// @route   POST /api/experience
// @access  Private
const createExperience = async (req, res) => {
  try {
    const record = await Experience.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an experience record
// @route   PUT /api/experience/:id
// @access  Private
const updateExperience = async (req, res) => {
  try {
    const record = await Experience.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an experience record
// @route   DELETE /api/experience/:id
// @access  Private
const deleteExperience = async (req, res) => {
  try {
    const record = await Experience.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getExperience, createExperience, updateExperience, deleteExperience };
