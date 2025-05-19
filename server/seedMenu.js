const mongoose = require('mongoose');
const MenuItem = require('./models/menu.Model');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kapepos')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// Function to seed the database with products
async function seedMenuItems() {
  try {
    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Read the products.json file
    const productsPath = path.join(__dirname, '..', 'KapePOS', 'src', 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    // Transform products to menu items format
    const menuItems = [];
    
    productsData.forEach(category => {
      const categoryName = mapCategoryToSchema(category.category);
      
      category.items.forEach(item => {
        // Create base menu item
        const menuItem = {
          name: item.name,
          price: item.price,
          category: categoryName,
          image: '', // Default empty image
          description: generateDescription(item),
          available: item.stock > 0,
          
          // Store additional fields in a subdocument to preserve the original data structure
          productDetails: {
            originalId: item.id,
            stock: item.stock,
            options: item.options || [],
            addons: item.addons || []
          }
        };
        
        menuItems.push(menuItem);
      });
    });

    // Insert menu items into MongoDB
    const result = await MenuItem.insertMany(menuItems);
    console.log(`${result.length} menu items seeded successfully`);
    
    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Helper function to map product categories to menu item categories
function mapCategoryToSchema(categoryName) {
  const categoryMap = {
    'Hot Coffees': 'coffee',
    'Cold Coffees': 'coffee',
    'Teas': 'tea',
    'Pastries': 'pastry'
  };
  
  return categoryMap[categoryName] || 'other';
}

// Generate a simple description for items that don't have one
function generateDescription(item) {
  const name = item.name;
  
  const descriptions = {
    'Espresso': 'Rich and full-bodied espresso shot.',
    'Latte': 'Smooth espresso with steamed milk.',
    'Cappuccino': 'Equal parts espresso, steamed milk, and milk foam.',
    'Americano': 'Espresso diluted with hot water.',
    'Iced Latte': 'Chilled espresso with cold milk over ice.',
    'Cold Brew': 'Coffee brewed with cold water for a smooth taste.',
    'Green Tea': 'Delicate green tea leaves steeped to perfection.',
    'Chai Latte': 'Spiced black tea with steamed milk.',
    'Croissant': 'Buttery, flaky French pastry.',
    'Muffin': 'Moist, cake-like breakfast treat.',
    'Scone': 'Lightly sweetened baked good with a crumbly texture.',
    'Cookie': 'Freshly baked, soft and chewy cookie.',
    'Ensaymada': 'Filipino sweet pastry topped with butter, sugar, and cheese.'
  };
  
  return descriptions[name] || `Delicious ${name.toLowerCase()}.`;
}

// Update the menu.Model.js file to include productDetails
// You would need to modify your menu.Model.js to include this:
/*
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['coffee', 'tea', 'pastry', 'sandwich', 'other']
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  productDetails: {
    originalId: String,
    stock: Number,
    options: Array,
    addons: Array
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
*/

// Run the seeding function
seedMenuItems();