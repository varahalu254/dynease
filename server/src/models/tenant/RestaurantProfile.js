const mongoose = require('mongoose');

const restaurantProfileSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Restaurant', 'Cafe', 'Fast Food', 'Bakery', 'Food Court', 'Cloud Kitchen', 'Other'],
    default: 'Restaurant'
  },
  description: String,
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
    of: String
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
  }
}, { timestamps: true });

module.exports = restaurantProfileSchema;
