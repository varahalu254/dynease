const User = require('../models/User'); // Platform admin users
const Restaurant = require('../models/Restaurant'); // Keep for backward compat for now
const RestaurantRegistration = require('../models/platform/RestaurantRegistration');
const RestaurantRegistry = require('../models/platform/RestaurantRegistry');
const RestaurantProvisioningService = require('../services/RestaurantProvisioningService');
const Order = require('../models/Order');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const whatsapp = require('../utils/whatsapp');
const TenantDatabaseManager = require('../services/TenantDatabaseManager');
const bcrypt = require('bcrypt');

exports.createRestaurant = async (req, res, next) => {
  try {
    const { restaurantName, ownerName, ownerEmail, ownerPhone, ownerPassword } = req.body;

    if (!restaurantName || !ownerName || !ownerEmail || !ownerPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check if the owner email is already taken in the global registry
    const existingRegistry = await RestaurantRegistry.findOne({ ownerEmail });
    if (existingRegistry) {
      return res.status(409).json({ success: false, message: 'A restaurant with this owner email already exists.' });
    }

    // Generate a unique subdomain
    let baseSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let slugExists = await RestaurantRegistry.findOne({ subdomain: slug });
    let counter = 1;
    
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await RestaurantRegistry.findOne({ subdomain: slug });
      counter++;
    }
    
    const hashedPassword = await bcrypt.hash(ownerPassword, 12);

    const registrationMock = {
      restaurantName,
      restaurantType: 'Restaurant',
      subdomain: slug,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerPassword: hashedPassword,
      selectedPlan: 'FREE'
    };

    const registry = await RestaurantProvisioningService.provisionRestaurant(registrationMock);

    res.status(201).json({
      success: true,
      message: 'Restaurant and Owner account created successfully.',
      data: {
        restaurant: registry
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await RestaurantRegistry.find();
    // Map to expected format to not break the frontend
    const mapped = restaurants.map(r => ({
      _id: r.restaurantId,
      name: r.restaurantName,
      slug: r.slug,
      subdomain: r.subdomain,
      status: r.status,
      selectedPlan: r.selectedPlan,
      ownerId: {
        name: r.ownerName || 'Owner', 
        email: r.ownerEmail,
        phone: r.ownerPhone
      }
    }));
    res.status(200).json({
      success: true,
      data: { restaurants: mapped }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPendingRequests = async (req, res, next) => {
  try {
    const requests = await RestaurantRegistration.find({ status: 'PENDING_APPROVAL' });
    // Map to frontend expected format
    const formattedRequests = requests.map(req => ({
      _id: req._id,
      name: req.restaurantName,
      type: req.restaurantType,
      slug: req.subdomain,
      status: req.status,
      selectedPlan: req.selectedPlan,
      createdAt: req.createdAt,
      ownerId: {
        name: req.ownerName,
        email: req.ownerEmail,
        phone: req.ownerPhone
      }
    }));
    res.status(200).json({
      success: true,
      data: { requests: formattedRequests }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const registration = await RestaurantRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    if (registration.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Registration is already approved' });
    }

    // Provision Tenant Database
    const registry = await RestaurantProvisioningService.provisionRestaurant(registration);

    // Remove from requests collection once approved and moved to details
    await RestaurantRegistration.findByIdAndDelete(id);

    if (registration.ownerPhone) {
      try {
        const loginUrl = `https://${registry.subdomain}.dynease.in/login`;
        const message = `🎉 Your restaurant has been approved!\n\nRestaurant: ${registry.restaurantName}\nPlan: ${registry.selectedPlan}\n\nYour restaurant account is now active.\n\nRestaurant URL:\nhttps://${registry.subdomain}.dynease.in\n\nLogin to Dashboard:\n${loginUrl}\n\nYou can now configure your menu, tables and QR codes.`;
        await whatsapp.sendTextMessage(registration.ownerPhone, message);
      } catch (waError) {
        console.error('Failed to send WhatsApp approval notification:', waError.message);
      }
    }

    res.status(200).json({ success: true, message: 'Restaurant approved and database provisioned successfully', data: { registry } });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user ? req.user.id : null;

    const registration = await RestaurantRegistration.findByIdAndUpdate(id, { 
      status: 'REJECTED', 
    }, { new: true });
    
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(200).json({ success: true, message: 'Restaurant rejected successfully' });
  } catch (error) {
    next(error);
  }
};

exports.suspendRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await RestaurantRegistry.findOneAndUpdate({ restaurantId: id }, { status: 'SUSPENDED' }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    // Also update tenant DB
    try {
      const tenantDb = await TenantDatabaseManager.getConnection(restaurant.databaseName);
      const RestaurantProfile = tenantDb.model('RestaurantProfile');
      await RestaurantProfile.findOneAndUpdate({ restaurantId: id }, { isActive: false });
    } catch (e) {
      console.error('Failed to suspend tenant DB profile:', e);
    }
    
    res.status(200).json({ success: true, message: 'Restaurant suspended successfully' });
  } catch (error) {
    next(error);
  }
};

exports.sendCustomMessage = async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: 'Phone and message are required' });
    }
    const result = await whatsapp.sendTextMessage(phone, message);
    res.status(200).json({ success: true, message: 'Message sent successfully', data: result });
  } catch (error) {
    console.error('Custom message error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send message: ' + error.message });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('restaurantId', 'name');
    res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalRestaurants = await RestaurantRegistry.countDocuments();
    const activeRestaurants = await RestaurantRegistry.countDocuments({ status: 'ACTIVE' });
    
    // We don't have a global User count anymore since staff is split. Just counting registries for now.
    const totalUsers = activeRestaurants; 
    
    // Calculate total revenue and total orders by querying all active tenant DBs
    let totalRevenue = 0;
    let totalOrders = 0;

    const activeRegistries = await RestaurantRegistry.find({ status: 'ACTIVE' });
    for (const registry of activeRegistries) {
      try {
        const tenantDb = await TenantDatabaseManager.getConnection(registry.databaseName);
        const Order = tenantDb.model('Order');
        const orders = await Order.find({ paymentStatus: 'PAID' });
        totalRevenue += orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        totalOrders += await Order.countDocuments();
      } catch (err) {
        console.error(`Failed to get analytics for tenant ${registry.databaseName}:`, err);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalRestaurants,
        activeRestaurants,
        totalUsers,
        totalRevenue,
        totalOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, subscriptionPlan, isActive, ownerEmail, ownerName, ownerPhone, subdomain } = req.body;
    
    const status = isActive ? 'ACTIVE' : 'SUSPENDED';
    const updateData = { restaurantName: name, selectedPlan: subscriptionPlan, status };
    if (ownerEmail) updateData.ownerEmail = ownerEmail;
    if (ownerName) updateData.ownerName = ownerName;
    if (ownerPhone) updateData.ownerPhone = ownerPhone;
    
    if (subdomain) {
      const existing = await RestaurantRegistry.findOne({ subdomain, restaurantId: { $ne: id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'This subdomain is already taken.' });
      }
      updateData.subdomain = subdomain;
      updateData.slug = subdomain;
    }

    const restaurant = await RestaurantRegistry.findOneAndUpdate(
      { restaurantId: id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    // Update tenant DB
    try {
      const tenantDb = await TenantDatabaseManager.getConnection(restaurant.databaseName);
      const RestaurantProfile = tenantDb.model('RestaurantProfile');
      const profileUpdateData = { name, isActive };
      if (subdomain) profileUpdateData.slug = subdomain;
      await RestaurantProfile.findOneAndUpdate({ restaurantId: id }, profileUpdateData);

      if (ownerEmail || ownerName || ownerPhone) {
        const TenantUser = tenantDb.model('User');
        const userUpdateData = {};
        if (ownerEmail) userUpdateData.email = ownerEmail;
        if (ownerName) userUpdateData.name = ownerName;
        if (ownerPhone) userUpdateData.phone = ownerPhone;
        
        // Use findOneAndUpdate matching the old email to avoid losing the user record if only email changed.
        // Wait, if email changed, we have to find by old email. We can find by role: 'RESTAURANT_OWNER'
        await TenantUser.findOneAndUpdate({ role: 'RESTAURANT_OWNER' }, userUpdateData);
      }
    } catch (e) {
      console.error('Failed to update tenant DB profile:', e);
    }
    
    res.status(200).json({ success: true, message: 'Restaurant updated successfully', data: { restaurant } });
  } catch (error) {
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await RestaurantRegistry.findOneAndDelete({ restaurantId: id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    // Note: To completely delete, we'd drop the tenant DB. For now, removing the registry entry disables access.
    try {
       const tenantDb = await TenantDatabaseManager.getConnection(restaurant.databaseName);
       if (tenantDb) await tenantDb.dropDatabase();
    } catch (e) {
       console.error('Failed to drop tenant database:', e);
    }

    res.status(200).json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.sendCredentials = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registry = await RestaurantRegistry.findOne({ restaurantId: id });
    if (!registry || !registry.ownerEmail) {
      return res.status(404).json({ success: false, message: 'Restaurant or owner not found' });
    }

    const tenantDb = await TenantDatabaseManager.getConnection(registry.databaseName);
    const TenantUser = tenantDb.model('User');
    const user = await TenantUser.findOne({ email: registry.ownerEmail });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Owner user not found in tenant database' });
    }

    const tempPassword = 'Welcome' + Math.floor(1000 + Math.random() * 9000) + '!';
    user.password = tempPassword;
    await user.save();

    let waSent = false;
    if (user.phone) {
      try {
        const loginUrl = `https://${registry.subdomain}.dynease.in/login`;
        const message = `🎉 Your login credentials have been created/reset!\n\nYou can login at: ${loginUrl}\n\nYour login credentials:\nMobile Number: ${user.phone}\nPassword: ${tempPassword}`;
        await whatsapp.sendTextMessage(user.phone, message);
        waSent = true;
      } catch (e) {
        console.error('WhatsApp message failed to send:', e.message);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: waSent 
        ? 'Credentials sent to owner successfully via WhatsApp.' 
        : `Password reset successfully. (WhatsApp failed, new password is: ${tempPassword})`
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true });
    res.status(200).json({ success: true, data: { plans } });
  } catch (error) {
    next(error);
  }
};

exports.createPlan = async (req, res, next) => {
  try {
    const { name, price, description, features } = req.body;
    const plan = await SubscriptionPlan.create({ name, price, description, features });
    res.status(201).json({ success: true, message: 'Plan created successfully', data: { plan } });
  } catch (error) {
    next(error);
  }
};
