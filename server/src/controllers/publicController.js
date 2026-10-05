const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

exports.getTableByQR = async (req, res, next) => {
  try {
    const { qrToken } = req.params;
    
    const table = await Table.findOne({ qrToken, status: 'ACTIVE' });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive QR code.' });
    }

    const restaurant = await Restaurant.findById(table.restaurantId).select('name slug logo coverImage address phone email currency taxInfo status isActive');
    
    if (!restaurant || restaurant.status !== 'APPROVED' || !restaurant.isActive) {
      return res.status(403).json({ success: false, message: 'Restaurant is currently unavailable.' });
    }

    res.status(200).json({ 
      success: true, 
      data: { 
        table: { _id: table._id, tableNumber: table.tableNumber, tableName: table.tableName },
        restaurant 
      } 
    });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantMenu = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const restaurant = await Restaurant.findOne({ slug });
    
    if (!restaurant || restaurant.status !== 'APPROVED' || !restaurant.isActive) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or inactive.' });
    }

    const menuItems = await MenuItem.find({ restaurantId: restaurant._id, isAvailable: true });
    
    // Extract unique categories
    const categories = [...new Set(menuItems.map(item => item.category))];

    res.status(200).json({
      success: true,
      data: {
        restaurant,
        menuItems,
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};
