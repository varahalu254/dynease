const express = require('express');
const publicController = require('../controllers/publicController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Strict rate limit for order creation (anti-spam)
const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: { success: false, message: 'Too many orders placed. Please wait a moment.' }
});

// QR resolution
router.get('/qr/:qrToken', publicController.getTableByQR);
router.get('/table/:tableNumber', publicController.getTableByNumber);

// Menu (subdomain-based)
router.get('/menu', publicController.getMenu);

// Legacy: menu by slug (used by SubdomainWrapper validation)
router.get('/restaurant/:slug/menu', publicController.getRestaurantMenu);

// Orders
router.post('/orders', orderLimiter, publicController.createOrder);
router.get('/orders/:orderId', publicController.getOrder);

module.exports = router;
