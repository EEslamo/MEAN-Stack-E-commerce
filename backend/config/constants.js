module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: '7d',
  
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user'
  },
  
  ORDER_STATUS: {
    PENDING: 'pending',
    PREPARING: 'preparing',
    READY_FOR_SHIPPING: 'ready_for_shipping',
    SHIPPED: 'shipped',
    RECEIVED: 'received',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
  },
  
  CONTACT_CATEGORIES: {
    COMPLAINT: 'complaint',
    QUESTION: 'question'
  },
  
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
  }
};
