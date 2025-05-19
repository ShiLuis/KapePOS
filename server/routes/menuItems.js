const express = require('express');
const router = express.Router();
const MenuItem = require('../models/menu.Model'); // Fixed path to the model
const { body, validationResult } = require('express-validator');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new menu item
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').isIn(['coffee', 'tea', 'pastry', 'sandwich', 'other']).withMessage('Invalid category')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const menuItem = new MenuItem({
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    image: req.body.image || '',
    description: req.body.description || ''
  });

  try {
    const newMenuItem = await menuItem.save();
    res.status(201).json(newMenuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a single menu item
router.get('/:id', getMenuItem, (req, res) => {
  res.json(res.menuItem);
});

// Update a menu item
router.patch('/:id', getMenuItem, async (req, res) => {
  if (req.body.name) res.menuItem.name = req.body.name;
  if (req.body.price) res.menuItem.price = req.body.price;
  if (req.body.category) res.menuItem.category = req.body.category;
  if (req.body.image !== undefined) res.menuItem.image = req.body.image;
  if (req.body.description !== undefined) res.menuItem.description = req.body.description;
  if (req.body.available !== undefined) res.menuItem.available = req.body.available;
  
  res.menuItem.updatedAt = Date.now();

  try {
    const updatedMenuItem = await res.menuItem.save();
    res.json(updatedMenuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update stock for a specific menu item
router.patch('/:id/stock', getMenuItem, async (req, res) => {
  try {
    // Check if productDetails exists, if not create it
    if (!res.menuItem.productDetails) {
      res.menuItem.productDetails = {};
    }
    
    // Update the stock value
    res.menuItem.productDetails.stock = req.body.stock;
    
    // Update the timestamp
    res.menuItem.updatedAt = Date.now();
    
    // Save the updated menu item
    const updatedMenuItem = await res.menuItem.save();
    res.json(updatedMenuItem);
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a menu item
router.delete('/:id', getMenuItem, async (req, res) => {
  try {
    await MenuItem.deleteOne({ _id: res.menuItem._id });
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get menu item by ID
async function getMenuItem(req, res, next) {
  let menuItem;
  try {
    menuItem = await MenuItem.findById(req.params.id);
    if (menuItem == null) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.menuItem = menuItem;
  next();
}

module.exports = router;