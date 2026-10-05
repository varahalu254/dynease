const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Restaurant', 'Cafe', 'Fast Food', 'Bakery', 'Food Court', 'Cloud Kitchen', 'Other'],
    default: 'Restaurant'
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    public_id: String,
    secure_url: String
  },
  coverImage: {
    public_id: String,
    secure_url: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  phone: String,
  email: String,
  openingHours: {
    type: Map,
    of: String // e.g., "Monday": "09:00-22:00"
  },
  cuisineType: [String],
  taxInfo: {
    gstNumber: String,
    taxPercentage: { type: Number, default: 0 }
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isActive: {
    type: Boolean,
    default: true
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
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING_APPROVAL'
  },
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: Date,
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
