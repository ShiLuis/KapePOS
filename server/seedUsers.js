
const mongoose = require('mongoose');
const User = require('./models/user.Model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kapepos')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// User data from users.json
const users = [
  {
    username: "admin",
    password: "admin123",
    role: "admin"
  },
  {
    username: "cashier",
    password: "cashier123",
    role: "cashier"
  }
];

// Function to seed the database with users
async function seedUsers() {
  try {
    // Clear existing users if needed
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create users in the database
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users seeded successfully`);
    
    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error seeding users:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seeding function
seedUsers();