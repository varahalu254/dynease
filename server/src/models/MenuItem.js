const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    public_id: String,
    secure_url: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  dietaryPreference: {
    type: String,
    enum: ['VEG', 'NON_VEG', 'VEGAN', 'EGG', 'NONE'],
    default: 'NONE'
  },
  preparationTime: {
    type: Number // in minutes
  },
  addons: [{
    name: String,
    price: Number
  }],
  quantities: [{
    size: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
