const express = require('express');
const UserData = require('../models/UserData');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

// @route   GET /api/data
// @desc    Get current user's data
router.get('/', async (req, res) => {
  try {
    const data = await UserData.findOne({ user: req.user._id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/data
// @desc    Update current user's data
router.put('/', async (req, res) => {
  try {
    // req.body should contain { schedule, todos, categories, bookmarkTabs }
    const updatedData = await UserData.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;