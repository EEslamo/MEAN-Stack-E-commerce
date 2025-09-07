const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model
const User = require('./models/User');

async function fixAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@ecommerce.com' });
    console.log('✅ Deleted existing admin user');

    // Create new admin user (password will be hashed by pre-save hook)
    const admin = new User({
      name: 'Admin',
      email: 'admin@ecommerce.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      phone: '01000000000',
      address: 'Cairo, Egypt',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Created new admin user: admin@ecommerce.com / admin123');

    // Test the login
    const testAdmin = await User.findOne({ email: 'admin@ecommerce.com' }).select('+password');
    const isMatch = await testAdmin.comparePassword('admin123');
    console.log('✅ Password verification test:', isMatch ? 'PASSED' : 'FAILED');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdmin();
