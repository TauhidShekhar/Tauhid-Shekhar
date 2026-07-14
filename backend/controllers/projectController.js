const Project = require('../models/Project');

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

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean();
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const count = await Project.countDocuments();
    const targetOrder = req.body.displayOrder || (count + 1);
    const project = await Project.create({ ...req.body, displayOrder: targetOrder });
    await adjustDisplayOrders(Project, project._id, targetOrder);
    
    const updatedProject = await Project.findById(project._id);
    res.status(201).json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const oldProject = await Project.findById(req.params.id);
    if (!oldProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const newOrder = req.body.displayOrder;
    if (newOrder !== undefined && newOrder !== oldProject.displayOrder) {
      await adjustDisplayOrders(Project, project._id, newOrder);
    }

    const updatedProject = await Project.findById(req.params.id);
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Clean up gaps and re-sequence remaining projects
    const remainingProjects = await Project.find({}).sort({ displayOrder: 1, createdAt: -1 });
    const bulkOps = remainingProjects.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { displayOrder: index + 1 } }
      }
    }));
    if (bulkOps.length > 0) {
      await Project.bulkWrite(bulkOps);
    }

    res.json({ success: true, message: 'Project deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
const addProjectComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.comments = project.comments || [];
    project.comments.push({
      userId: req.user._id,
      userName: req.user.fullName,
      userAvatar: req.user.avatar?.url || '',
      content: content.trim()
    });

    await project.save();
    res.status(201).json({ success: true, data: project.comments, message: 'Comment posted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment from project
// @route   DELETE /api/projects/:id/comments/:commentId
// @access  Private
const deleteProjectComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const comment = project.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Author or admin check
    if (comment.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    comment.deleteOne();
    await project.save();
    res.json({ success: true, data: project.comments, message: 'Comment deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk reorder projects
// @route   POST /api/projects/reorder
// @access  Private
const reorderProjects = async (req, res) => {
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
    await Project.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Projects reordered successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  addProjectComment, 
  deleteProjectComment,
  reorderProjects
};
