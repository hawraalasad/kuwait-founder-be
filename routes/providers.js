const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');

// Get all providers with optional filters (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, priceRange } = req.query;

    let queryFilter = {};

    // Search filter
    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter - check both singular category and categories array
    if (category) {
      const categoryCondition = {
        $or: [
          { category: category },
          { categories: category }
        ]
      };

      if (search) {
        queryFilter = {
          $and: [
            { $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ]},
            categoryCondition
          ]
        };
      } else {
        queryFilter = categoryCondition;
      }
    }

    // Price range filter (can be comma-separated)
    if (priceRange) {
      const ranges = priceRange.split(',');
      const priceCondition = { priceRange: { $in: ranges } };

      if (queryFilter.$and) {
        queryFilter.$and.push(priceCondition);
      } else if (queryFilter.$or) {
        queryFilter = { $and: [queryFilter, priceCondition] };
      } else {
        queryFilter.priceRange = { $in: ranges };
      }
    }

    // Fast query - just fetch and return
    const providers = await ServiceProvider.find(queryFilter)
      .populate(['category', 'categories'])
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    res.json(providers);
  } catch (error) {
    console.error('Fetch providers error:', error);
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
