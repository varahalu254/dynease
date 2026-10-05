const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const whatsapp = require('../utils/whatsapp');

exports.createRestaurant = async (req, res, next) => {
  try {
    const { restaurantName, ownerName, ownerEmail, ownerPhone, ownerPassword } = req.body;

    if (!restaurantName || !ownerName || !ownerEmail || !ownerPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: ownerEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Owner email already exists in the system.' });
    }

    // Create the new Owner User
    const newUser = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      phone: ownerPhone,
      role: 'RESTAURANT_OWNER'
    });

    // Generate a unique slug for the restaurant
    let baseSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let slugExists = await Restaurant.findOne({ slug });
    let counter = 1;
    
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await Restaurant.findOne({ slug });
      counter++;
    }
    
    // Create the Restaurant
    const restaurant = await Restaurant.create({
      name: restaurantName,
      slug: slug,
      ownerId: newUser._id
    });

    // Link the restaurant ID back to the owner
    newUser.restaurantId = restaurant._id;
    await newUser.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Restaurant and Owner account created successfully.',
      data: {
        restaurant,
        owner: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().populate('ownerId', 'name email phone');
    res.status(200).json({
      success: true,
      data: { restaurants }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPendingRequests = async (req, res, next) => {
  try {
    const requests = await Restaurant.find({ status: 'PENDING_APPROVAL' }).populate('ownerId', 'name email phone');
    res.status(200).json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user ? req.user.id : null; // Assuming req.user is set by auth middleware

    const restaurant = await Restaurant.findById(id).populate('ownerId');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (restaurant.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Restaurant is already approved' });
    }

    // Update restaurant
    restaurant.status = 'APPROVED';
    restaurant.isActive = true;
    restaurant.approvedAt = new Date();
    if (adminId) restaurant.approvedBy = adminId;
    if (restaurant.subscriptionStatus === 'TRIAL') {
      restaurant.subscriptionStatus = 'ACTIVE'; // or trial
    }
    await restaurant.save();

    // Activate user and generate temporary password
    const user = restaurant.ownerId;
    user.isActive = true;
    const tempPassword = 'Welcome' + Math.floor(1000 + Math.random() * 9000) + '!';
    user.password = tempPassword;
    await user.save();

      if (user.phone) {
        try {
          const loginUrl = `http://${restaurant.slug}.dynease.in/login`;
          const message = `🎉 Your account is approved!\n\nYou can login at: ${loginUrl}\n\nYour login credentials:\nMobile Number: ${user.phone}\nPassword: ${tempPassword}`;
          await whatsapp.sendTextMessage(user.phone, message);
        } catch (waError) {
        console.error('Failed to send WhatsApp approval notification:', waError.message);
      }
    }

    res.status(200).json({ success: true, message: 'Restaurant approved successfully', data: { restaurant } });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user ? req.user.id : null;

    const restaurant = await Restaurant.findByIdAndUpdate(id, { 
      status: 'REJECTED', 
      rejectionReason: reason || 'Does not meet platform requirements',
      rejectedAt: new Date(),
      rejectedBy: adminId
    }, { new: true });
    
    if (!restaurant) {
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
    const restaurant = await Restaurant.findByIdAndUpdate(id, { status: 'SUSPENDED', isActive: false }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
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
    const totalRestaurants = await Restaurant.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    
    // Calculate total revenue and total orders
    const orders = await Order.find({ paymentStatus: 'PAID' });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = await Order.countDocuments();

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
