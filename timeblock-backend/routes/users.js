const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserData = require('../models/UserData');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();
// All routes here require valid token AND admin role
router.use(protect, admin);

// @route   GET /api/users
// @desc    Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Create a new user
router.post('/', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await UserData.create({ user: user._id });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin' });
      }
    }

    await UserData.findOneAndDelete({ user: user._id });
    await user.deleteOne();

    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;