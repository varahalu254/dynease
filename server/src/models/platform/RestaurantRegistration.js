const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  restaurantType: { type: String, default: 'Restaurant' },
  subdomain: { type: String, required: true, unique: true },
  
  ownerName: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  
  // Storing hashed password temporarily until provisioned
  ownerPassword: { type: String, required: true }, 

  selectedPlan: {
    type: String,
    enum: ['FREE', 'GROWTH', 'PRO'],
    default: 'FREE'
  },
  
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
    default: 'PENDING_APPROVAL'
  }
}, { timestamps: true, collection: 'restaurant_requests' });

module.exports = mongoose.model('RestaurantRegistration', registrationSchema);
