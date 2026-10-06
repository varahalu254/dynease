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
router.post('/categories', restaurantController.createCategory);
router.put('/categories/:id', restaurantController.updateCategory);
router.delete('/categories/:id', restaurantController.deleteCategory);

// ── Menu item routes ──
router.post('/menu', upload.single('image'), restaurantController.createMenuItem);
router.get('/menu', restaurantController.getMenu);
router.delete('/menu/:id', restaurantController.deleteMenuItem);
router.patch('/menu/:id/status', restaurantController.toggleMenuItemStatus);

module.exports = router;
