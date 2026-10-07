const express = require('express');
const multer = require('multer');
const restaurantController = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(restrictTo('RESTAURANT_OWNER', 'RESTAURANT_STAFF'));

// ── Category routes ──
router.get('/categories', restaurantController.getCategories);
router.post('/categories', upload.single('image'), restaurantController.createCategory);
router.put('/categories/:id', upload.single('image'), restaurantController.updateCategory);
router.delete('/categories/:id', restaurantController.deleteCategory);

// ── Menu item routes ──
router.post('/menu', upload.single('image'), restaurantController.createMenuItem);
router.put('/menu/:id', upload.single('image'), restaurantController.updateMenuItem);
router.get('/menu', restaurantController.getMenu);
router.delete('/menu/:id', restaurantController.deleteMenuItem);
router.patch('/menu/:id/status', restaurantController.toggleMenuItemStatus);

// ── Order routes ──
router.get('/orders', restaurantController.getOrders);
router.patch('/orders/:id/status', restaurantController.updateOrderStatus);

// ── Stats routes ──
router.get('/stats', restrictTo('RESTAURANT_OWNER'), restaurantController.getStats);

// ── Profile routes ──
router.get('/profile', restrictTo('RESTAURANT_OWNER'), restaurantController.getProfile);
router.put('/profile', restrictTo('RESTAURANT_OWNER'), restaurantController.updateProfile);

module.exports = router;
