const mongoose = require('mongoose');

const checklistProgressSchema = new mongoose.Schema({
  checklistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checklist',
    required: true
  },
  completedItems: [{
    type: mongoose.Schema.Types.ObjectId
  }]
});

const userProgressSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    default: ''
  },
  checklistProgress: [checklistProgressSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProgress', userProgressSchema);
