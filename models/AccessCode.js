const mongoose = require('mongoose');

const accessCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerName: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  },
  customerEmail: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: 0 // 0 = unlimited
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null // null = never expires
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
accessCodeSchema.index({ code: 1 });
accessCodeSchema.index({ isActive: 1 });
accessCodeSchema.index({ createdAt: -1 });

// Method to check if code is valid
accessCodeSchema.methods.isValid = function() {
  // Check if active
  if (!this.isActive) return false;

  // Check expiration
  if (this.expiresAt && new Date() > this.expiresAt) return false;

  // Check usage limit
  if (this.maxUsage > 0 && this.usageCount >= this.maxUsage) return false;

  return true;
};

// Method to record usage
accessCodeSchema.methods.recordUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

module.exports = mongoose.model('AccessCode', accessCodeSchema);
