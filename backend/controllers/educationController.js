const Education = require('../models/Education');

// @desc    Get all education records
// @route   GET /api/education
// @access  Public
const getEducation = async (req, res) => {
  try {
    const education = await Education.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: education.length, data: education });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an education record
// @route   POST /api/education
// @access  Private
const createEducation = async (req, res) => {
  try {
    const record = await Education.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an education record
// @route   PUT /api/education/:id
// @access  Private
const updateEducation = async (req, res) => {
  try {
    const record = await Education.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete an education record
// @route   DELETE /api/education/:id
// @access  Private
const deleteEducation = async (req, res) => {
  try {
    const record = await Education.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEducation, createEducation, updateEducation, deleteEducation };
