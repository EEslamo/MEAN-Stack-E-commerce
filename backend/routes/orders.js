const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateOrder, validateObjectId, validatePagination } = require('../middleware/validation');

// User routes
router.post('/', authenticateToken, validateOrder, orderController.createOrder);
router.get('/', authenticateToken, validatePagination, orderController.getOrders);
router.get('/:id', authenticateToken, validateObjectId('id'), orderController.getOrderById);
router.put('/:id/cancel', authenticateToken, validateObjectId('id'), orderController.cancelOrder);

// Admin routes
router.put('/:id/status', authenticateToken, requireAdmin, validateObjectId('id'), orderController.updateOrderStatus);
router.get('/admin/stats', authenticateToken, requireAdmin, orderController.getOrderStats);

module.exports = router;
