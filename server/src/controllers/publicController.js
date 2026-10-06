const RestaurantRegistry = require('../models/platform/RestaurantRegistry');
const TenantDatabaseManager = require('../services/TenantDatabaseManager');

const getTenantDb = async (req, slug = null) => {
  if (req.tenantDb) return { tenantDb: req.tenantDb, registry: req.tenantRegistry };
  
  if (slug) {
    const registry = await RestaurantRegistry.findOne({ slug, status: 'ACTIVE' });
    if (!registry) return null;
    const tenantDb = await TenantDatabaseManager.getConnection(registry.databaseName);
    return { tenantDb, registry };
  }
  return null;
};

exports.getTableByQR = async (req, res, next) => {
  try {
    const { qrToken } = req.params;
    
    // For QR codes, the customer is definitely on the correct subdomain, so req.tenantDb is usually present.
    // However, if they aren't, we can't easily resolve the DB from just the QR token unless we query all DBs, 
    // which is not scalable. We rely on the subdomain mapping.
    
    if (!req.tenantDb) {
       return res.status(404).json({ success: false, message: 'Invalid restaurant domain for this QR code.' });
    }

    const Table = req.tenantDb.model('Table');
    const table = await Table.findOne({ qrToken, status: 'ACTIVE' });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive QR code.' });
    }

    const RestaurantProfile = req.tenantDb.model('RestaurantProfile');
    const restaurant = await RestaurantProfile.findOne({ restaurantId: req.tenantRegistry.restaurantId });
    
    if (!restaurant || !restaurant.isActive) {
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
    
    const dbInfo = await getTenantDb(req, slug);
    if (!dbInfo) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or inactive.' });
    }
    
    const { tenantDb, registry } = dbInfo;

    const RestaurantProfile = tenantDb.model('RestaurantProfile');
    const restaurant = await RestaurantProfile.findOne({ restaurantId: registry.restaurantId });
    
    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or inactive.' });
    }

    const MenuItem = tenantDb.model('MenuItem');
    const menuItems = await MenuItem.find({ isAvailable: true });
    
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
