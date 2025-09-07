const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with filtering, sorting, and pagination
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      inStock,
      featured
    } = req.query;

    // Build query
    const query = { isDeleted: false, isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = 0;
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name parentCategory')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Add virtual fields
    const productsWithVirtuals = products.map(product => ({
      ...product,
      stockStatus: product.stock === 0 ? 'out_of_stock' : 
                   product.stock <= 3 ? 'low_stock' : 'in_stock',
      discountPercentage: product.originalPrice && product.originalPrice > product.price ?
                         Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        products: productsWithVirtuals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
      isActive: true
    }).populate('category', 'name parentCategory');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Add virtual fields
    const productWithVirtuals = {
      ...product.toObject(),
      stockStatus: product.stock === 0 ? 'out_of_stock' : 
                   product.stock <= 3 ? 'low_stock' : 'in_stock',
      discountPercentage: product.originalPrice && product.originalPrice > product.price ?
                         Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
    };

    res.json({
      success: true,
      data: productWithVirtuals
    });
  } catch (error) {
    next(error);
  }
};

// Create new product (Admin only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, originalPrice, category, stock, sku, tags, weight, dimensions, isFeatured } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Handle photos
    const photos = [];
    if (req.files) {
      photos.push(...req.files.map(file => file.filename));
    } else if (req.file) {
      photos.push(req.file.filename);
    }

    if (photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one photo is required'
      });
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      photos,
      category,
      stock: parseInt(stock),
      sku,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      weight: weight ? parseFloat(weight) : undefined,
      dimensions: dimensions ? JSON.parse(dimensions) : undefined,
      isFeatured: isFeatured === 'true'
    });

    await product.save();
    await product.populate('category', 'name parentCategory');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Update product (Admin only)
const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, originalPrice, category, stock, sku, tags, weight, dimensions, isActive, isFeatured } = req.body;

    const updateData = {
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      stock: parseInt(stock),
      sku,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      weight: weight ? parseFloat(weight) : undefined,
      dimensions: dimensions ? JSON.parse(dimensions) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      isFeatured: isFeatured === 'true'
    };

    // Handle photos
    if (req.files && req.files.length > 0) {
      updateData.photos = req.files.map(file => file.filename);
    } else if (req.file) {
      updateData.photos = [req.file.filename];
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name parentCategory');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (Admin only) - Soft delete
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get featured products
const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isDeleted: false,
      isActive: true,
      isFeatured: true,
      stock: { $gt: 0 }
    })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Get related products
const getRelatedProducts = async (req, res, next) => {
  try {
    const { limit = 4 } = req.query;
    const productId = req.params.id;

    // Get the current product to find its category
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find related products in the same category
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      category: currentProduct.category,
      isDeleted: false,
      isActive: true,
      stock: { $gt: 0 }
    })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts
};
