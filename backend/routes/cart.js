const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateCartItem, validateObjectId } = require('../middleware/validation');

// Public routes (with optional auth for guest users)
router.get('/', optionalAuth, cartController.getCart);
router.post('/add', optionalAuth, validateCartItem, cartController.addToCart);
router.put('/:productId', optionalAuth, validateObjectId('productId'), cartController.updateCartItem);
router.delete('/:productId', optionalAuth, validateObjectId('productId'), cartController.removeFromCart);
router.delete('/', optionalAuth, cartController.clearCart);

// Authenticated routes
router.post('/merge', authenticateToken, cartController.mergeCart);

module.exports = router;
