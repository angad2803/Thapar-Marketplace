# University Marketplace Management Portal (UMS) - Backend

A production-ready REST API server for the University Marketplace Management Portal, built with Node.js, Express, and MongoDB.

## 🏗️ Architecture

```
server/
├── config/               # Configuration files
│   ├── db.js            # MongoDB connection
│   └── firebase.js      # Firebase configuration
├── controllers/          # Business logic
│   ├── authController.js
│   ├── listingController.js
│   ├── chatController.js
│   ├── adminController.js
│   └── reportController.js
├── middleware/           # Express middleware
│   ├── authMiddleware.js       # JWT authentication
│   ├── errorHandler.js         # Global error handling
│   ├── validation.js           # Input validation
│   └── upload.js              # File upload (Multer)
├── models/               # MongoDB schemas
│   ├── User.js
│   ├── Listing.js
│   ├── Message.js
│   ├── Report.js
│   ├── Transaction.js
│   └── Announcement.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── listingRoutes.js
│   ├── chatRoutes.js
│   ├── adminRoutes.js
│   └── reportRoutes.js
├── utils/                # Utility functions
│   └── seed.js          # Database seeder
├── uploads/              # File uploads directory
├── server.js             # Server entry point
└── API_DOCUMENTATION.md  # Complete API docs
```

## ✨ Features

### Core Functionality

- ✅ **User Authentication** - JWT-based auth with Firebase email verification
- ✅ **Listing Management** - Full CRUD operations for marketplace listings
- ✅ **Search & Filters** - Advanced filtering by category, price, condition, keywords
- ✅ **Messaging System** - Real-time chat between buyers and sellers
- ✅ **Wishlist** - Save favorite listings
- ✅ **Transaction History** - Track completed exchanges
- ✅ **Admin Dashboard** - Comprehensive admin controls
- ✅ **Reports & Moderation** - User reporting system with admin review
- ✅ **Announcements** - Admin announcements for users

### Security Features

- 🔒 **Helmet.js** - Security headers
- 🔒 **CORS** - Cross-Origin Resource Sharing
- 🔒 **Rate Limiting** - Prevent abuse (100 req/15min per IP)
- 🔒 **Input Validation** - Express-validator for all inputs
- 🔒 **Password Hashing** - Bcrypt with salt rounds
- 🔒 **JWT Tokens** - Secure session management
- 🔒 **Role-Based Access** - Admin vs User permissions

### Performance Optimizations

