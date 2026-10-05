const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

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
    const slug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Create the Restaurant
    const restaurant = await Restaurant.create({
      name: restaurantName,
      slug: slug + '-' + Math.floor(1000 + Math.random() * 9000),
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
    const requests = await Restaurant.find({ status: 'PENDING' }).populate('ownerId', 'name email phone');
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
    const restaurant = await Restaurant.findByIdAndUpdate(id, { status: 'APPROVED', isActive: true }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(200).json({ success: true, message: 'Restaurant approved successfully', data: { restaurant } });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, { status: 'REJECTED' }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(200).json({ success: true, message: 'Restaurant rejected successfully' });
  } catch (error) {
    next(error);
  }
};
