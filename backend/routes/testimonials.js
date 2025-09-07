const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateTestimonial, validateObjectId, validatePagination } = require('../middleware/validation');

// Public routes
router.get('/', validatePagination, testimonialController.getTestimonials);

// User routes
router.post('/', authenticateToken, validateTestimonial, testimonialController.createTestimonial);
router.get('/my', authenticateToken, testimonialController.getUserTestimonial);
router.put('/my', authenticateToken, validateTestimonial, testimonialController.updateTestimonial);
router.delete('/my', authenticateToken, testimonialController.deleteTestimonial);

// Admin routes
router.get('/admin/pending', authenticateToken, requireAdmin, validatePagination, testimonialController.getPendingTestimonials);
router.put('/admin/:id', authenticateToken, requireAdmin, validateObjectId('id'), testimonialController.updateTestimonialStatus);
router.delete('/admin/:id', authenticateToken, requireAdmin, validateObjectId('id'), testimonialController.deleteTestimonialAdmin);
router.get('/admin/stats', authenticateToken, requireAdmin, testimonialController.getTestimonialStats);

module.exports = router;
