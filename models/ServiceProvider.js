const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  priceRange: {
    type: String,
    enum: ['budget', 'mid', 'premium'],
    default: 'mid'
  },
  bestFor: [{
    type: String,
    trim: true
  }],
  contactWhatsApp: {
    type: String,
    default: ''
  },
  contactInstagram: {
    type: String,
    default: ''
  },
  contactWebsite: {
    type: String,
    default: ''
  },
  practicalNotes: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
