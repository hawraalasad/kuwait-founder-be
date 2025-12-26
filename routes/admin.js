const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { requireAdmin } = require('../middleware/auth');

// Models
const PlaybookSection = require('../models/PlaybookSection');
const ServiceProvider = require('../models/ServiceProvider');
const Category = require('../models/Category');
const Checklist = require('../models/Checklist');
const AccessLog = require('../models/AccessLog');
const AccessCode = require('../models/AccessCode');

// Configure multer for logo uploads (memory storage for base64 conversion)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 }, // 500KB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Helper function to convert file buffer to base64 data URL
const fileToBase64 = (file) => {
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
};

// Admin authentication
router.post('/auth', async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (password === adminPassword) {
      req.session.isAdmin = true;
      req.session.adminAuthenticatedAt = new Date();
      // Set admin session to 24 hours
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
      return res.json({ success: true, message: 'Admin access granted' });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid admin password.'
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Check admin session
router.get('/check', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.json({
      isAdmin: true,
      authenticatedAt: req.session.adminAuthenticatedAt
    });
  }
  return res.json({ isAdmin: false });
});

// Admin logout
router.post('/logout', (req, res) => {
  req.session.isAdmin = false;
  req.session.adminAuthenticatedAt = null;
  return res.json({ success: true, message: 'Admin logged out' });
});

// ============ SECTIONS ============

