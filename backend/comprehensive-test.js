const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let userToken = '';
let adminToken = '';

async function comprehensiveTest() {
  console.log('🧪 COMPREHENSIVE BACKEND TESTING - ALL ENDPOINTS\n');
  console.log('=' .repeat(60));

  try {
    // ==================== AUTHENTICATION ENDPOINTS ====================
    console.log('\n🔐 AUTHENTICATION ENDPOINTS');
    console.log('-'.repeat(40));

    // 1. User Registration
    console.log('1. Testing User Registration...');
    const timestamp = Date.now();
    const userData = {
      name: 'Test User',
      email: `testuser${timestamp}@example.com`,
      password: 'password123',
      phone: '01012345678',
      address: 'Cairo, Egypt'
    };
    const register = await axios.post(`${BASE_URL}/auth/register`, userData);
    console.log('   ✅ User Registration:', register.data.message);
    userToken = register.data.token;

    // 2. User Login
    console.log('2. Testing User Login...');
    const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: userData.email,
      password: 'password123'
    });
    console.log('   ✅ User Login:', userLogin.data.message);

    // 3. Admin Login
    console.log('3. Testing Admin Login...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    console.log('   ✅ Admin Login:', adminLogin.data.message);
    adminToken = adminLogin.data.token;

    // 4. Get User Profile
    console.log('4. Testing Get User Profile...');
    const profile = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ User Profile:', profile.data.user.name);

    // 5. Update User Profile
    console.log('5. Testing Update User Profile...');
    const updateProfile = await axios.put(`${BASE_URL}/auth/profile`, {
      name: 'Updated Test User',
      phone: '01087654321',
      address: 'Alexandria, Egypt'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Profile Updated:', updateProfile.data.message);

    // 6. Change Password
    console.log('6. Testing Change Password...');
    const changePassword = await axios.put(`${BASE_URL}/auth/change-password`, {
      currentPassword: 'password123',
      newPassword: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Password Changed:', changePassword.data.message);

    // 7. Verify Token
    console.log('7. Testing Token Verification...');
    const verifyToken = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Token Verified:', verifyToken.data.message);

    // ==================== PRODUCTS ENDPOINTS ====================
    console.log('\n🛍️ PRODUCTS ENDPOINTS');
    console.log('-'.repeat(40));

    // 8. Get All Products
    console.log('8. Testing Get All Products...');
    const products = await axios.get(`${BASE_URL}/products`);
    console.log('   ✅ Products Retrieved:', products.data.data.products.length, 'products');

    // 9. Get Featured Products
    console.log('9. Testing Get Featured Products...');
    const featuredProducts = await axios.get(`${BASE_URL}/products/featured`);
    console.log('   ✅ Featured Products:', featuredProducts.data.data.length, 'products');

    // 10. Get Single Product
    console.log('10. Testing Get Single Product...');
    const productId = products.data.data.products[0]._id;
    const singleProduct = await axios.get(`${BASE_URL}/products/${productId}`);
    console.log('   ✅ Single Product:', singleProduct.data.data.name);

    // 11. Get Related Products
    console.log('11. Testing Get Related Products...');
    const relatedProducts = await axios.get(`${BASE_URL}/products/${productId}/related`);
    console.log('   ✅ Related Products:', relatedProducts.data.data.length, 'products');

    // 12. Create Product (Admin)
    console.log('12. Testing Create Product (Admin)...');
    const newProduct = await axios.post(`${BASE_URL}/products`, {
      name: 'Test Product',
      description: 'This is a test product',
      price: 250,
      category: products.data.data.products[0].category._id,
      stock: 10,
      tags: 'test,product'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Product Created:', newProduct.data.data.name);

    // 13. Update Product (Admin)
    console.log('13. Testing Update Product (Admin)...');
    const updatedProduct = await axios.put(`${BASE_URL}/products/${newProduct.data.data._id}`, {
      name: 'Updated Test Product',
      price: 300,
      stock: 15
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Product Updated:', updatedProduct.data.data.name);

    // ==================== CATEGORIES ENDPOINTS ====================
    console.log('\n📂 CATEGORIES ENDPOINTS');
    console.log('-'.repeat(40));

    // 14. Get All Categories
    console.log('14. Testing Get All Categories...');
    const categories = await axios.get(`${BASE_URL}/categories`);
    console.log('   ✅ Categories Retrieved:', categories.data.data.length, 'categories');

    // 15. Get Main Categories
    console.log('15. Testing Get Main Categories...');
    const mainCategories = await axios.get(`${BASE_URL}/categories/main`);
    console.log('   ✅ Main Categories:', mainCategories.data.data.length, 'categories');

    // 16. Get Subcategories
    console.log('16. Testing Get Subcategories...');
    const mainCategoryId = mainCategories.data.data[0]._id;
    const subcategories = await axios.get(`${BASE_URL}/categories/subcategories/${mainCategoryId}`);
    console.log('   ✅ Subcategories:', subcategories.data.data.length, 'categories');

    // 17. Get Single Category
    console.log('17. Testing Get Single Category...');
    const singleCategory = await axios.get(`${BASE_URL}/categories/${mainCategoryId}`);
    console.log('   ✅ Single Category:', singleCategory.data.data.name);

    // 18. Create Category (Admin)
    console.log('18. Testing Create Category (Admin)...');
    const newCategory = await axios.post(`${BASE_URL}/categories`, {
      name: 'Test Category',
      description: 'This is a test category',
      parentCategory: mainCategoryId
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Category Created:', newCategory.data.data.name);

    // ==================== CART ENDPOINTS ====================
    console.log('\n🛒 CART ENDPOINTS');
    console.log('-'.repeat(40));

    // 19. Get Guest Cart
    console.log('19. Testing Get Guest Cart...');
    const guestCart = await axios.get(`${BASE_URL}/cart?sessionId=test-session-123`);
    console.log('   ✅ Guest Cart:', guestCart.data.data.items.length, 'items');

    // 20. Add to Guest Cart
    console.log('20. Testing Add to Guest Cart...');
    const addToGuestCart = await axios.post(`${BASE_URL}/cart/add`, {
      productId: productId,
      quantity: 2,
      sessionId: 'test-session-123'
    });
    console.log('   ✅ Added to Guest Cart:', addToGuestCart.data.message);

    // 21. Get User Cart
    console.log('21. Testing Get User Cart...');
    const userCart = await axios.get(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ User Cart:', userCart.data.data.items.length, 'items');

    // 22. Add to User Cart
    console.log('22. Testing Add to User Cart...');
    const addToUserCart = await axios.post(`${BASE_URL}/cart/add`, {
      productId: productId,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Added to User Cart:', addToUserCart.data.message);

    // 23. Update Cart Item
    console.log('23. Testing Update Cart Item...');
    const updateCartItem = await axios.put(`${BASE_URL}/cart/${productId}`, {
      quantity: 3
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Cart Item Updated:', updateCartItem.data.message);

    // 24. Merge Cart
    console.log('24. Testing Merge Cart...');
    const mergeCart = await axios.post(`${BASE_URL}/cart/merge`, {
      sessionId: 'test-session-123'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Cart Merged:', mergeCart.data.message);

    // ==================== ORDERS ENDPOINTS ====================
    console.log('\n📦 ORDERS ENDPOINTS');
    console.log('-'.repeat(40));

    // 25. Create Order
    console.log('25. Testing Create Order...');
    const orderData = {
      items: [{
        productId: productId,
        quantity: 2
      }],
      customerInfo: {
        name: 'Test User',
        email: userData.email,
        phone: '01012345678',
        address: 'Cairo, Egypt'
      }
    };
    const createOrder = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Order Created:', createOrder.data.data.orderNumber);

    // 26. Get User Orders
    console.log('26. Testing Get User Orders...');
    const userOrders = await axios.get(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ User Orders:', userOrders.data.data.orders.length, 'orders');

    // 27. Get Single Order
    console.log('27. Testing Get Single Order...');
    const orderId = createOrder.data.data._id;
    const singleOrder = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Single Order:', singleOrder.data.data.orderNumber);

    // 28. Update Order Status (Admin)
    console.log('28. Testing Update Order Status (Admin)...');
    const updateOrderStatus = await axios.put(`${BASE_URL}/orders/${orderId}/status`, {
      status: 'preparing',
      note: 'Order is being prepared'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Order Status Updated:', updateOrderStatus.data.data.status);

    // 29. Get Order Stats (Admin)
    console.log('29. Testing Get Order Stats (Admin)...');
    const orderStats = await axios.get(`${BASE_URL}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Order Stats:', orderStats.data.data.summary.totalOrders, 'total orders');

    // ==================== TESTIMONIALS ENDPOINTS ====================
    console.log('\n⭐ TESTIMONIALS ENDPOINTS');
    console.log('-'.repeat(40));

    // 30. Get Testimonials
    console.log('30. Testing Get Testimonials...');
    const testimonials = await axios.get(`${BASE_URL}/testimonials`);
    console.log('   ✅ Testimonials:', testimonials.data.data.testimonials.length, 'testimonials');

    // 31. Create Testimonial
    console.log('31. Testing Create Testimonial...');
    const newTestimonial = await axios.post(`${BASE_URL}/testimonials`, {
      content: 'This is a great product! Highly recommended.',
      rating: 5
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Testimonial Created:', newTestimonial.data.message);

    // 32. Get User Testimonial
    console.log('32. Testing Get User Testimonial...');
    const userTestimonial = await axios.get(`${BASE_URL}/testimonials/my`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ User Testimonial:', userTestimonial.data.data.content.substring(0, 30) + '...');

    // 33. Update Testimonial
    console.log('33. Testing Update Testimonial...');
    const updateTestimonial = await axios.put(`${BASE_URL}/testimonials/my`, {
      content: 'Updated testimonial - even better than before!',
      rating: 5
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Testimonial Updated:', updateTestimonial.data.message);

    // 34. Get Pending Testimonials (Admin)
    console.log('34. Testing Get Pending Testimonials (Admin)...');
    const pendingTestimonials = await axios.get(`${BASE_URL}/testimonials/admin/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Pending Testimonials:', pendingTestimonials.data.data.testimonials.length, 'testimonials');

    // 35. Approve Testimonial (Admin)
    console.log('35. Testing Approve Testimonial (Admin)...');
    const testimonialId = userTestimonial.data.data._id;
    const approveTestimonial = await axios.put(`${BASE_URL}/testimonials/admin/${testimonialId}`, {
      isApproved: true
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Testimonial Approved:', approveTestimonial.data.message);

    // ==================== CONTACT ENDPOINTS ====================
    console.log('\n📞 CONTACT ENDPOINTS');
    console.log('-'.repeat(40));

    // 36. Submit Contact Form
    console.log('36. Testing Submit Contact Form...');
    const contactData = {
      name: 'Test Contact',
      email: 'contact@example.com',
      category: 'question',
      message: 'This is a test contact message'
    };
    const submitContact = await axios.post(`${BASE_URL}/contact`, contactData);
    console.log('   ✅ Contact Form Submitted:', submitContact.data.message);

    // 37. Get Contacts (Admin)
    console.log('37. Testing Get Contacts (Admin)...');
    const adminContacts = await axios.get(`${BASE_URL}/contact`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Admin Contacts:', adminContacts.data.data.contacts.length, 'contacts');

    // 38. Update Contact Status (Admin)
    console.log('38. Testing Update Contact Status (Admin)...');
    const contactId = adminContacts.data.data.contacts[0]._id;
    const updateContact = await axios.put(`${BASE_URL}/contact/${contactId}`, {
      isResolved: true,
      response: 'Thank you for your message. We will get back to you soon.'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Contact Status Updated:', updateContact.data.message);

    // ==================== ADMIN ENDPOINTS ====================
    console.log('\n👑 ADMIN ENDPOINTS');
    console.log('-'.repeat(40));

    // 39. Admin Dashboard
    console.log('39. Testing Admin Dashboard...');
    const adminDashboard = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Admin Dashboard:', adminDashboard.data.data.stats.totalProducts, 'products');

    // 40. Sales Report
    console.log('40. Testing Sales Report...');
    const salesReport = await axios.get(`${BASE_URL}/admin/reports/sales`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Sales Report:', salesReport.data.data.length, 'data points');

    // 41. Product Sales Report
    console.log('41. Testing Product Sales Report...');
    const productSalesReport = await axios.get(`${BASE_URL}/admin/reports/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Product Sales Report:', productSalesReport.data.data.length, 'products');

    // 42. User Stats Report
    console.log('42. Testing User Stats Report...');
    const userStatsReport = await axios.get(`${BASE_URL}/admin/reports/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ User Stats Report:', userStatsReport.data.data.summary.totalUsers, 'users');

    // 43. Inventory Report
    console.log('43. Testing Inventory Report...');
    const inventoryReport = await axios.get(`${BASE_URL}/admin/reports/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Inventory Report:', inventoryReport.data.data.summary.totalProducts, 'products');

    // ==================== CLEANUP ====================
    console.log('\n🧹 CLEANUP');
    console.log('-'.repeat(40));

    // 44. Delete Test Product (Admin)
    console.log('44. Testing Delete Product (Admin)...');
    const deleteProduct = await axios.delete(`${BASE_URL}/products/${newProduct.data.data._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Product Deleted:', deleteProduct.data.message);

    // 45. Delete Test Category (Admin)
    console.log('45. Testing Delete Category (Admin)...');
    const deleteCategory = await axios.delete(`${BASE_URL}/categories/${newCategory.data.data._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Category Deleted:', deleteCategory.data.message);

    // 46. Delete Testimonial
    console.log('46. Testing Delete Testimonial...');
    const deleteTestimonial = await axios.delete(`${BASE_URL}/testimonials/my`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('   ✅ Testimonial Deleted:', deleteTestimonial.data.message);

    // ==================== FINAL SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 TEST SUMMARY:');
    console.log('   ✅ Authentication Endpoints: 7/7 working');
    console.log('   ✅ Products Endpoints: 6/6 working');
    console.log('   ✅ Categories Endpoints: 5/5 working');
    console.log('   ✅ Cart Endpoints: 6/6 working');
    console.log('   ✅ Orders Endpoints: 5/5 working');
    console.log('   ✅ Testimonials Endpoints: 6/6 working');
    console.log('   ✅ Contact Endpoints: 3/3 working');
    console.log('   ✅ Admin Endpoints: 5/5 working');
    console.log('   ✅ Cleanup Operations: 3/3 working');
    console.log('\n🚀 TOTAL: 46/46 ENDPOINTS WORKING PERFECTLY!');
    console.log('\n✨ Backend is 100% ready for Angular frontend integration!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

comprehensiveTest();
