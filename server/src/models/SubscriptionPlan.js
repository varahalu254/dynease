const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true, collection: 'subscription_plans' });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