- ⚡ **Database Indexing** - Optimized queries
- ⚡ **Compression** - Gzip compression for responses
- ⚡ **Pagination** - Efficient data loading
- ⚡ **Connection Pooling** - MongoDB connection management

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Update the values:

   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/university_marketplace
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d
   CORS_ORIGIN=http://localhost:8080
   ```

3. **Start MongoDB**

   ```bash
   mongod
   ```

4. **Seed the database (optional)**

   ```bash
   npm run seed
   ```

   This creates:

   - Admin user: `admin@university.edu` / `admin123`
   - 3 test users with sample listings

5. **Start the server**

   Development mode (with auto-reload):

   ```bash
   npm run dev
   ```

   Production mode:

   ```bash
   npm start
   ```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication (`/api/auth`)

```
POST   /register         - Register new user
POST   /login           - Login user
GET    /me              - Get current user (Protected)
PUT    /profile         - Update profile (Protected)
PUT    /password        - Change password (Protected)
POST   /logout          - Logout (Protected)
```

### Listings (`/api/listings`)

```
GET    /                - Get all listings (with filters)
POST   /                - Create listing (Protected)
GET    /:id             - Get single listing
PUT    /:id             - Update listing (Protected)
DELETE /:id             - Delete listing (Protected)
GET    /my/listings     - Get user's listings (Protected)
POST   /:id/wishlist    - Add to wishlist (Protected)
DELETE /:id/wishlist    - Remove from wishlist (Protected)
GET    /wishlist        - Get wishlist (Protected)
```

### Chat (`/api/chat`)

```
GET    /conversations   - Get all conversations (Protected)
GET    /:userId         - Get messages with user (Protected)
POST   /                - Send message (Protected)
PUT    /:id/read        - Mark as read (Protected)
DELETE /:id             - Delete message (Protected)
GET    /unread/count    - Get unread count (Protected)
```

### Admin (`/api/admin`)

```
GET    /stats           - Dashboard statistics (Admin)
GET    /users           - Get all users (Admin)
GET    /users/:id       - Get user details (Admin)
PUT    /users/:id/status - Update user status (Admin)
DELETE /users/:id       - Delete user (Admin)
GET    /listings        - Get all listings (Admin)
DELETE /listings/:id    - Delete listing (Admin)
POST   /announcements   - Create announcement (Admin)
GET    /announcements   - Get announcements (Admin)
PUT    /announcements/:id - Update announcement (Admin)
DELETE /announcements/:id - Delete announcement (Admin)
```

### Reports (`/api/reports`)

```
POST   /                - Create report (Protected)
GET    /my/reports      - Get user's reports (Protected)
GET    /                - Get all reports (Admin)
GET    /:id             - Get single report (Admin)
PUT    /:id             - Update report (Admin)
DELETE /:id             - Delete report (Admin)
```

### Health Check

```
GET    /api/health      - Server health status
```

## 📚 Complete Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for:

- Detailed request/response examples
- Query parameters
- Error codes
- Authentication flow
- File upload specifications

## 🗄️ Database Models

### User

- Name, email, password (hashed)
- University, student ID
- Role (user/admin)
- Wishlist array
- Profile image

### Listing

- Title, description, price
- Category, condition
- Images (1-5)
- Seller reference
- Status, views, location
- Tags array

### Message

- Sender, receiver
- Content, attachments
- Read status
- Conversation ID
- Listing reference

### Report

- Reporter, reported user
- Listing reference
- Reason, description
- Status, action taken
- Review notes

### Transaction

- Buyer, seller, listing
- Price, payment method
- Ratings, reviews
- Status, completion date

### Announcement

- Title, content
- Type, priority
- Target audience
- Expiration date
- Created by (admin)

## 🔐 Authentication Flow

1. User registers with university email
2. Email verification (Firebase integration)
3. Login returns JWT token
4. Token included in Authorization header for protected routes
5. Token verified by auth middleware

```javascript
// Client request header
Authorization: Bearer <jwt_token>
```

## 🛡️ Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with expiration
- ✅ Rate limiting on API routes
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ MongoDB injection prevention
- ✅ File upload restrictions (type, size)
- ✅ Error handling without exposing stack traces

## 📊 Performance

### Optimization Strategies

1. **Database Indexes** - All frequently queried fields
2. **Pagination** - Default 20 items per page
3. **Query Optimization** - Population only when needed
4. **Compression** - Gzip for all responses
5. **Connection Pooling** - Mongoose default settings

### Expected Performance

- **Response Time:** < 3 seconds (as per requirements)
- **Concurrent Users:** Supports 5000+ (as per requirements)
- **Uptime:** 99.9% (as per requirements)

## 🧪 Testing

### Test Credentials (after seeding)

**Admin Account:**

```
Email: admin@university.edu
Password: admin123
```

**User Accounts:**

```
Email: john.smith@university.edu
Password: password123

Email: emma.j@university.edu
Password: password123

