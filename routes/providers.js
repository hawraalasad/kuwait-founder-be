const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ServiceProvider = require('../models/ServiceProvider');

// Get all providers with optional filters (public)
router.get('/', async (req, res) => {
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

    // Category filter - check both singular category and categories array
    if (category) {
      query.$or = query.$or || [];
      query.$or.push(
        { category: category },
        { categories: category }
      );
      // If we already have search $or, we need to use $and
      if (search) {
        query = {
          $and: [
            { $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ]},
            { $or: [
              { category: category },
              { categories: category }
            ]}
          ]
        };
        if (priceRange) {
          const ranges = priceRange.split(',');
          query.$and.push({ priceRange: { $in: ranges } });
        }
      }
    }

    // Price range filter (can be comma-separated)
    if (priceRange && !search) {
      const ranges = priceRange.split(',');
      query.priceRange = { $in: ranges };
    }

    const providers = await ServiceProvider.find(query)
      .populate(['category', 'categories'])
      .sort({ featured: -1, createdAt: -1 });

    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get single provider (public)
router.get('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate(['category', 'categories']);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

module.exports = router;
