const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ServiceProvider = require('../models/ServiceProvider');

// Get all providers with optional filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, category, priceRange } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter (can be comma-separated)
    if (priceRange) {
      const ranges = priceRange.split(',');
      query.priceRange = { $in: ranges };
    }

    const providers = await ServiceProvider.find(query)
      .populate('category')
      .sort({ featured: -1, createdAt: -1 });

    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get single provider
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('category');

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

module.exports = router;
