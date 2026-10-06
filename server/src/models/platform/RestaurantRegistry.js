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
    enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED'],
    default: 'TRIAL'
  },
  approvedAt: Date,
  suspendedAt: Date,
  databaseProvisioned: {
    type: Boolean,
    default: false
  },
  databaseProvisionedAt: Date
}, { timestamps: true });

// Always use default mongoose connection for platform DB
module.exports = mongoose.model('RestaurantRegistry', restaurantRegistrySchema);
