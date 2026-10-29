const express = require('express');
const router = express.Router();
const { 
  getProjects, 
  getProjectBySlugOrId,
  createProject, 
  updateProject, 
  deleteProject,
  addProjectComment,
  deleteProjectComment,
  reorderProjects
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProjects)
  .post(protect, createProject);

router.post('/reorder', protect, reorderProjects);

router.get('/:slugOrId', getProjectBySlugOrId);

router.route('/:id')
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/comments')
  .post(protect, addProjectComment);

router.route('/:id/comments/:commentId')
  .delete(protect, deleteProjectComment);

module.exports = router;
