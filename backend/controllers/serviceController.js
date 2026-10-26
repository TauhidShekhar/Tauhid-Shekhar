const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');
const Project = require('../models/Project');

// Helper to slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all services (supports filtering, sorting, pagination, and admin scope)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { category, search, featured, status, sort, page = 1, limit = 50, scope } = req.query;

    const filter = {};

    // If not admin scope, show published (or documents without explicit draft/disabled status)
    if (scope !== 'admin') {
      filter.$or = [
        { status: 'published' },
        { status: { $exists: false } },
        { status: null }
      ];
    } else if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'All' && category !== 'undefined' && category !== 'null') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (search && search.trim() && search.trim() !== 'undefined' && search.trim() !== 'null') {
      const q = search.trim();
      filter.$or = [
        ...(filter.$or || []),
        { title: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { desc: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    let sortObj = { displayOrder: 1, createdAt: -1 };
    if (sort === 'newest') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'fastest') {
      sortObj = { 'timeline.estimatedDays': 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    let [services, total] = await Promise.all([
      Service.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'portfolioReferences.projectId',
          select: 'title image images github demo description tag tech'
        })
        .lean(),
      Service.countDocuments(filter)
    ]);

    // Ensure slugs and calculate numeric price for accurate price sorting
    const parsePriceNumber = (pStr) => {
      if (!pStr) return 0;
      const match = pStr.toString().replace(/,/g, '').match(/\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : 0;
    };

    services.forEach(s => {
      if (!s.slug && s.title) {
        s.slug = slugify(s.title);
      }
      s.numericPrice = parsePriceNumber(s.price);
    });

    if (sort === 'price-asc') {
      services.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sort === 'price-desc') {
      services.sort((a, b) => b.numericPrice - a.numericPrice);
    }

    res.json({
      success: true,
      count: services.length,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single service by slug (or title/ID fallback)
// @route   GET /api/services/slug/:slug
// @access  Public
const getServiceBySlug = async (req, res) => {
  try {
    const rawSlug = decodeURIComponent(req.params.slug || '').trim();
    if (!rawSlug) {
      return res.status(400).json({ success: false, message: 'Service identifier is required' });
    }

    const cleanedSlug = slugify(rawSlug);

    // 1. Try finding by slug (normalized or raw)
    let service = await Service.findOne({
      $or: [
        { slug: cleanedSlug },
        { slug: rawSlug.toLowerCase() },
        { slug: rawSlug }
      ]
    }).populate({
      path: 'portfolioReferences.projectId',
      select: 'title image images github demo description tag tech'
    });

    // 2. If not found, try matching by title (e.g. "mern stack web development" or "MERN Stack Web Development")
    if (!service) {
      const regexPattern = '^' + rawSlug.replace(/[-_]/g, '[ -_]') + '$';
      service = await Service.findOne({
        title: { $regex: new RegExp(regexPattern, 'i') }
      }).populate({
        path: 'portfolioReferences.projectId',
        select: 'title image images github demo description tag tech'
      });
    }

    // 3. If still not found and valid ObjectId, try finding by _id
    if (!service && /^[0-9a-fA-F]{24}$/.test(rawSlug)) {
      service = await Service.findById(rawSlug).populate({
        path: 'portfolioReferences.projectId',
        select: 'title image images github demo description tag tech'
      });
    }

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Auto-heal slug if missing on document
    if (!service.slug) {
      service.slug = slugify(service.title);
      await service.save().catch(err => console.warn('Slug auto-heal save error:', err.message));
    }

    // Fetch related services in same category
    const relatedServices = await Service.find({
      _id: { $ne: service._id },
      category: service.category,
      status: 'published'
    })
      .limit(3)
      .select('title slug shortDescription desc price iconName category');

    res.json({
      success: true,
      data: service,
      relatedServices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({
        path: 'portfolioReferences.projectId',
        select: 'title image images github demo description tag tech'
      });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Admin only)
const createService = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.slug && data.title) {
      data.slug = slugify(data.title);
    }

    // Ensure unique slug
    let existing = await Service.findOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
    }

    const service = await Service.create(data);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Admin only)
const updateService = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }

    // Check slug collision with other records
    if (data.slug) {
      const existing = await Service.findOne({ slug: data.slug, _id: { $ne: req.params.id } });
      if (existing) {
        data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const service = await Service.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    }).populate({
      path: 'portfolioReferences.projectId',
      select: 'title image images github demo description tag tech'
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Duplicate a service
// @route   POST /api/services/:id/duplicate
// @access  Private (Admin only)
const duplicateService = async (req, res) => {
  try {
    const original = await Service.findById(req.params.id).lean();
    if (!original) {
      return res.status(404).json({ success: false, message: 'Source service not found' });
    }

    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;

    original.title = `${original.title} (Copy)`;
    original.slug = `${original.slug || slugify(original.title)}-copy-${Date.now().toString().slice(-4)}`;
    original.status = 'draft';

    const duplicate = await Service.create(original);
    res.status(201).json({ success: true, data: duplicate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Categories Endpoints ───────────────────────────────────────────────

// @desc    Get all service categories
// @route   GET /api/services/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    let categories = await ServiceCategory.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    
    // If no custom categories exist in DB, seed defaults
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { name: 'Web Development', description: 'Full stack, MERN, and modern web application development.' },
        { name: 'Frontend Engineering', description: 'Interactive React.js, UI animations, and clean responsive design.' },
        { name: 'Backend & APIs', description: 'Node.js, Express, databases, and microservices architecture.' },
        { name: 'UI/UX & Graphics', description: 'Brand assets, thumbnails, Figma prototypes, and graphics.' }
      ];
      categories = await ServiceCategory.insertMany(defaultCategories);
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a service category
// @route   POST /api/services/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;
    const category = await ServiceCategory.create({
      name,
      description,
      displayOrder: displayOrder || 0
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a service category
// @route   PUT /api/services/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a service category
// @route   DELETE /api/services/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getServices,
  getServiceBySlug,
  getServiceById,
  createService,
  updateService,
  deleteService,
  duplicateService,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
