const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Category = require('../models/Category');

// Get all categories
router.get('/', requireAuth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