// Get all sections (admin)
router.get('/sections', requireAdmin, async (req, res) => {
  try {
    const sections = await PlaybookSection.find().sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Update section
router.put('/sections/:id', requireAdmin, async (req, res) => {
  try {
    const { title, icon, order, content, status } = req.body;
    const section = await PlaybookSection.findByIdAndUpdate(
      req.params.id,
      { title, icon, order, content, status },
      { new: true }
    );
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// ============ PROVIDERS ============

// Get all providers (admin)
router.get('/providers', requireAdmin, async (req, res) => {
  try {
    const providers = await ServiceProvider.find()
      .populate(['category', 'categories'])
      .sort({ createdAt: -1 });
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Create provider
router.post('/providers', requireAdmin, upload.single('logo'), async (req, res) => {
  try {
    // Parse categories from JSON string (sent via FormData)
    let categories = [];
    if (req.body.categories) {
      try {
        categories = JSON.parse(req.body.categories);
      } catch (e) {
        // If it's not JSON, treat as single category
        categories = [req.body.categories];
      }
    } else if (req.body.category) {
      categories = [req.body.category];
    }

    const providerData = {
      ...req.body,
      categories: categories,
      category: categories[0] || null, // Keep backward compatibility
      bestFor: req.body.bestFor ? req.body.bestFor.split(',').map(s => s.trim()) : []
    };
    delete providerData.categories; // Remove string version
    providerData.categories = categories; // Add parsed array

    if (req.file) {
      providerData.logo = fileToBase64(req.file);
    }
    const provider = new ServiceProvider(providerData);
    await provider.save();
    const populated = await provider.populate(['category', 'categories']);
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

// Update provider
router.put('/providers/:id', requireAdmin, upload.single('logo'), async (req, res) => {
  try {
    // Parse categories from JSON string (sent via FormData)
    let categories = [];
    if (req.body.categories) {
      try {
        categories = JSON.parse(req.body.categories);
      } catch (e) {
        // If it's not JSON, treat as single category
        categories = [req.body.categories];
      }
    } else if (req.body.category) {
      categories = [req.body.category];
    }

    const providerData = {
      ...req.body,
      categories: categories,
      category: categories[0] || null, // Keep backward compatibility
      bestFor: req.body.bestFor ? req.body.bestFor.split(',').map(s => s.trim()) : []
    };
    delete providerData.categories; // Remove string version
    providerData.categories = categories; // Add parsed array

    if (req.file) {
      providerData.logo = fileToBase64(req.file);
    }
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      providerData,
      { new: true }
    ).populate(['category', 'categories']);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update provider' });
  }
});

// Delete provider
router.delete('/providers/:id', requireAdmin, async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json({ success: true, message: 'Provider deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete provider' });
  }
});

// ============ CATEGORIES ============

// Get all categories (admin)
router.get('/categories', requireAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name, order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = new Category({ name, slug, order: order || 0 });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { name, order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, order },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    // Check if providers exist with this category
    const providerCount = await ServiceProvider.countDocuments({ category: req.params.id });
    if (providerCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category. ${providerCount} provider(s) are using it.`
      });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============ CHECKLISTS ============

// Get all checklists (admin)
router.get('/checklists', requireAdmin, async (req, res) => {
  try {
    const checklists = await Checklist.find().sort({ order: 1 });
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checklists' });
  }
});

// Create checklist
router.post('/checklists', requireAdmin, async (req, res) => {
  try {
    const { title, items, order } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const checklist = new Checklist({
      title,
      slug,
      items: items || [],
      order: order || 0
    });
    await checklist.save();
    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checklist' });
  }
});

// Update checklist
router.put('/checklists/:id', requireAdmin, async (req, res) => {
  try {
    const { title, items, order } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const checklist = await Checklist.findByIdAndUpdate(
      req.params.id,
      { title, slug, items, order },
      { new: true }
    );
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update checklist' });
  }
});

// Delete checklist
router.delete('/checklists/:id', requireAdmin, async (req, res) => {
  try {
    const checklist = await Checklist.findByIdAndDelete(req.params.id);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }
    res.json({ success: true, message: 'Checklist deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete checklist' });
  }
});

// ============ ACCESS LOG ============

// Get access log
router.get('/access-log', requireAdmin, async (req, res) => {
  try {
    const logs = await AccessLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch access log' });
  }
});

// Clear access log
router.delete('/access-log', requireAdmin, async (req, res) => {
  try {
    await AccessLog.deleteMany({});
    res.json({ success: true, message: 'Access log cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear access log' });
  }
});

// ============ ACCESS CODES ============

// Get all access codes
router.get('/access-codes', requireAdmin, async (req, res) => {
  try {
    const codes = await AccessCode.find().sort({ createdAt: -1 });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch access codes' });
  }
});

// Create access code
router.post('/access-codes', requireAdmin, async (req, res) => {
  try {
    const { code, customerName, customerPhone, customerEmail, notes, maxUsage, expiresAt } = req.body;

    // Check if code already exists
    const existing = await AccessCode.findOne({ code: code.trim() });
    if (existing) {
      return res.status(400).json({ error: 'This access code already exists' });
    }

    const accessCode = new AccessCode({
      code: code.trim(),
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      notes: notes || '',
      maxUsage: maxUsage || 0,
      expiresAt: expiresAt || null
    });

    await accessCode.save();
    res.status(201).json(accessCode);
  } catch (error) {
    console.error('Create access code error:', error);
    res.status(500).json({ error: 'Failed to create access code' });
  }
});

// Generate random access code
router.post('/access-codes/generate', requireAdmin, async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, notes, maxUsage, expiresAt } = req.body;

    // Generate a unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      // Generate 8 character alphanumeric code
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await AccessCode.findOne({ code });
      if (!existing) {
        isUnique = true;
      }
    }

    const accessCode = new AccessCode({
      code,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      notes: notes || '',
      maxUsage: maxUsage || 0,
      expiresAt: expiresAt || null
    });

    await accessCode.save();
    res.status(201).json(accessCode);
  } catch (error) {
    console.error('Generate access code error:', error);
    res.status(500).json({ error: 'Failed to generate access code' });
  }
});

// Update access code
router.put('/access-codes/:id', requireAdmin, async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, notes, isActive, maxUsage, expiresAt } = req.body;

    const accessCode = await AccessCode.findByIdAndUpdate(
      req.params.id,
      {
        customerName,
        customerPhone,
        customerEmail,
        notes,
        isActive,
        maxUsage,
        expiresAt
      },
      { new: true }
    );

    if (!accessCode) {
      return res.status(404).json({ error: 'Access code not found' });
    }

    res.json(accessCode);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update access code' });
  }
});

// Delete access code
router.delete('/access-codes/:id', requireAdmin, async (req, res) => {
  try {
    const accessCode = await AccessCode.findByIdAndDelete(req.params.id);
    if (!accessCode) {
      return res.status(404).json({ error: 'Access code not found' });
    }
    res.json({ success: true, message: 'Access code deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete access code' });
  }
});

// Toggle access code status
router.patch('/access-codes/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const accessCode = await AccessCode.findById(req.params.id);
    if (!accessCode) {
      return res.status(404).json({ error: 'Access code not found' });
    }

    accessCode.isActive = !accessCode.isActive;
    await accessCode.save();

    res.json(accessCode);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle access code' });
  }
});

// ============ DASHBOARD STATS ============

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [providersCount, categoriesCount, accessCodesCount, activeCodesCount, recentLogs] = await Promise.all([
      ServiceProvider.countDocuments(),
      Category.countDocuments(),
      AccessCode.countDocuments(),
      AccessCode.countDocuments({ isActive: true }),
      AccessLog.find().sort({ timestamp: -1 }).limit(10)
    ]);
    res.json({
      providersCount,
      categoriesCount,
      accessCodesCount,
      activeCodesCount,
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
