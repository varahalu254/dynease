const express = require('express');
const publicController = require('../controllers/publicController');

const router = express.Router();

router.get('/table/:qrToken', publicController.getTableByQR);
router.get('/restaurant/:slug/menu', publicController.getRestaurantMenu);

module.exports = router;
