const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Create new order
const createOrder = async (req, res, next) => {
  try {
    const { items, customerInfo } = req.body;
    const userId = req.user._id;

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive || product.isDeleted) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        productSnapshot: {
          name: product.name,
          description: product.description,
          photo: product.photos[0] || ''
        }
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      customerInfo,
      statusHistory: [{
        status: 'pending',
        changedBy: userId,
        note: 'Order created'
      }]
    });

    await order.save();

    // Clear user's cart
    await Cart.deleteOne({ user: userId });

    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'items.product', select: 'name photos' },
      { path: 'statusHistory.changedBy', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get orders (with filtering for users/admins)
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const {
      page = 1,
      limit = 10,
      status,
      fromDate,
      toDate,
      orderNumber
    } = req.query;

    // Build query
    let query = {};
    if (!isAdmin) {
      query.user = userId;
    }

    if (status) {
      query.status = status;
    }

    if (orderNumber) {
      query.orderNumber = { $regex: orderNumber, $options: 'i' };
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const orders = await Order.find(query)
      .populate([
        { path: 'user', select: 'name email phone' },
        { path: 'items.product', select: 'name photos' },
        { path: 'statusHistory.changedBy', select: 'name' }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
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

// Get single order by ID
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    let query = { _id: req.params.id };
    if (!isAdmin) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate([
        { path: 'user', select: 'name email phone' },
        { path: 'items.product', select: 'name photos description' },
        { path: 'statusHistory.changedBy', select: 'name' }
      ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason, note } = req.body;
    const adminId = req.user._id;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['preparing', 'rejected', 'cancelled'],
      preparing: ['ready_for_shipping', 'cancelled'],
      ready_for_shipping: ['shipped', 'cancelled'],
      shipped: ['received'],
      received: [],
      rejected: [],
      cancelled: []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // Handle cancellation
    if (status === 'cancelled') {
      if (!cancellationReason) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation reason is required'
        });
      }

      // Restore product stock if order was not shipped
      if (['pending', 'preparing', 'ready_for_shipping'].includes(order.status)) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } }
          );
        }
      }

      order.cancellationReason = cancellationReason;
      order.cancellationDate = new Date();
    }

    // Update order
    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: adminId,
      note: note || `Status changed to ${status}`
    });

    await order.save();

    await order.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'items.product', select: 'name photos' },
      { path: 'statusHistory.changedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get order statistics (Admin only)
const getOrderStats = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const matchCondition = {};
    if (fromDate || toDate) {
      matchCondition.createdAt = {};
      if (fromDate) matchCondition.createdAt.$gte = new Date(fromDate);
      if (toDate) matchCondition.createdAt.$lte = new Date(toDate);
    }

    const stats = await Order.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'received'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const statusCounts = await Order.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0
        },
        statusBreakdown: statusCounts
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order (User only)
const cancelOrder = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow cancellation before shipping
    if (!['pending', 'preparing', 'ready_for_shipping'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled after shipping'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    // Update order
    order.status = 'cancelled';
    order.cancellationReason = cancellationReason;
    order.cancellationDate = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      changedBy: userId,
      note: `Order cancelled by customer: ${cancellationReason}`
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  cancelOrder
};