Email: michael.b@university.edu
Password: password123
```

### Manual Testing

1. Use Postman or Thunder Client
2. Import API documentation
3. Test each endpoint with test accounts
4. Verify authentication flow
5. Test file uploads
6. Check error handling

## 🐛 Error Handling

Global error handler catches:

- Mongoose validation errors
- Cast errors (invalid ObjectId)
- Duplicate key errors
- JWT errors
- Multer file errors
- Custom application errors

Error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## 📝 Environment Variables

| Variable                | Description               | Default               |
| ----------------------- | ------------------------- | --------------------- |
| PORT                    | Server port               | 3000                  |
| NODE_ENV                | Environment               | development           |
| MONGODB_URI             | MongoDB connection string | -                     |
| JWT_SECRET              | JWT secret key            | -                     |
| JWT_EXPIRE              | Token expiration          | 30d                   |
| CORS_ORIGIN             | Allowed origin            | http://localhost:8080 |
| RATE_LIMIT_WINDOW_MS    | Rate limit window         | 900000 (15 min)       |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window   | 100                   |
| MAX_FILE_SIZE           | Max upload size           | 5242880 (5MB)         |

## 🚧 Future Enhancements

- [ ] WebSocket integration for real-time chat
- [ ] Firebase Cloud Storage for images
- [ ] Email notifications
- [ ] Push notifications
- [ ] Advanced search with Elasticsearch
- [ ] Redis caching layer
- [ ] API versioning
- [ ] Swagger/OpenAPI documentation
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🤝 Contributing

1. Follow existing code structure
2. Add input validation for new endpoints
3. Include error handling
4. Update API documentation
5. Test thoroughly before committing

## 📄 License

ISC License

---

**Built with ❤️ for University Students**

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads

## 📁 Project Structure

```
server/
├── routes/          # API route handlers
│   ├── auth.js     # Authentication routes
│   ├── products.js # Product management
│   ├── cart.js     # Shopping cart
│   ├── bid.js      # Bidding system
│   ├── swap.js     # Item swapping
│   └── order.js    # Order management
├── models/          # MongoDB schemas
│   ├── user.js     # User model
│   ├── product.js  # Product model
│   ├── order.js    # Order model
│   └── offer.js    # Offer model
├── middleware/      # Express middleware
│   └── auth.js     # Authentication middleware
└── index.js         # Server entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (running locally or remote connection)

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the server folder:

```env
PORT=3000
MONGODB_URI=mongodb://localhost/ziddi
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Start MongoDB

Make sure MongoDB is running:

```bash
# Linux/Mac
mongod

# Windows (if installed as service)
net start MongoDB
```

### Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000 with auto-reload enabled.

### Production Server

```bash
npm start
```

## 📡 API Routes

All routes are prefixed with `/api`:

### Authentication (`/api/auth`)

- User registration
- User login
- Token validation

### Products (`/api/products`)

- Get all products
- Get product by ID
- Create new product
- Update product
- Delete product

### Cart (`/api/cart`)

- Get user cart
- Add to cart
- Update cart item
- Remove from cart

### Bidding (`/api/bid`)

- Place bid
- Get bids for product
- Accept/reject bid

### Swap (`/api/swap`)

- Propose swap
- Get swap offers
- Accept/reject swap

### Orders (`/api/order`)

- Create order
- Get user orders
- Update order status

### Health Check (`/api/health`)

- Server status endpoint

## 🗄️ Database Models

### User

- Email, password (hashed)
- Profile information
- Authentication tokens

### Product

- Title, description, price
- Images
- Category, condition
- Seller information

### Order

- User reference
- Product details
- Order status
- Payment information

### Offer

- Buyer/seller information
- Offer type (bid/swap)
- Offer amount
- Status

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in → receives JWT token
2. Token included in `Authorization` header for protected routes
3. Middleware validates token and attaches user to request

Example header:

```
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS enabled for cross-origin requests
- Input validation and sanitization
- Protected routes with authentication middleware

## 📝 Development

### Code Structure

- **Routes**: Handle HTTP requests and responses
- **Models**: Define database schemas and methods
- **Middleware**: Process requests before reaching routes
- **Controllers**: Business logic (if separated from routes)

### Adding New Routes

1. Create route file in `routes/`
2. Define route handlers
3. Import and use in `index.js`

Example:

```javascript
// routes/example.js
const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ message: "Example route" });
});

module.exports = router;

// index.js
const exampleRoute = require("./routes/example");
app.use("/api/example", exampleRoute);
```

## 🧪 Testing

```bash
npm test
```

(Note: Tests need to be implemented)

## 📦 Key Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT handling
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `multer` - File upload handling

## 🔧 Configuration

- Port: Configured via `PORT` environment variable (default: 3000)
- MongoDB: Configured via `MONGODB_URI` environment variable
- JWT Secret: Configured via `JWT_SECRET` environment variable

## 🐛 Debugging

Enable detailed logging by setting:

```env
NODE_ENV=development
```

## 📈 Future Enhancements

- [ ] Add API rate limiting
- [ ] Implement request logging
- [ ] Add API documentation (Swagger)
- [ ] Implement comprehensive testing
- [ ] Add Redis for caching
- [ ] Set up database migrations
