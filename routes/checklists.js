const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Checklist = require('../models/Checklist');

// Get all checklists
router.get('/', requireAuth, async (req, res) => {
  try {
    const checklists = await Checklist.find().sort({ order: 1 });
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checklists' });
  }
});

// Get single checklist by slug
router.get('/:slug', requireAuth, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({ slug: req.params.slug });
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

module.exports = router;
