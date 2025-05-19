const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// Get all users
router.get('/', async (req, res) => {
  try {
    // For security, don't send password in response
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new user
router.post('/', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'cashier']).withMessage('Invalid role')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if username already exists
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
  
    // Create new user
    const user = new User({
      username: req.body.username,
      password: req.body.password, // Will be hashed by pre-save hook in user model
      role: req.body.role,
      active: true
    });
  
    const newUser = await user.save();
    
    // Don't return the password in response
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      active: newUser.active,
      createdAt: newUser.createdAt
    };
  
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a user
router.patch('/:id', getUser, async (req, res) => {
  // Only update fields that were actually passed
  if (req.body.username) {
    // Check if new username already exists (if changing username)
    if (req.body.username !== res.user.username) {
      try {
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
          return res.status(409).json({ message: 'Username already exists' });
        }
        res.user.username = req.body.username;
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
    }
  }
  
  if (req.body.password) {
    // Password will be hashed by pre-save hook
    res.user.password = req.body.password;
  }
  
  if (req.body.role) {
    res.user.role = req.body.role;
  }
  
  if (req.body.active !== undefined) {
    res.user.active = req.body.active;
  }

  try {
    const updatedUser = await res.user.save();
    
    // Don't return the password in response
    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt
    };
    
    res.json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    // Check if username exists
    const user = await User.findOne({ username: req.body.username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check if the account is active
    if (!user.active) {
      return res.status(403).json({ message: 'Account is disabled. Please contact the administrator.' });
    }
    
    // Compare passwords
    const isPasswordValid = await user.comparePassword(req.body.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Don't send the password in the response
    const userResponse = {
      _id: user._id,
      username: user.username,
      role: user.role,
      active: user.active
    };
    
    // Return user data
    res.json({ message: 'Login successful', user: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to get user by ID
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}

module.exports = router;