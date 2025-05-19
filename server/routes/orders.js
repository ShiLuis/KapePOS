const express = require('express');
const router = express.Router();
const Order = require('../models/order.Model');
const { body, validationResult } = require('express-validator');

// Get daily summary - PUT THIS FIRST so it matches before the :id route
router.get('/summary/daily', async (req, res) => {
  try {
    // Parse date or use today
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    
    // Set to beginning of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to end of day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find orders for that day
    const orders = await Order.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Calculate summary data
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Count payment methods
    const paymentMethodCounts = orders.reduce((counts, order) => {
      counts[order.paymentMethod] = (counts[order.paymentMethod] || 0) + 1;
      return counts;
    }, {});
    
    // Calculate item popularity
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    
    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 items
    
    res.json({
      date: targetDate,
      totalOrders,
      totalSales,
      paymentMethodCounts,
      popularItems,
      orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    // Add query parameters for filtering
    const query = {};
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }

    const orders = await Order.find(query).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order by ID - PUT THIS AFTER the more specific routes
router.get('/:id', getOrder, (req, res) => {
  res.json(res.order);
});

// Create a new order
router.post('/', [
  body('items').isArray().withMessage('Items must be an array'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('paymentMethod').isIn(['Cash', 'Card']).withMessage('Invalid payment method')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const order = new Order({
    orderNumber: `ORD-${Date.now()}`,
    items: req.body.items,
    totalAmount: req.body.totalAmount,
    paymentMethod: req.body.paymentMethod,
    date: req.body.date || new Date(),
    createdBy: req.body.createdBy
  });

  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Middleware to get order by ID
async function getOrder(req, res, next) {
  let order;
  try {
    order = await Order.findById(req.params.id);
    if (order == null) {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.order = order;
  next();
}

module.exports = router;