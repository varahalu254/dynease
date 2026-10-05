const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
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
    zip: String,
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
  subscriptionPlan: {
    type: String,
    enum: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'],
    default: 'FREE'
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED'
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
