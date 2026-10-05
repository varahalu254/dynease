const mongoose = require('mongoose');
require('dotenv').config();

const SubscriptionPlan = require('./src/models/SubscriptionPlan');

const plans = [
  {
    name: 'FREE',
    price: 0,
    description: 'For Getting Started',
    features: [
      '1 Restaurant',
      'Up to 3 Tables',
      'Up to 20 Menu Items',
      'QR Menu',
      'Basic Ordering',
      'Basic Dashboard',
      'Basic Analytics',
      'Platform Branding'
    ],
    isActive: true
  },
  {
    name: 'GROWTH',
    price: 999,
    description: 'Most Popular',
    features: [
      'Unlimited Tables',
      'Unlimited Menu Items',
      'Live Orders',
      'Kitchen Display',
      'Staff Accounts',
      'Offers & Coupons',
      'Advanced Analytics',
      'Customer Reviews',
      'No Platform Branding'
    ],
    isActive: true
  },
  {
    name: 'PRO',
    price: 1999,
    description: 'For Growing Restaurants',
    features: [
      'Everything in Growth',
      'Multiple Branches',
      'Multiple Kitchens',
      'Customer CRM',
      'Loyalty System',
      'Advanced Reports',
      'Custom Branding',
      'Custom Domain',
      'Priority Support'
    ],
    isActive: true
  }
];

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dynease', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Delete existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Existing subscription plans deleted');

    // Insert new plans
    const result = await SubscriptionPlan.insertMany(plans);
    console.log('Subscription plans seeded successfully:', result.length, 'plans added');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    process.exit(1);
  }
}

seedPlans();
