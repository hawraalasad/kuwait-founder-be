const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const PlaybookSection = require('../models/PlaybookSection');

// Get all published sections
router.get('/', requireAuth, async (req, res) => {
  try {
    const sections = await PlaybookSection.find({ status: 'published' })
      .sort({ order: 1 })
      .select('-__v');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get single section by slug
router.get('/:slug', requireAuth, async (req, res) => {
  try {
    const section = await PlaybookSection.findOne({
      slug: req.params.slug,
      status: 'published'
    }).select('-__v');

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

module.exports = router;
