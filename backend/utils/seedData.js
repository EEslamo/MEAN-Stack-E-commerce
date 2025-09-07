const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

const initializeData = async () => {
  try {
    console.log('Initializing database...');

    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin',
        email: 'admin@ecommerce.com',
        password: hashedPassword,
        phone: '01000000000',
        address: 'Cairo, Egypt',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Default admin created: admin@ecommerce.com / admin123');
    }

    // Check if categories exist
    const categoriesExist = await Category.findOne();
    if (!categoriesExist) {
      // Create main categories
      const menCategory = new Category({ 
        name: 'Men',
        description: 'Men\'s clothing and accessories',
        sortOrder: 1
      });
      const womenCategory = new Category({ 
        name: 'Women',
        description: 'Women\'s clothing and accessories',
        sortOrder: 2
      });
      
      await menCategory.save();
      await womenCategory.save();

      // Create subcategories for Men
      const menSubcategories = [
        { name: 'Shirts', description: 'Men\'s shirts', sortOrder: 1 },
        { name: 'T-Shirts', description: 'Men\'s t-shirts', sortOrder: 2 },
        { name: 'Pants', description: 'Men\'s pants', sortOrder: 3 }
      ];
      
      for (const subcat of menSubcategories) {
        const subcategory = new Category({
          name: subcat.name,
          description: subcat.description,
          parentCategory: menCategory._id,
          sortOrder: subcat.sortOrder
        });
        await subcategory.save();
      }

      // Create subcategories for Women
      const womenSubcategories = [
        { name: 'Shirts', description: 'Women\'s shirts', sortOrder: 1 },
        { name: 'T-Shirts', description: 'Women\'s t-shirts', sortOrder: 2 },
        { name: 'Pants', description: 'Women\'s pants', sortOrder: 3 }
      ];
      
      for (const subcat of womenSubcategories) {
        const subcategory = new Category({
          name: subcat.name,
          description: subcat.description,
          parentCategory: womenCategory._id,
          sortOrder: subcat.sortOrder
        });
        await subcategory.save();
      }

      console.log('✅ Default categories created');
    }

    // Create sample products if none exist
    const productsExist = await Product.findOne();
    if (!productsExist) {
      const categories = await Category.find({ parentCategory: { $ne: null } });
      
      if (categories.length > 0) {
        const sampleProducts = [
          {
            name: 'Classic White T-Shirt',
            description: 'Comfortable cotton t-shirt perfect for everyday wear',
            price: 150,
            category: categories[0]._id,
            stock: 50,
            tags: ['cotton', 'casual', 'white'],
            isFeatured: true
          },
          {
            name: 'Blue Denim Jeans',
            description: 'High-quality denim jeans with perfect fit',
            price: 300,
            category: categories[2]._id,
            stock: 25,
            tags: ['denim', 'jeans', 'blue'],
            isFeatured: true
          },
          {
            name: 'Striped Casual Shirt',
            description: 'Elegant striped shirt for casual occasions',
            price: 200,
            category: categories[0]._id,
            stock: 30,
            tags: ['striped', 'casual', 'shirt']
          }
        ];

        for (const productData of sampleProducts) {
          const product = new Product(productData);
          await product.save();
        }

        console.log('✅ Sample products created');
      }
    }

    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Error initializing data:', error);
  }
};

module.exports = initializeData;
