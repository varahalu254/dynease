const express = require('express');
const staffController = require('../controllers/staffController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(restrictTo('RESTAURANT_OWNER'));

router.get('/', staffController.getStaff);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
