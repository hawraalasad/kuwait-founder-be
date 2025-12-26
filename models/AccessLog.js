const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  accessCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessCode',
    default: null
  },
  codeUsed: {
    type: String,
    default: ''
  },
  customerName: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: false
});

// Index for faster queries on timestamp
accessLogSchema.index({ timestamp: -1 });
accessLogSchema.index({ accessCode: 1 });

module.exports = mongoose.model('AccessLog', accessLogSchema);
