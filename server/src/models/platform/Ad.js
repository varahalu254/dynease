const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  targetUrl: {
    type: String,
    default: ''
  },
  clicks: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
