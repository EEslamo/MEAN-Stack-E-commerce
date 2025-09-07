const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateContact, validateObjectId, validatePagination } = require('../middleware/validation');

// Public routes
router.post('/', validateContact, contactController.submitContact);

// Admin routes
router.get('/', authenticateToken, requireAdmin, validatePagination, contactController.getContacts);
router.get('/:id', authenticateToken, requireAdmin, validateObjectId('id'), contactController.getContactById);
router.put('/:id', authenticateToken, requireAdmin, validateObjectId('id'), contactController.updateContactStatus);
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId('id'), contactController.deleteContact);
router.get('/admin/stats', authenticateToken, requireAdmin, contactController.getContactStats);

module.exports = router;
