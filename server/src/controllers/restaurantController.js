const { uploadToCloudinary } = require('../utils/cloudinary');

// ──────────────────────────────────────────
//  CATEGORY CRUD
// ──────────────────────────────────────────

exports.getCategories = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const Category = req.tenantDb.model('Category');
    const categories = await Category.find({ restaurantId }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, description, displayOrder } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }
    const Category = req.tenantDb.model('Category');
    const existing = await Category.findOne({ restaurantId, name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }

    let image = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, `dynease/categories/${restaurantId}`);
        image = {
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url
        };
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
      }
    }

    const category = await Category.create({
      restaurantId,
      name: name.trim(),
      description: description?.trim() || '',
      displayOrder: displayOrder || 0,
      image
    });
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { name, description, displayOrder, isActive } = req.body;
    
    let updateData = { name: name?.trim(), description: description?.trim(), displayOrder, isActive };

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, `dynease/categories/${restaurantId}`);
        updateData.image = {
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url
        };
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
      }
    }

    const Category = req.tenantDb.model('Category');
    const category = await Category.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, data: { category } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const Category = req.tenantDb.model('Category');
    // Check if any menu items use this category
    const MenuItem = req.tenantDb.model('MenuItem');
    const category = await Category.findOne({ _id: id, restaurantId });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    const itemCount = await MenuItem.countDocuments({ restaurantId, category: category.name });
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${itemCount} menu item(s) use this category. Reassign them first.`
      });
    }
    await Category.deleteOne({ _id: id, restaurantId });
    res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ──────────────────────────────────────────
//  MENU ITEM CRUD
// ──────────────────────────────────────────

exports.createMenuItem = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { category, name, description, price, isAvailable, dietaryPreference, preparationTime, quantities } = req.body;

    let image = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, `dynease/menu/${restaurantId}`);
        image = {
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url
        };
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
      }
    }

    // Parse quantities if it's a string
    let parsedQuantities = [];
    if (quantities) {
      try {
        parsedQuantities = typeof quantities === 'string' ? JSON.parse(quantities) : quantities;
        // Filter out invalid entries
        parsedQuantities = parsedQuantities.filter(q => q.size && q.price);
      } catch (parseError) {
        console.error("Error parsing quantities:", parseError);
      }
    }

    const MenuItem = req.tenantDb.model('MenuItem');
    const menuItem = await MenuItem.create({
      restaurantId,
      category,
      name,
      description,
      price,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      dietaryPreference,
      preparationTime,
      image,
      quantities: parsedQuantities
    });

    res.status(201).json({ success: true, data: { menuItem } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { category, name, description, price, isAvailable, dietaryPreference, preparationTime, quantities } = req.body;

    let image = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, `dynease/menu/${restaurantId}`);
        image = {
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url
        };
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
      }
    }

    // Parse quantities if it's a string
    let parsedQuantities = [];
    if (quantities) {
      try {
        parsedQuantities = typeof quantities === 'string' ? JSON.parse(quantities) : quantities;
        // Filter out invalid entries
        parsedQuantities = parsedQuantities.filter(q => q.size && q.price);
      } catch (parseError) {
        console.error("Error parsing quantities:", parseError);
      }
    }

    const MenuItem = req.tenantDb.model('MenuItem');
    const updateData = {
      category,
      name,
      description,
      price,
      isAvailable,
      dietaryPreference,
      preparationTime,
      quantities: parsedQuantities
    };

    if (image) updateData.image = image;

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    res.status(200).json({ success: true, data: { menuItem } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getMenu = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const MenuItem = req.tenantDb.model('MenuItem');
    const { category, type } = req.query;

    const filter = { restaurantId };
    if (category) filter.category = category;
    if (type) filter.dietaryPreference = type;

    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, data: { menuItems } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const MenuItem = req.tenantDb.model('MenuItem');
    const item = await MenuItem.findOneAndDelete({ _id: id, restaurantId });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.status(200).json({ success: true, message: 'Menu item deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.toggleMenuItemStatus = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { isAvailable } = req.body;
    const MenuItem = req.tenantDb.model('MenuItem');
    const item = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId },
      { isAvailable },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.status(200).json({ success: true, data: { menuItem: item } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ──────────────────────────────────────────
//  ORDER MANAGEMENT
// ──────────────────────────────────────────

exports.getOrders = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const Order = req.tenantDb.model('Order');
    
    // Fetch today's orders or active orders. Let's fetch all orders and sort by descending date.
    // In a real app we might paginate or filter by date range.
    const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 }).limit(100);
    
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const Order = req.tenantDb.model('Order');
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    const order = await Order.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true }
    );
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    
    // Emit socket event for order update
    const io = req.app.get('io');
    if (io) {
      io.to(`kitchen:${restaurantId}`).emit('order_updated', order);
      io.to(`waiter:${restaurantId}`).emit('order_updated', order);
      io.to(`order:${order._id.toString()}`).emit('order_updated', order);
    }
    
    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ──────────────────────────────────────────
//  PROFILE CRUD
// ──────────────────────────────────────────

exports.getProfile = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const RestaurantProfile = req.tenantDb.model('RestaurantProfile');
    const profile = await RestaurantProfile.findOne({ restaurantId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, data: { profile } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { name, subtitle } = req.body;
    const RestaurantProfile = req.tenantDb.model('RestaurantProfile');
    
    const profile = await RestaurantProfile.findOne({ restaurantId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (name) profile.name = name.trim();
    if (subtitle !== undefined) profile.subtitle = subtitle.trim();

    await profile.save();
    res.status(200).json({ success: true, data: { profile } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ──────────────────────────────────────────
//  STATS
// ──────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const Order = req.tenantDb.model('Order');
    const Table = req.tenantDb.model('Table');

    // Get today's start and end date
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's orders
    const todaysOrders = await Order.find({
      restaurantId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const todaysOrdersCount = todaysOrders.length;
    
    // Calculate Revenue
    const revenue = todaysOrders.reduce((sum, order) => {
      // Only count completed/paid orders if needed, for now let's sum all non-cancelled
      if (order.status !== 'CANCELLED') {
        return sum + (order.totalAmount || 0);
      }
      return sum;
    }, 0);

    // Get active tables
    const activeTablesCount = await Table.countDocuments({
      restaurantId,
      status: 'ACTIVE'
    });

    res.status(200).json({
      success: true,
      data: {
        todaysOrders: todaysOrdersCount,
        revenue: revenue,
        activeTables: activeTablesCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ──────────────────────────────────────────
//  SUBSCRIPTION
// ──────────────────────────────────────────

const RestaurantRegistry = require('../models/platform/RestaurantRegistry');

exports.getSubscription = async (req, res) => {
  try {
    const registry = req.tenantRegistry;
    if (!registry) return res.status(404).json({ success: false, message: 'Registry not found' });
    
    let remainingDays = 0;
    if (registry.subscriptionEndDate) {
      const diff = new Date(registry.subscriptionEndDate) - new Date();
      remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.status(200).json({ 
      success: true, 
      data: {
        plan: registry.selectedPlan,
        status: registry.subscriptionStatus,
        startDate: registry.subscriptionStartDate,
        endDate: registry.subscriptionEndDate,
        remainingDays,
        lastPaymentAt: registry.lastPaymentAt,
        renewalHistory: registry.renewalHistory
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.renewSubscription = async (req, res) => {
  try {
    const { plan, transactionId, amount } = req.body;
    
    const registry = req.tenantRegistry;
    if (!registry) return res.status(404).json({ success: false, message: 'Registry not found' });

    const now = new Date();
    const currentEnd = registry.subscriptionEndDate ? new Date(registry.subscriptionEndDate) : now;
    const startDate = currentEnd > now ? currentEnd : now;
    
    const newEnd = new Date(startDate);
    newEnd.setDate(newEnd.getDate() + 30);

    registry.selectedPlan = plan || registry.selectedPlan;
    registry.subscriptionStatus = 'ACTIVE';
    registry.subscriptionEndDate = newEnd;
    registry.lastPaymentAt = now;
    registry.paymentStatus = 'PAID';
    
    registry.renewalHistory.push({
      plan: registry.selectedPlan,
      amount: amount || 0,
      date: now,
      transactionId: transactionId || 'MANUAL_RENEWAL'
    });

    registry.remindersSent = {
      sevenDay: false,
      threeDay: false,
      oneDay: false,
      expired: false
    };

    await registry.save();

    res.status(200).json({ 
      success: true, 
      message: 'Subscription renewed successfully', 
      data: { endDate: newEnd }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
