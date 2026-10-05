const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { createSendToken } = require('../utils/jwt');

exports.registerRestaurantOwner = async (req, res, next) => {
  try {
    const { name, ownerName, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    // Create User
    const newUser = await User.create({
      name: ownerName,
      email,
      password,
      phone,
      role: 'RESTAURANT_OWNER'
    });

    // Create Restaurant Shell
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const restaurant = await Restaurant.create({
      name,
      slug: slug + '-' + Math.floor(Math.random() * 1000), // Ensure uniqueness
      ownerId: newUser._id,
      status: 'PENDING',
      isActive: false
    });

    // Link restaurant to user
    newUser.restaurantId = restaurant._id;
    await newUser.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Registration request submitted! Please wait for admin approval.'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('restaurantId');
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};
