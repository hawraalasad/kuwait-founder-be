const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ServiceProvider = require('../models/ServiceProvider');

// Simple hash function for seeded randomization
function seededRandom(seed, id) {
  const str = seed + id.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get all providers with optional filters and pagination (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, priceRange, limit, skip, seed } = req.query;
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

    // Get total count
    const total = await ServiceProvider.countDocuments(queryFilter);

    let providers;

    if (seed) {
      // Seeded random: fetch all, shuffle deterministically, then paginate
      const allProviders = await ServiceProvider.find(queryFilter)
        .populate(['category', 'categories'])
        .lean();

      // Sort by seeded random value (same seed = same order)
      allProviders.sort((a, b) => {
        // Featured items first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by seeded random
        return seededRandom(seed, a._id) - seededRandom(seed, b._id);
      });

      // Apply pagination
      providers = allProviders.slice(skipNum, skipNum + (limitNum || 1000));
    } else {
      // No seed - regular sorted query (fast)
      providers = await ServiceProvider.find(queryFilter)
        .populate(['category', 'categories'])
        .sort({ featured: -1, createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum || 1000)
        .lean();
    }

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
