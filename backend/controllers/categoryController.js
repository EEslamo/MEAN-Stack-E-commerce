const Category = require('../models/Category');

// Get all categories
const getCategories = async (req, res, next) => {
  try {
    const { includeInactive = false } = req.query;
    
    const query = { isDeleted: false };
    if (!includeInactive) {
      query.isActive = true;
    }

    const categories = await Category.find(query)
      .populate('parentCategory', 'name')
      .sort({ sortOrder: 1, name: 1 });

    // Organize categories into tree structure
    const categoryTree = buildCategoryTree(categories);

    res.json({
      success: true,
      data: categoryTree
    });
  } catch (error) {
    next(error);
  }
};

// Get single category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('parentCategory', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Create new category (Admin only)
const createCategory = async (req, res, next) => {
  try {
    const { name, parentCategory, description, sortOrder } = req.body;

    // Validate parent category if provided
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const category = new Category({
      name,
      parentCategory: parentCategory || null,
      description,
      sortOrder: sortOrder || 0
    });

    await category.save();
    await category.populate('parentCategory', 'name');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Update category (Admin only)
const updateCategory = async (req, res, next) => {
  try {
    const { name, parentCategory, description, isActive, sortOrder } = req.body;

    // Validate parent category if provided
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }

      // Prevent setting self as parent
      if (parentCategory === req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }
    }

    const updateData = {
      name,
      parentCategory: parentCategory || null,
      description,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0
    };

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (Admin only) - Soft delete
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    // Check if category has subcategories
    const subcategories = await Category.find({ parentCategory: categoryId, isDeleted: false });
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories'
      });
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { isDeleted: true },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get main categories (categories without parent)
const getMainCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      parentCategory: null,
      isDeleted: false,
      isActive: true
    }).sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Get subcategories by parent category
const getSubcategories = async (req, res, next) => {
  try {
    const parentId = req.params.parentId;

    const subcategories = await Category.find({
      parentCategory: parentId,
      isDeleted: false,
      isActive: true
    }).sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to build category tree
const buildCategoryTree = (categories, parentId = null) => {
  return categories
    .filter(category => {
      if (parentId === null) {
        return !category.parentCategory;
      }
      return category.parentCategory && category.parentCategory.toString() === parentId.toString();
    })
    .map(category => ({
      ...category.toObject(),
      children: buildCategoryTree(categories, category._id)
    }));
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getMainCategories,
  getSubcategories
};
