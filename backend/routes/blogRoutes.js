const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const { validate, blogSchema } = require('../middleware/validators');

router.route('/')
  .get(getBlogs)
  .post(requireAuth, requireAdmin, upload.single('coverImage'), validate(blogSchema), createBlog);

router.get('/:slug', getBlogBySlug);

router.route('/:id')
  .put(requireAuth, requireAdmin, upload.single('coverImage'), validate(blogSchema), updateBlog)
  .delete(requireAuth, requireAdmin, deleteBlog);

module.exports = router;
