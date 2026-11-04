const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserData = require('../models/UserData');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/setup
router.post('/setup', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(400).json({ error: 'Setup already complete. Please log in.' });
    }

    const { email, password, privacyPolicyAccepted } = req.body;
    if (privacyPolicyAccepted !== true) {
      return res.status(400).json({ error: 'You must agree to the Privacy Policy.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'admin',
      privacyPolicyAcceptedAt: new Date()
    });

    await UserData.create({ user: user._id });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/privacy-policy/accept
router.post('/privacy-policy/accept', protect, async (req, res) => {
  if (req.body.accepted !== true) {
    return res.status(400).json({ error: 'Privacy Policy acceptance is required.' });
  }

  try {
    const acceptedAt = new Date();
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, privacyPolicyAcceptedAt: null },
      { $set: { privacyPolicyAcceptedAt: acceptedAt } },
      { new: true }
    );
    const user = updatedUser || await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;