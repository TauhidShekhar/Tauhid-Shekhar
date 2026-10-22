const FormCategory = require('../models/FormCategory');
const Form = require('../models/Form');

// @desc    Get all categories (public gets active, admin gets all with formCount)
// @route   GET /api/forms/categories
// @access  Public / Admin
exports.getCategories = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'Admin';
    const filter = {};

    if (!isAdmin) {
      filter.isActive = true;
      filter.isArchived = false;
    }

    const categories = await FormCategory.find(filter).sort({ order: 1, name: 1 });

    // Calculate live form count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Form.countDocuments({
          $or: [
            { categoryId: cat._id },
            { category: cat.name }
          ],
          ...(isAdmin ? {} : { status: 'Published', isSubmissionsEnabled: true })
        });
        const obj = cat.toObject();
        obj.formCount = count;
        return obj;
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new form category
// @route   POST /api/forms/categories
// @access  Private (Admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, color, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return res.status(400).json({ success: false, message: 'A valid category slug is required.' });
    }

    const existingName = await FormCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: `Category with name "${name.trim()}" already exists.`
      });
    }

    const existingSlug = await FormCategory.findOne({ slug: cleanSlug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: `Category with slug "${cleanSlug}" already exists.`
      });
    }

    const maxOrderCat = await FormCategory.findOne().sort({ order: -1 });
    const nextOrder = maxOrderCat ? (maxOrderCat.order || 0) + 1 : 1;

    const newCategory = await FormCategory.create({
      name: name.trim(),
      slug: cleanSlug,
      description: description ? description.trim() : '',
      icon: icon || 'folder',
      color: color || '#C2272D',
      isActive: isActive !== false,
      order: nextOrder
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: newCategory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update form category
// @route   PUT /api/forms/categories/:id
// @access  Private (Admin only)
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, color, isActive } = req.body;

    const category = await FormCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const oldName = category.name;

    if (name && name.trim() && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const existingName = await FormCategory.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: `Category with name "${name.trim()}" already exists.`
        });
      }
      category.name = name.trim();
    }

    if (slug && slug.trim() && slug.trim().toLowerCase() !== category.slug) {
      const cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existingSlug = await FormCategory.findOne({
        _id: { $ne: id },
        slug: cleanSlug
      });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: `Category with slug "${cleanSlug}" already exists.`
        });
      }
      category.slug = cleanSlug;
    }

    if (description !== undefined) category.description = description.trim();
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    // If category name was updated, update associated forms so they stay consistent
    if (name && name.trim() !== oldName) {
      await Form.updateMany(
        { $or: [{ categoryId: category._id }, { category: oldName }] },
        { $set: { category: category.name, categoryId: category._id } }
      );
    }

    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle category active status
// @route   PUT /api/forms/categories/:id/toggle-active
// @access  Private (Admin only)
exports.toggleCategoryActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await FormCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category with safe reassignment
// @route   DELETE /api/forms/categories/:id
// @access  Private (Admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reassignToCategoryId } = req.body;

    const category = await FormCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const assignedFormsCount = await Form.countDocuments({
      $or: [{ categoryId: category._id }, { category: category.name }]
    });

    if (assignedFormsCount > 0) {
      if (reassignToCategoryId) {
        const targetCategory = await FormCategory.findById(reassignToCategoryId);
        if (!targetCategory) {
          return res.status(400).json({ success: false, message: 'Target reassignment category not found.' });
        }
        await Form.updateMany(
          { $or: [{ categoryId: category._id }, { category: category.name }] },
          { $set: { categoryId: targetCategory._id, category: targetCategory.name } }
        );
      } else {
        // Fallback: Reassign to 'General' category or default
        let defaultCat = await FormCategory.findOne({ name: 'General' });
        if (!defaultCat) {
          defaultCat = await FormCategory.create({
            name: 'General',
            slug: 'general',
            description: 'General forms and inquiries'
          });
        }
        await Form.updateMany(
          { $or: [{ categoryId: category._id }, { category: category.name }] },
          { $set: { categoryId: defaultCat._id, category: defaultCat.name } }
        );
      }
    }

    await FormCategory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Category "${category.name}" removed safely. Associated forms were reassigned.`
    });
  } catch (error) {
    next(error);
  }
};
