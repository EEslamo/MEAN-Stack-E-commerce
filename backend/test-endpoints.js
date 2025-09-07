const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Testing E-commerce Backend Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data.message);

    // Test 2: Get Categories
    console.log('\n2. Testing Categories...');
    const categories = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Categories:', categories.data.data.length, 'categories found');

    // Test 3: Get Products
    console.log('\n3. Testing Products...');
    const products = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Products:', products.data.data.products.length, 'products found');

    // Test 4: User Registration
    console.log('\n4. Testing User Registration...');
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '01012345678',
      address: 'Cairo, Egypt'
    };
    const register = await axios.post(`${BASE_URL}/auth/register`, userData);
    console.log('✅ User Registration:', register.data.message);

    // Test 5: User Login
    console.log('\n5. Testing User Login...');
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123'
    };
    const login = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ User Login:', login.data.message);
    const userToken = login.data.token;

    // Test 6: Admin Login
    console.log('\n6. Testing Admin Login...');
    const adminData = {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    };
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, adminData);
    console.log('✅ Admin Login:', adminLogin.data.message);
    const adminToken = adminLogin.data.token;

    // Test 7: Get User Profile (with token)
    console.log('\n7. Testing User Profile...');
    const profile = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ User Profile:', profile.data.user.name);

    // Test 8: Get Cart (guest)
    console.log('\n8. Testing Guest Cart...');
    const guestCart = await axios.get(`${BASE_URL}/cart`);
    console.log('✅ Guest Cart:', guestCart.data.data.items.length, 'items');

    // Test 9: Get Cart (authenticated)
    console.log('\n9. Testing Authenticated Cart...');
    const userCart = await axios.get(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ User Cart:', userCart.data.data.items.length, 'items');

    // Test 10: Admin Dashboard
    console.log('\n10. Testing Admin Dashboard...');
    const dashboard = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Dashboard:', dashboard.data.data.stats.totalProducts, 'products');

    // Test 11: Contact Form
    console.log('\n11. Testing Contact Form...');
    const contactData = {
      name: 'Test Contact',
      email: 'contact@example.com',
      category: 'question',
      message: 'This is a test message'
    };
    const contact = await axios.post(`${BASE_URL}/contact`, contactData);
    console.log('✅ Contact Form:', contact.data.message);

    // Test 12: Testimonials
    console.log('\n12. Testing Testimonials...');
    const testimonials = await axios.get(`${BASE_URL}/testimonials`);
    console.log('✅ Testimonials:', testimonials.data.data.testimonials.length, 'testimonials');

    console.log('\n🎉 All endpoints are working correctly!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Health Check');
    console.log('- ✅ Categories API');
    console.log('- ✅ Products API');
    console.log('- ✅ User Registration');
    console.log('- ✅ User Login');
    console.log('- ✅ Admin Login');
    console.log('- ✅ User Profile');
    console.log('- ✅ Guest Cart');
    console.log('- ✅ Authenticated Cart');
    console.log('- ✅ Admin Dashboard');
    console.log('- ✅ Contact Form');
    console.log('- ✅ Testimonials');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testEndpoints();
