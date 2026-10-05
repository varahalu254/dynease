const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { createSendToken } = require('../utils/jwt');

exports.registerRestaurantOwner = async (req, res, next) => {
  try {
    const { name, type, ownerName, email, ownerPhone, phone, selectedPlan, subdomain } = req.body;
    
    const userEmail = email || `${ownerPhone}@dynease.in`;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: userEmail }, { phone: ownerPhone }] });
    if (existingUser) {
        return res.status(409).json({ success: false, message: 'User with this phone/email already exists' });
    }

    // Generate a temporary password since they don't set it during registration
    const tempPassword = 'Welcome' + Math.floor(1000 + Math.random() * 9000) + '!';

    // Create User (inactive by default)
    const newUser = await User.create({
      name: ownerName,
      email: userEmail,
      password: tempPassword,
      phone: ownerPhone,
      role: 'RESTAURANT_OWNER',
      isActive: false
    });

    // Handle Slug/Subdomain
    let finalSlug;
    if (subdomain) {
      finalSlug = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const slugExists = await Restaurant.findOne({ slug: finalSlug });
      if (slugExists) {
        // We must remove the created user if registration fails here to prevent orphaned accounts
        await User.findByIdAndDelete(newUser._id);
        return res.status(409).json({ success: false, message: 'This domain is already taken. Please choose another.' });
      }
    } else {
      let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      finalSlug = baseSlug;
      let slugExists = await Restaurant.findOne({ slug: finalSlug });
      let counter = 1;
      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await Restaurant.findOne({ slug: finalSlug });
        counter++;
      }
    }
    
    const restaurant = await Restaurant.create({
      name,
      type: type || 'Restaurant',
      slug: finalSlug,
      ownerId: newUser._id,
      phone,
      email: userEmail,
      selectedPlan: selectedPlan || 'FREE',
      status: 'PENDING_APPROVAL',
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
      return res.status(400).json({ success: false, message: 'Please provide email/phone and password' });
    }

    const user = await User.findOne({ 
      $or: [{ email: email }, { phone: email }] 
    }).select('+password').populate('restaurantId');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    if (user.role === 'RESTAURANT_OWNER') {
      if (!user.isActive) {
        if (user.restaurantId) {
          if (user.restaurantId.status === 'PENDING_APPROVAL') {
            return res.status(403).json({ success: false, message: 'Your restaurant registration is still under review.' });
          }
          if (user.restaurantId.status === 'REJECTED') {
            return res.status(403).json({ success: false, message: `Your registration was not approved. Reason: ${user.restaurantId.rejectionReason || 'Unknown'}. Please contact support.` });
          }
          if (user.restaurantId.status === 'SUSPENDED') {
            return res.status(403).json({ success: false, message: 'Your restaurant account has been suspended. Please contact support.' });
          }
        }
        return res.status(403).json({ success: false, message: 'Your account is not active. Please contact support.' });
      }
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
