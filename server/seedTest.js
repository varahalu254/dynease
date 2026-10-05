const mongoose = require('mongoose');
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seedTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dynease');
    
    console.log('Connected to DB');

    // Remove old test data
    await Restaurant.deleteOne({ slug: 'test' });
    await User.deleteOne({ phone: '1234567890' });

    // 1. Create the User
    const user = new User({
      name: 'Test Owner',
      email: '1234567890@dynease.in',
      phone: '1234567890',
      password: 'password123',
      role: 'RESTAURANT_OWNER',
      isActive: true, // Must be true to login
    });
    
    // Hash is handled by the pre-save hook, but let's be explicit if needed.
    // wait, User.js has a pre-save hook: 
    // userSchema.pre('save', async function() { if (!this.isModified('password')) return; this.password = await bcrypt.hash(this.password, 12); });
    await user.save();

    // 2. Create the Restaurant
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      type: 'Restaurant',
      slug: 'test',
      ownerId: user._id,
      phone: '1234567890',
      email: '1234567890@dynease.in',
      selectedPlan: 'PRO',
      status: 'APPROVED',
      isActive: true // Must be true for public access
    });
    await restaurant.save();

    // 3. Link them
    user.restaurantId = restaurant._id;
    await user.save();

    console.log('✅ Successfully seeded Test Restaurant!');
    console.log('-------------------------------------------');
    console.log('Login Subdomain : http://test.localhost:5173/login');
    console.log('Mobile Number   : 1234567890');
    console.log('Password        : password123');
    console.log('-------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedTest();
