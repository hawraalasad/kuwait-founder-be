const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ServiceProvider = require('../models/ServiceProvider');

// Get all providers with optional filters and pagination (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, priceRange, limit, skip } = req.query;
    const limitNum = parseInt(limit) || 0; // 0 means no limit
    const skipNum = parseInt(skip) || 0;

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

    // Get total count for pagination
    const total = await ServiceProvider.countDocuments(queryFilter);

    // Use aggregation with $sample for random shuffling
    const pipeline = [
      { $match: queryFilter },
      { $sample: { size: 1000 } }, // Shuffle all matching docs randomly
      ...(skipNum > 0 ? [{ $skip: skipNum }] : []),
      { $limit: limitNum || 1000 }
    ];

    const providers = await ServiceProvider.aggregate(pipeline);
    // Populate categories after aggregation
    await ServiceProvider.populate(providers, ['category', 'categories']);

    // Return paginated response
    res.json({
      providers,
      total,
      hasMore: limitNum > 0 ? (skipNum + limitNum) < total : false
    });
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
