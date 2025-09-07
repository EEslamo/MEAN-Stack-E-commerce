const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Testimonial = require('../models/Testimonial');
const Contact = require('../models/Contact');

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Get unseen testimonials count
    const unseenTestimonials = await Testimonial.countDocuments({ isSeen: false });

    // Get total products count
    const totalProducts = await Product.countDocuments({ isDeleted: false });

    // Get total users count
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Get recent pending orders
    const recentOrders = await Order.find({ status: 'pending' })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending testimonials
    const pendingTestimonials = await Testimonial.find({ isSeen: false })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent contacts
    const recentContacts = await Contact.find({ isResolved: false })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get sales statistics for current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $nin: ['cancelled', 'rejected'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get low stock products
    const lowStockProducts = await Product.find({
      stock: { $lte: 3, $gt: 0 },
      isDeleted: false,
      isActive: true
    }).select('name stock').limit(5);

    // Get out of stock products
    const outOfStockProducts = await Product.find({
      stock: 0,
      isDeleted: false,
      isActive: true
    }).select('name').limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          pendingOrders,
          unseenTestimonials,
          totalProducts,
          totalUsers,
          monthlyOrders: monthlyStats[0]?.totalOrders || 0,
          monthlyRevenue: monthlyStats[0]?.totalRevenue || 0
        },
        recentOrders,
        pendingTestimonials,
        recentContacts,
        lowStockProducts,
        outOfStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get sales report
const getSalesReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, groupBy = 'day' } = req.query;

    const matchCondition = {
      status: { $nin: ['cancelled', 'rejected'] }
    };

    if (fromDate || toDate) {
      matchCondition.createdAt = {};
      if (fromDate) matchCondition.createdAt.$gte = new Date(fromDate);
      if (toDate) matchCondition.createdAt.$lte = new Date(toDate);
    }

    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'day':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'year':
        groupFormat = {
          year: { $year: '$createdAt' }
        };
        break;
      default:
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const salesData = await Order.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupFormat,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    next(error);
  }
};

// Get product sales report
const getProductSalesReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, limit = 20 } = req.query;

    const matchCondition = {
      status: { $nin: ['cancelled', 'rejected'] }
    };

    if (fromDate || toDate) {
      matchCondition.createdAt = {};
      if (fromDate) matchCondition.createdAt.$gte = new Date(fromDate);
      if (toDate) matchCondition.createdAt.$lte = new Date(toDate);
    }

    const productSales = await Order.aggregate([
      { $match: matchCondition },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          productId: '$_id',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          averagePrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: productSales
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
const getUserStats = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const matchCondition = {};
    if (fromDate || toDate) {
      matchCondition.createdAt = {};
      if (fromDate) matchCondition.createdAt.$gte = new Date(fromDate);
      if (toDate) matchCondition.createdAt.$lte = new Date(toDate);
    }

    const userStats = await User.aggregate([
      { $match: { ...matchCondition, role: 'user' } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      }
    ]);

    // Get users with most orders
    const topUsers = await Order.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userName: '$user.name',
          userEmail: '$user.email',
          orderCount: 1,
          totalSpent: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary: userStats[0] || { totalUsers: 0, activeUsers: 0 },
        topUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory report
const getInventoryReport = async (req, res, next) => {
  try {
    const { lowStock = 5 } = req.query;

    const inventoryStats = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          totalStock: { $sum: '$stock' },
          outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', parseInt(lowStock)] }] }, 1, 0] } }
        }
      }
    ]);

    const lowStockProducts = await Product.find({
      stock: { $lte: parseInt(lowStock), $gt: 0 },
      isDeleted: false,
      isActive: true
    }).select('name stock category').populate('category', 'name').sort({ stock: 1 });

    const outOfStockProducts = await Product.find({
      stock: 0,
      isDeleted: false,
      isActive: true
    }).select('name category').populate('category', 'name');

    res.json({
      success: true,
      data: {
        summary: inventoryStats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          totalStock: 0,
          outOfStock: 0,
          lowStock: 0
        },
        lowStockProducts,
        outOfStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getSalesReport,
  getProductSalesReport,
  getUserStats,
  getInventoryReport
};
