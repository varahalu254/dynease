const express = require('express');
const tableController = require('../controllers/tableController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Only RESTAURANT_OWNER and RESTAURANT_STAFF can manage tables
router.use(protect);
router.use(restrictTo('RESTAURANT_OWNER', 'RESTAURANT_STAFF'));

router.route('/')
  .get(tableController.getTables)
  .post(tableController.createTable);

router.route('/:id')
  .get(tableController.getTable)
  .put(tableController.updateTable)
  .delete(tableController.deleteTable);

router.post('/:id/qr/regenerate', tableController.regenerateQR);

module.exports = router;
