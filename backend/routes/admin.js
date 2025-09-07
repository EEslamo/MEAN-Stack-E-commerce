const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Reports
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/products', adminController.getProductSalesReport);
router.get('/reports/users', adminController.getUserStats);
router.get('/reports/inventory', adminController.getInventoryReport);

module.exports = router;
