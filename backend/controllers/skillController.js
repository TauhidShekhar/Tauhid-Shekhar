const Skill = require('../models/Skill');

// Helper to adjust display orders sequentially and prevent duplicates/gaps
const adjustDisplayOrders = async (Model, currentId, targetOrder) => {
  const items = await Model.find({}).sort({ displayOrder: 1, createdAt: -1 });
  const otherItems = items.filter(item => item._id.toString() !== currentId?.toString());
  const currentItem = items.find(item => item._id.toString() === currentId?.toString());
  
  if (!currentItem) return;
  
  const targetIndex = Math.max(0, Math.min(otherItems.length, targetOrder - 1));
  otherItems.splice(targetIndex, 0, currentItem);
  
  const bulkOps = otherItems.map((item, index) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: { displayOrder: index + 1 } }
    }
  }));
  
  if (bulkOps.length > 0) {
    await Model.bulkWrite(bulkOps);
  }
};

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({}).sort({ displayOrder: 1 });
    res.json({ success: true, count: skills.length, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a skill
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res) => {
  try {
    const count = await Skill.countDocuments();
    const targetOrder = req.body.displayOrder || (count + 1);
    const skill = await Skill.create({ ...req.body, displayOrder: targetOrder });
    await adjustDisplayOrders(Skill, skill._id, targetOrder);
    
    const updatedSkill = await Skill.findById(skill._id);
    res.status(201).json({ success: true, data: updatedSkill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = async (req, res) => {
  try {
    const oldSkill = await Skill.findById(req.params.id);
    if (!oldSkill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const newOrder = req.body.displayOrder;
    if (newOrder !== undefined && newOrder !== oldSkill.displayOrder) {
      await adjustDisplayOrders(Skill, skill._id, newOrder);
    }

    const updatedSkill = await Skill.findById(req.params.id);
    res.json({ success: true, data: updatedSkill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    // Clean up gaps and re-sequence remaining skills
    const remainingSkills = await Skill.find({}).sort({ displayOrder: 1, createdAt: -1 });
    const bulkOps = remainingSkills.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { displayOrder: index + 1 } }
      }
    }));
    if (bulkOps.length > 0) {
      await Skill.bulkWrite(bulkOps);
    }

    res.json({ success: true, message: 'Skill deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk reorder skills
// @route   POST /api/skills/reorder
// @access  Private
const reorderSkills = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: orders array required' });
    }
    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } }
      }
    }));
    await Skill.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Skills reordered successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill, reorderSkills };
