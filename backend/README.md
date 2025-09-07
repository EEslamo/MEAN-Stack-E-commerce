# E-commerce Backend API

A comprehensive e-commerce backend API built with Node.js, Express, and MongoDB for a clothing store targeting customers aged 18-35 in Egypt.

## Features

### Core Features
- **User Management**: Registration, login, profile management
- **Product Management**: CRUD operations for products with categories
- **Category Management**: Hierarchical categories (Men/Women with subcategories)
- **Shopping Cart**: Guest and authenticated user cart functionality
- **Order Management**: Complete order lifecycle with status tracking
- **Testimonials**: Customer reviews with admin approval system
- **Contact System**: Customer support with complaint/question categories
- **Admin Dashboard**: Comprehensive admin panel with reports

### Business Logic
- **Payment**: Cash on delivery (COD) only
- **Shipping**: Egypt-wide delivery
- **Returns**: 14-day return/refund policy
- **Stock Management**: Real-time inventory tracking
- **Price Changes**: Cart price validation and user notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify token

### Products
- `GET /api/products` - Get products with filtering and pagination
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `GET /api/products/:id/related` - Get related products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/main` - Get main categories
- `GET /api/categories/subcategories/:parentId` - Get subcategories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get cart (supports guest and authenticated users)
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/merge` - Merge guest cart with user cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders (with filtering)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order (User)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/admin/stats` - Get order statistics (Admin)

### Testimonials
- `GET /api/testimonials` - Get approved testimonials
- `POST /api/testimonials` - Create testimonial
- `GET /api/testimonials/my` - Get user's testimonial
- `PUT /api/testimonials/my` - Update user's testimonial
- `DELETE /api/testimonials/my` - Delete user's testimonial
- `GET /api/testimonials/admin/pending` - Get pending testimonials (Admin)
- `PUT /api/testimonials/admin/:id` - Approve/reject testimonial (Admin)
- `DELETE /api/testimonials/admin/:id` - Delete testimonial (Admin)
- `GET /api/testimonials/admin/stats` - Get testimonial statistics (Admin)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get contacts (Admin)
- `GET /api/contact/:id` - Get single contact (Admin)
- `PUT /api/contact/:id` - Update contact status (Admin)
- `DELETE /api/contact/:id` - Delete contact (Admin)
- `GET /api/contact/admin/stats` - Get contact statistics (Admin)

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/reports/sales` - Get sales report
- `GET /api/admin/reports/products` - Get product sales report
- `GET /api/admin/reports/users` - Get user statistics
- `GET /api/admin/reports/inventory` - Get inventory report

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:4200
```

## Database Schema

### User
- Personal information (name, email, phone, address)
- Authentication (password, role)
- Account status (isActive, lastLogin)

### Product
- Product details (name, description, price, photos)
- Inventory (stock, SKU)
- Categorization (category, tags)
- Status (isActive, isDeleted, isFeatured)

### Category
- Hierarchical structure (parentCategory)
- Status management (isActive, isDeleted)
- Organization (sortOrder)

### Order
- Order information (orderNumber, totalAmount, status)
- Customer details (customerInfo)
- Items with snapshots
- Status history with timestamps
- Shipping information

### Cart
- User/Session association
- Items with quantities and prices
- Expiration handling

### Testimonial
- User reviews with ratings
- Approval workflow (isApproved, isSeen)
- Admin management

### Contact
- Customer support messages
- Categorization (complaint/question)
- Resolution tracking

## Order Status Flow

1. **pending** - Order placed, awaiting processing
2. **preparing** - Order being prepared
3. **ready_for_shipping** - Order ready for dispatch
4. **shipped** - Order dispatched
5. **received** - Order delivered
6. **rejected** - Order rejected by admin
7. **cancelled** - Order cancelled (before shipping only)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Error handling without sensitive data exposure

## File Upload

- Supports multiple image formats
- 5MB file size limit
- Automatic file naming with timestamps
- Organized storage in uploads directory

## API Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

## Error Handling

- Consistent error response format
- HTTP status codes
- Validation error details
- Database error handling
- File upload error handling

## Default Admin Account

- **Email**: admin@ecommerce.com
- **Password**: admin123
- **Role**: admin

## Development

The backend is organized with:
- **Models**: Database schemas and business logic
- **Controllers**: Request handling and business logic
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, validation, error handling
- **Config**: Database and application configuration
- **Utils**: Helper functions and data seeding

## Production Considerations

- Use environment variables for sensitive data
- Implement proper logging
- Set up database backups
- Configure reverse proxy (nginx)
- Use HTTPS in production
- Implement rate limiting
- Set up monitoring and alerting
