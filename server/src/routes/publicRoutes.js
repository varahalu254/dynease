const express = require('express');
const publicController = require('../controllers/publicController');
const rateLimit = require('express-rate-limit');
const { checkSubscription } = require('../middlewares/subscriptionMiddleware');

const router = express.Router();

// Strict rate limit for order creation (anti-spam)
const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: { success: false, message: 'Too many orders placed. Please wait a moment.' }
});

// QR resolution (QR code itself should resolve, but ordering/menu access might be blocked)
router.get('/qr/:qrToken', publicController.getTableByQR);
router.get('/table/:tableNumber', publicController.getTableByNumber);

// Menu (subdomain-based) - check subscription
router.get('/menu', checkSubscription, publicController.getMenu);

// Legacy: menu by slug - check subscription
router.get('/restaurant/:slug/menu', checkSubscription, publicController.getRestaurantMenu);

// Orders - check subscription
router.post('/orders', orderLimiter, checkSubscription, publicController.createOrder);

// Allow fetching an existing order even if expired, since customers may need to see their bill
router.get('/orders/:orderId', publicController.getOrder);

module.exports = router;
