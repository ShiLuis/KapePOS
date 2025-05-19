const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/kapepos')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Import routes
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users'); // Check this import - should match your file name

// Use routes
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); // This should match the import above

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});