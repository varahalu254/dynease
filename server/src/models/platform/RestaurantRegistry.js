const mongoose = require('mongoose');

const restaurantRegistrySchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true
  },
  databaseName: {
    type: String,
    required: true,
    unique: true
  },
  ownerEmail: {
    type: String, // Store email here for quick reference or global uniqueness
    required: true
  },
  ownerName: {
    type: String
  },
  ownerPhone: {
    type: String
  },
  status: {
    type: String,
    enum: [
      'PENDING_APPROVAL',
      'PROVISIONING',
      'ACTIVE',
      'REJECTED',
      'SUSPENDED',
      'PROVISIONING_FAILED'
    ],
    default: 'PENDING_APPROVAL'
  },
  selectedPlan: {
    type: String,
    enum: ['FREE', 'GROWTH', 'PRO'],
    default: 'FREE'
  },
  subscriptionStatus: {
    type: String,
    enum: ['PENDING', 'TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'],
    default: 'PENDING'
  },
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  activatedAt: Date,
  lastPaymentAt: Date,
  paymentStatus: String,
  renewalHistory: [{
    plan: String,
    amount: Number,
    date: Date,
    transactionId: String
  }],
  remindersSent: {
    sevenDay: { type: Boolean, default: false },
    threeDay: { type: Boolean, default: false },
    oneDay: { type: Boolean, default: false },
    expired: { type: Boolean, default: false }
  },
  approvedAt: Date,
  suspendedAt: Date,
  databaseProvisioned: {
    type: Boolean,
    default: false
  },
  databaseProvisionedAt: Date,
  renewalRequest: {
    plan: {
      type: String,
      enum: ['GROWTH', 'PRO']
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED']
    },
    requestedAt: Date
  }
}, { timestamps: true, collection: 'restaurant_details' });

// Always use default mongoose connection for platform DB
module.exports = mongoose.model('RestaurantRegistry', restaurantRegistrySchema);
