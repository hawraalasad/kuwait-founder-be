const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');

// Get user's checklist progress
router.get('/', requireAuth, async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ sessionId: req.sessionID });

    if (!progress) {
      progress = { checklistProgress: [] };
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Save/update checklist progress
router.post('/', requireAuth, async (req, res) => {
  try {
    const { checklistId, completedItems } = req.body;

    let progress = await UserProgress.findOne({ sessionId: req.sessionID });

    if (!progress) {
      progress = new UserProgress({
        sessionId: req.sessionID,
        checklistProgress: []
      });
    }

    // Find existing progress for this checklist
    const existingIndex = progress.checklistProgress.findIndex(
      cp => cp.checklistId.toString() === checklistId
    );

    if (existingIndex > -1) {
      progress.checklistProgress[existingIndex].completedItems = completedItems;
    } else {
      progress.checklistProgress.push({
        checklistId,
        completedItems
      });
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Progress save error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Reset progress for a specific checklist
router.delete('/:checklistId', requireAuth, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ sessionId: req.sessionID });

    if (progress) {
      progress.checklistProgress = progress.checklistProgress.filter(
        cp => cp.checklistId.toString() !== req.params.checklistId
      );
      await progress.save();
    }

    res.json({ success: true, message: 'Progress reset' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});

module.exports = router;
