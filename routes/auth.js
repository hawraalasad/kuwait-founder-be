const express = require('express');
const router = express.Router();
const AccessCode = require('../models/AccessCode');
const AccessLog = require('../models/AccessLog');

// Verify access password and create session
router.post('/access', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    // Find the access code in database
    const accessCode = await AccessCode.findOne({ code: password.trim() });

    // Log the access attempt
    const logEntry = new AccessLog({
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || '',
      codeUsed: password.trim(),
      accessCode: accessCode ? accessCode._id : null,
      customerName: accessCode ? accessCode.customerName : '',
      success: false
    });

    // Check if code exists and is valid
    if (!accessCode) {
      await logEntry.save();
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please try again.'
      });
    }

    // Check if code is valid (active, not expired, within usage limit)
    if (!accessCode.isValid()) {
      await logEntry.save();

      // Provide specific error message
      if (!accessCode.isActive) {
        return res.status(401).json({
          success: false,
          error: 'This access code has been deactivated.'
        });
      }
      if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
        return res.status(401).json({
          success: false,
          error: 'This access code has expired.'
        });
      }
      if (accessCode.maxUsage > 0 && accessCode.usageCount >= accessCode.maxUsage) {
        return res.status(401).json({
          success: false,
          error: 'This access code has reached its usage limit.'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please try again.'
      });
    }

    // Success! Record usage and create session
    await accessCode.recordUsage();

    logEntry.success = true;
    await logEntry.save();

    req.session.isAuthenticated = true;
    req.session.authenticatedAt = new Date();
    req.session.accessCodeId = accessCode._id;
    req.session.customerName = accessCode.customerName;

    return res.json({
      success: true,
      message: 'Access granted',
      customerName: accessCode.customerName
    });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Check if session is valid
router.get('/check', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    return res.json({
      authenticated: true,
      authenticatedAt: req.session.authenticatedAt,
      customerName: req.session.customerName
    });
  }
  return res.json({ authenticated: false });
});

// Logout - destroy session
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
