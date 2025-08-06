import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.mjs';
import auth from '../middleware/auth.mjs';

const router = express.Router();

// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate tokens
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    const refreshToken = user.generateRefreshToken();
    await user.save();

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    const refreshToken = user.generateRefreshToken();
    await user.save();

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Find user by refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Verify refresh token
    if (!user.verifyRefreshToken(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', auth, async (req, res) => {
  try {
    // Clear refresh token
    req.user.refreshToken = null;
    await req.user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 