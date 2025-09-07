const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateCategory, validateObjectId } = require('../middleware/validation');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/main', categoryController.getMainCategories);
router.get('/subcategories/:parentId', validateObjectId('parentId'), categoryController.getSubcategories);
router.get('/:id', validateObjectId('id'), categoryController.getCategoryById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, validateCategory, categoryController.createCategory);
router.put('/:id', authenticateToken, requireAdmin, validateObjectId('id'), categoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId('id'), categoryController.deleteCategory);

module.exports = router;
