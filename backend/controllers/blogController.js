const Blog = require('../models/Blog');

// Helper to generate unique slugs
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

// @desc    Get all blogs (public with status=published, admin with all)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const { status, category, tag, page = 1, limit = 10 } = req.query;
    const query = {};

    // If public check, force status = published
    if (!req.user || req.user.role !== 'Admin') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const count = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate('author', 'fullName username avatar')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res, next) => {
  try {
    const query = { slug: req.params.slug };
    if (!req.user || req.user.role !== 'Admin') {
      query.status = 'published';
    }

    const blog = await Blog.findOne(query).populate('author', 'fullName username avatar');
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save({ validateBeforeSave: false });

    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a blog post
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, status, metaTitle, metaDescription } = req.body;
    
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let coverImage = {};
    if (req.file) {
      const { uploadToCloudinary } = require('../middleware/upload');
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'blogs');
      coverImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      author: req.user._id,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      status,
      publishedAt: status === 'published' ? new Date() : null,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const updates = { ...req.body };
    
    if (updates.title && updates.title !== blog.title) {
      let baseSlug = slugify(updates.title);
      let slug = baseSlug;
      let counter = 1;
      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updates.slug = slug;
    }

    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (updates.status === 'published' && blog.status !== 'published') {
      updates.publishedAt = new Date();
    }

    if (req.file) {
      const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');
      
      // Delete old cover image if exists
      if (blog.coverImage && blog.coverImage.publicId) {
        await deleteFromCloudinary(blog.coverImage.publicId).catch(err => console.error('Cloudinary delete error:', err.message));
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, 'blogs');
      updates.coverImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: updatedBlog });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Delete image from Cloudinary
    if (blog.coverImage && blog.coverImage.publicId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      await deleteFromCloudinary(blog.coverImage.publicId).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    await blog.deleteOne();
    res.json({ success: true, message: 'Blog post deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};
