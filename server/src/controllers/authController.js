const User = require('../models/User'); // Platform admin users
const RestaurantRegistration = require('../models/platform/RestaurantRegistration');
const bcrypt = require('bcrypt');
const { createSendToken } = require('../utils/jwt');

exports.registerRestaurantOwner = async (req, res, next) => {
  try {
    const { name, type, ownerName, email, ownerPhone, selectedPlan, subdomain } = req.body;
    
    const userEmail = email || `${ownerPhone}@dynease.in`;

    let finalSlug;
    if (subdomain) {
      finalSlug = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const slugExists = await RestaurantRegistration.findOne({ subdomain: finalSlug });
      if (slugExists) {
        return res.status(409).json({ success: false, message: 'This domain is already taken. Please choose another.' });
      }
    } else {
      let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      finalSlug = baseSlug;
      let slugExists = await RestaurantRegistration.findOne({ subdomain: finalSlug });
      let counter = 1;
      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await RestaurantRegistration.findOne({ subdomain: finalSlug });
        counter++;
      }
    }

    // Generate a temporary password since they don't set it during registration
    const tempPassword = 'Welcome' + Math.floor(1000 + Math.random() * 9000) + '!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await RestaurantRegistration.create({
      restaurantName: name,
      restaurantType: type || 'Restaurant',
      subdomain: finalSlug,
      ownerName: ownerName,
      ownerPhone: ownerPhone,
      ownerEmail: userEmail,
      ownerPassword: hashedPassword,
      selectedPlan: selectedPlan || 'FREE',
      status: 'PENDING_APPROVAL'
    });

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

    let user;
    if (req.tenantDb) {
      // Login against Restaurant Database
      const TenantUser = req.tenantDb.model('User');
      user = await TenantUser.findOne({ 
        $or: [{ email: email }, { phone: email }] 
      }).select('+password');
    } else {
      // Login against Platform Database (Super Admin)
      user = await User.findOne({ 
        $or: [{ email: email }, { phone: email }] 
      }).select('+password');
    }

    if (!user || !(await user.comparePassword(password, user.password))) {
      // If no tenant DB, they might be a restaurant owner trying to login on the platform URL
      if (!req.tenantDb) {
        const RestaurantRegistry = require('../models/platform/RestaurantRegistry');
        const registry = await RestaurantRegistry.findOne({ 
          $or: [{ ownerEmail: email }, { ownerPhone: email }] 
        });
        if (registry) {
          const tenantUrl = `http://${registry.subdomain}.localhost:5173/login`;
          return res.status(403).json({ 
            success: false, 
            message: `You are a restaurant owner. Please login at your dedicated restaurant portal: ${tenantUrl} (or https://${registry.subdomain}.dynease.in in production)` 
          });
        }
      }
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    if (user.role !== 'SUPER_ADMIN') {
      if (!user.isActive) {
        if (req.tenantRegistry) {
          if (req.tenantRegistry.status === 'PENDING_APPROVAL') {
            return res.status(403).json({ success: false, message: 'Your restaurant registration is still under review.' });
          }
          if (req.tenantRegistry.status === 'REJECTED') {
            return res.status(403).json({ success: false, message: 'Your registration was not approved. Please contact support.' });
          }
          if (req.tenantRegistry.status === 'SUSPENDED') {
            return res.status(403).json({ success: false, message: 'Your restaurant account has been suspended. Please contact support.' });
          }
        }
        return res.status(403).json({ success: false, message: 'Your account is not active. Please contact support.' });
      }

      if (req.tenantDb && user.restaurantId) {
        const RestaurantProfile = req.tenantDb.model('RestaurantProfile');
        const restaurantProfile = await RestaurantProfile.findOne({ restaurantId: user.restaurantId });
        if (restaurantProfile) {
          user = user.toObject();
          user.restaurantId = restaurantProfile;
        }
      }
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    let user;
    let restaurantProfile = null;
    
    if (req.tenantDb) {
      const TenantUser = req.tenantDb.model('User');
      const RestaurantProfile = req.tenantDb.model('RestaurantProfile');
      user = await TenantUser.findById(req.user.id);
      if (user && user.restaurantId) {
         restaurantProfile = await RestaurantProfile.findOne({ restaurantId: user.restaurantId });
         // Mock populate for frontend compatibility
         user = user.toObject();
         user.restaurantId = restaurantProfile; 
      }
    } else {
      user = await User.findById(req.user.id);
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};
