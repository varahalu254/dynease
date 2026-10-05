const express = require('express');
const multer = require('multer');
const restaurantController = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(restrictTo('RESTAURANT_OWNER', 'RESTAURANT_STAFF'));

router.post('/menu', upload.single('image'), restaurantController.createMenuItem);
router.get('/menu', restaurantController.getMenu);

module.exports = router;
