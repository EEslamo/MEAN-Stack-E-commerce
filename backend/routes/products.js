const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateProduct, validateObjectId, validatePagination } = require('../middleware/validation');
const upload = require('../config/upload');

// Public routes
router.get('/', validatePagination, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', validateObjectId('id'), productController.getProductById);
router.get('/:id/related', validateObjectId('id'), productController.getRelatedProducts);

// Admin routes
router.post('/', authenticateToken, requireAdmin, upload.array('photos', 5), validateProduct, productController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, validateObjectId('id'), upload.array('photos', 5), productController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId('id'), productController.deleteProduct);

module.exports = router;
