const RestaurantRegistry = require('../models/platform/RestaurantRegistry');
const TenantDatabaseManager = require('../services/TenantDatabaseManager');

// Helper: get tenant DB from req (already resolved by tenantResolver middleware)
const requireTenantDb = (req, res) => {
  if (!req.tenantDb || !req.tenantRegistry) {
    res.status(404).json({ success: false, message: 'Restaurant not found or not active.' });
    return null;
  }
  return { tenantDb: req.tenantDb, registry: req.tenantRegistry };
};

/**
 * GET /api/public/qr/:token
 * Resolves a QR token → restaurant + table info
 */
exports.getTableByQR = async (req, res, next) => {
  try {
    const { qrToken } = req.params;
    
    const info = requireTenantDb(req, res);
    if (!info) return;
    const { tenantDb, registry } = info;

    const Table = tenantDb.model('Table');
    const table = await Table.findOne({ qrToken, status: 'ACTIVE' });
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        code: 'INVALID_QR',
        message: 'This table QR code is invalid or inactive.' 
      });
    }

    const RestaurantProfile = tenantDb.model('RestaurantProfile');
    const profile = await RestaurantProfile.findOne({ restaurantId: registry.restaurantId });
    
    if (!profile || !profile.isActive) {
      return res.status(403).json({ 
        success: false, 
        code: 'RESTAURANT_UNAVAILABLE',
        message: 'This restaurant is currently unavailable.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: { 
        restaurant: { 
          id: registry.restaurantId,
          name: profile.name,
          slug: registry.subdomain,
          logo: profile.logo?.secure_url || null,
          taxPercent: profile.taxInfo?.taxPercentage || 0
        },
        table: { 
          id: table._id, 
          tableNumber: table.tableNumber, 
          tableName: table.tableName || null
        },
        session: { qrToken }
      } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/table/:tableNumber
 * Resolves a table number → restaurant + table info
 */
exports.getTableByNumber = async (req, res, next) => {
  try {
    const { tableNumber } = req.params;
    
    const info = requireTenantDb(req, res);
    if (!info) return;
    const { tenantDb, registry } = info;

    const Table = tenantDb.model('Table');
    const table = await Table.findOne({ tableNumber, status: 'ACTIVE' });
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        code: 'INVALID_TABLE',
        message: 'This table number is invalid or inactive.' 
      });
    }

    const RestaurantProfile = tenantDb.model('RestaurantProfile');
    const profile = await RestaurantProfile.findOne({ restaurantId: registry.restaurantId });
    
    if (!profile || !profile.isActive) {
      return res.status(403).json({ 
        success: false, 
        code: 'RESTAURANT_UNAVAILABLE',
        message: 'This restaurant is currently unavailable.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: { 
        restaurant: { 
          id: registry.restaurantId,
          name: profile.name,
          slug: registry.subdomain,
          logo: profile.logo?.secure_url || null,
          taxPercent: profile.taxInfo?.taxPercentage || 0
        },
        table: { 
          id: table._id, 
          tableNumber: table.tableNumber, 
          tableName: table.tableName || null
        },
        session: { qrToken: table.qrToken || tableNumber } // fallback to tableNumber if no qrToken
      } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/menu
 * Returns the restaurant menu grouped by category
 */
exports.getMenu = async (req, res, next) => {
  try {
    const info = requireTenantDb(req, res);
    if (!info) return;
    const { tenantDb, registry } = info;

    const RestaurantProfile = tenantDb.model('RestaurantProfile');
    const profile = await RestaurantProfile.findOne({ restaurantId: registry.restaurantId });
    
    if (!profile || !profile.isActive) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or inactive.' });
    }

    const MenuItem = tenantDb.model('MenuItem');
    const menuItems = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    
    const Category = tenantDb.model('Category');
    const categoryDocs = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    
    // Create base categories list
    const categories = categoryDocs.map(c => ({
      name: c.name,
      image: c.image?.secure_url || null,
      items: []
    }));
    
    // Add items to categories, also handle items that might not have a category document
    for (const item of menuItems) {
      let targetCat = categories.find(c => c.name === item.category);
      if (!targetCat) {
        targetCat = { name: item.category, items: [] };
        categories.push(targetCat);
      }
      targetCat.items.push({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image?.secure_url || null,
        isAvailable: item.isAvailable,
        dietaryPreference: item.dietaryPreference,
        preparationTime: item.preparationTime
      });
    }

    res.status(200).json({
      success: true,
      data: {
        restaurant: {
          id: registry.restaurantId,
          name: profile.name,
          slug: registry.subdomain,
          logo: profile.logo?.secure_url || null,
          taxPercent: profile.taxInfo?.taxPercentage || 0
        },
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/restaurant/:slug/menu
 * Legacy endpoint - returns same menu data by slug
 */
exports.getRestaurantMenu = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    let tenantDb = req.tenantDb;
    let registry = req.tenantRegistry;

    // If not resolved via subdomain, try resolving via slug
    if (!tenantDb) {
      registry = await RestaurantRegistry.findOne({ subdomain: slug, status: 'ACTIVE' });
      if (!registry) {
        return res.status(404).json({ success: false, message: 'Restaurant not found or inactive.' });
      }
      tenantDb = await TenantDatabaseManager.getConnection(registry.databaseName);
    }

    const RestaurantProfile = tenantDb.model('RestaurantProfile');
    const profile = await RestaurantProfile.findOne({ restaurantId: registry.restaurantId });
    
    if (!profile || !profile.isActive) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or inactive.' });
    }

    const MenuItem = tenantDb.model('MenuItem');
    const menuItems = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    
    const Category = tenantDb.model('Category');
    const categoryDocs = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    
    // Create base categories list
    const categories = categoryDocs.map(c => ({
      name: c.name,
      image: c.image?.secure_url || null,
      items: []
    }));
    
    // Add items to categories, also handle items that might not have a category document
    for (const item of menuItems) {
      let targetCat = categories.find(c => c.name === item.category);
      if (!targetCat) {
        targetCat = { name: item.category, items: [] };
        categories.push(targetCat);
      }
      targetCat.items.push({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image?.secure_url || null,
        isAvailable: item.isAvailable,
        dietaryPreference: item.dietaryPreference,
        preparationTime: item.preparationTime
      });
    }

    res.status(200).json({
      success: true,
      data: {
        restaurant: {
          id: registry.restaurantId,
          name: profile.name,
          slug: registry.subdomain,
          logo: profile.logo?.secure_url || null,
          taxPercent: profile.taxInfo?.taxPercentage || 0
        },
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/public/orders
 * Create a customer order - NEVER trusts frontend prices
 */
exports.createOrder = async (req, res, next) => {
  try {
    const info = requireTenantDb(req, res);
    if (!info) return;
    const { tenantDb, registry } = info;

    const { tableId, customerName, customerPhone, items } = req.body;

    // --- Validation ---
    if (!tableId) {
      return res.status(400).json({ success: false, message: 'Table is required.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }
    for (const item of items) {
      if (!item.menuItemId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each item must have a valid menuItemId and quantity >= 1.' });
      }
    }

    // --- Validate table ---
    const Table = tenantDb.model('Table');
    const table = await Table.findById(tableId);
    if (!table || table.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Invalid or inactive table.' });
    }

    // --- Validate menu items and compute prices server-side ---
    const MenuItem = tenantDb.model('MenuItem');
    const orderItems = [];
    let subtotal = 0;

    for (const reqItem of items) {
      const menuItem = await MenuItem.findById(reqItem.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Menu item not found: ${reqItem.menuItemId}` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Item is currently unavailable: ${menuItem.name}` });
      }
      const qty = parseInt(reqItem.quantity, 10);
      if (isNaN(qty) || qty < 1 || qty > 50) {
        return res.status(400).json({ success: false, message: `Invalid quantity for ${menuItem.name}` });
      }
      const lineSubtotal = parseFloat((menuItem.price * qty).toFixed(2));
      subtotal += lineSubtotal;
      orderItems.push({
        menuItemId: menuItem._id,
        itemName: menuItem.name,       // snapshot
        unitPrice: menuItem.price,     // snapshot
        quantity: qty,
        subtotal: lineSubtotal
      });
    }

    subtotal = parseFloat(subtotal.toFixed(2));

    // Get restaurant tax rate
    const RestaurantProfile = tenantDb.model('RestaurantProfile');
    const profile = await RestaurantProfile.findOne({ restaurantId: registry.restaurantId });
    const taxPercent = profile?.taxInfo?.taxPercentage || 0;
    const taxAmount = parseFloat(((subtotal * taxPercent) / 100).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));

    // --- Generate order number ---
    const Order = tenantDb.model('Order');
    const orderCount = await Order.countDocuments({ restaurantId: registry.restaurantId });
    const orderNumber = `ORD-${String(orderCount + 1001).padStart(4, '0')}`;

    // --- Create order ---
    const order = await Order.create({
      orderNumber,
      restaurantId: registry.restaurantId,
      tableId: table._id,
      tableNumber: table.tableNumber,
      customerName: customerName?.trim() || 'Guest',
      customerPhone: customerPhone?.trim() || null,
      items: orderItems,
      subtotal,
      taxPercent,
      taxAmount,
      discount: 0,
      total,
      status: 'PENDING',
      paymentStatus: 'PENDING'
    });

    const io = req.app.get('io');
    if (io) {
      const payload = {
        id: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      };

      // Emit to kitchen
      io.to(`kitchen:${registry.restaurantId}`).emit('new_order', payload);

      // Emit to assigned waiters
      const User = tenantDb.model('User');
      const waiters = await User.find({ role: 'RESTAURANT_STAFF', assignedTables: table._id });
      for (const w of waiters) {
        io.to(`waiter_user:${w._id.toString()}`).emit('new_order', payload);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          items: order.items,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/orders/:orderId
 * Get order details for confirmation page
 */
exports.getOrder = async (req, res, next) => {
  try {
    const info = requireTenantDb(req, res);
    if (!info) return;
    const { tenantDb } = info;

    const Order = tenantDb.model('Order');
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};
