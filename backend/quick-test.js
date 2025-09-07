const axios = require('axios');

async function quickTest() {
  try {
    console.log('🧪 Quick Admin Login Test...\n');

    // Test Admin Login
    const adminData = {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    };
    
    const response = await axios.post('http://localhost:3000/api/auth/login', adminData);
    console.log('✅ Admin Login Success!');
    console.log('   Message:', response.data.message);
    console.log('   User Role:', response.data.user.role);
    console.log('   Token Length:', response.data.token.length);

    // Test Admin Dashboard
    const dashboard = await axios.get('http://localhost:3000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${response.data.token}` }
    });
    console.log('\n✅ Admin Dashboard Success!');
    console.log('   Pending Orders:', dashboard.data.data.stats.pendingOrders);
    console.log('   Total Products:', dashboard.data.data.stats.totalProducts);

    console.log('\n🎉 All tests passed! Backend is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

quickTest();
