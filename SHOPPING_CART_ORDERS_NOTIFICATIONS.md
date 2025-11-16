# Shopping Cart, Orders & Notifications System

Complete implementation of shopping cart, order confirmation workflow, persistent notifications, and SMTP email integration.

---

## 🛒 **SHOPPING CART**

### Features
- Add/remove items from cart
- Update item quantities
- View cart with real-time pricing
- Cart persists across sessions (stored in MongoDB)
- Automatic cleanup of unavailable listings

### API Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "listingId": {
          "_id": "listing_id",
          "title": "Gaming Laptop",
          "price": 45000,
          "images": ["url1", "url2"],
          "sellerId": {
            "name": "John Doe",
            "hostel": "A-Block"
          }
        },
        "quantity": 1,
        "price": 45000,
        "addedAt": "2024-11-16T10:00:00.000Z"
      }
    ],
    "totalAmount": 45000
  }
}
```

#### Add to Cart
```http
POST /api/cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "listingId": "listing_id",
  "quantity": 1
}
```

#### Update Cart Item
```http
PUT /api/cart/:listingId
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 2
}
```

#### Remove from Cart
```http
DELETE /api/cart/:listingId
Authorization: Bearer {token}
```

#### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer {token}
```

---

## 📦 **ORDER MANAGEMENT**

### Order Lifecycle

```
[Pending] → [Confirmed by Seller] → [Delivered] → [Completed]
     ↓
[Cancelled]
```

### Order Confirmation Workflow

1. **Buyer places order** → Order status: `pending`
   - Listings marked as `pending`
   - Buyer receives confirmation email
   - Sellers receive order notification emails
   - Cart is cleared

2. **Seller confirms order** → Seller confirmation: `true`
   - Buyer receives notification
   - Email sent to buyer for delivery confirmation

3. **Buyer confirms delivery** → Buyer confirmation: `true`
   - Order status changes to `delivered`
   - Listings marked as `sold`

4. **Buyer completes order** → Order status: `completed`
   - Payment status: `paid`
   - Both parties receive completion emails
   - Transaction finalized

### API Endpoints

#### Create Order from Cart
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentMethod": "cash",
  "deliveryDetails": {
    "meetupLocation": "Hostel A Common Room",
    "meetupTime": "2024-11-17T15:00:00.000Z",
    "deliveryMethod": "hostel_exchange",
    "notes": "Available after 3 PM"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderNumber": "ORD1731756123456",
    "buyerId": {
      "name": "Buyer Name",
      "email": "buyer@thapar.edu",
      "hostel": "A-Block"
    },
    "items": [...],
    "totalAmount": 45000,
    "status": "pending",
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "deliveryDetails": {...},
    "confirmation": {
      "buyerConfirmed": false,
      "sellerConfirmed": false
    },
    "createdAt": "2024-11-16T10:00:00.000Z"
  }
}
```

#### Get My Orders (as Buyer)
```http
GET /api/orders/my-orders?status=pending&page=1&limit=10
Authorization: Bearer {token}
```

#### Get Selling Orders (as Seller)
```http
GET /api/orders/selling?status=pending&page=1&limit=10
Authorization: Bearer {token}
```

#### Get Order Details
```http
GET /api/orders/:id
Authorization: Bearer {token}
```

#### Confirm Order Delivery
```http
PUT /api/orders/:id/confirm
Authorization: Bearer {token}
```

**Usage:**
- **Seller calls this first** → Sets `sellerConfirmed: true`, sends email to buyer
- **Buyer calls this after** → Sets `buyerConfirmed: true`, order status → `delivered`

#### Complete Order
```http
PUT /api/orders/:id/complete
Authorization: Bearer {token}
```

**Requirements:**
- Order must be in `delivered` status
- Only buyer or admin can complete
- Sets status to `completed`, payment to `paid`

#### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Buyer changed mind"
}
```

**Effects:**
- Order status → `cancelled`
- Listings → `available` again
- All parties notified

---

## 🔔 **NOTIFICATION SYSTEM**

### Notification Types

| Type | Description | Priority |
|------|-------------|----------|
| `message` | New chat message received | medium |
| `order_placed` | New order created | high |
| `order_confirmed` | Order confirmation by seller/buyer | high |
| `order_delivered` | Order marked as delivered | high |
| `order_completed` | Order successfully completed | medium |
| `order_cancelled` | Order cancelled | high |
| `listing_sold` | Your listing was sold | medium |
| `review_received` | New review on your profile | medium |
| `wishlist_price_drop` | Wishlist item price reduced | low |
| `admin_announcement` | Admin posted announcement | varies |
| `report_update` | Status update on your report | medium |

### Features
- Persistent storage in MongoDB
- Real-time delivery via Socket.io
- Auto-delete after 30 days (TTL index)
- Read/unread tracking
- Priority levels (low, medium, high, urgent)

### API Endpoints

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20&unreadOnly=true
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "total": 45,
  "unreadCount": 8,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "notification_id",
      "userId": "user_id",
      "type": "order_placed",
      "title": "New Order Received",
      "message": "You received an order for 2 item(s). Order #ORD123",
      "relatedId": "order_id",
      "relatedModel": "Order",
      "isRead": false,
      "priority": "high",
      "createdAt": "2024-11-16T10:00:00.000Z"
    }
  ]
}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {token}
```

#### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer {token}
```

---

## 📧 **EMAIL NOTIFICATIONS (SMTP)**

### Setup

1. **Configure Gmail App Password** (recommended):
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate app-specific password for "Mail"
   - Copy the 16-character password

2. **Update `.env` file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

3. **For other providers**:

| Provider | SMTP Host | Port | Secure |
|----------|-----------|------|--------|
| Gmail | smtp.gmail.com | 587 | false |
| Outlook | smtp-mail.outlook.com | 587 | false |
| Yahoo | smtp.mail.yahoo.com | 587 | false |
| SendGrid | smtp.sendgrid.net | 587 | false |

### Email Templates

#### 1. Order Confirmation (to Buyer)
- **Subject:** `Order Confirmation - {orderNumber}`
- **Contains:**
  - Order details
  - Items list with prices
  - Total amount
  - Payment method
  - Link to track order

#### 2. New Order Notification (to Seller)
- **Subject:** `New Order Received - {orderNumber}`
- **Contains:**
  - Order number
  - Items sold
  - Buyer information (if needed)
  - Link to view order

#### 3. Delivery Confirmation Request
- **Subject:** `Confirm Order Delivery - {orderNumber}`
- **Contains:**
  - Order details
  - Button to confirm delivery
  - Delivery status

#### 4. Order Completed
- **Subject:** `Order Completed - {orderNumber}`
- **Contains:**
  - Completion confirmation
  - Order summary
  - Link to leave a review

#### 5. Email Verification (Future)
- **Subject:** `Verify Your Email - Thapar Marketplace`
- **Contains:**
  - Welcome message
  - Verification link (24h expiry)

#### 6. Password Reset (Future)
- **Subject:** `Password Reset Request - Thapar Marketplace`
- **Contains:**
  - Reset link (1h expiry)
  - Security notice

### Email Service Functions

Located in `server/utils/emailService.js`:

```javascript
// Import in your controller
const { 
  sendOrderConfirmationEmail,
  sendNewOrderNotificationToSeller,
  sendDeliveryConfirmationRequest,
  sendOrderCompletedEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
} = require('../utils/emailService');

// Usage example
await sendOrderConfirmationEmail(order, buyer);
await sendNewOrderNotificationToSeller(order, seller, items);
```

### Testing SMTP Locally

Use **Ethereal Email** for development:

```javascript
// In emailService.js (for testing)
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass
  }
});

// Preview URL will be logged to console
console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
```

---

## 📊 **DATABASE MODELS**

### Cart Model
```javascript
{
  userId: ObjectId (ref: User, unique),
  items: [
    {
      listingId: ObjectId (ref: Listing),
      quantity: Number (min: 1),
      price: Number,
      addedAt: Date
    }
  ],
  totalAmount: Number (auto-calculated)
}
```

### Order Model
```javascript
{
  orderNumber: String (auto-generated, unique),
  buyerId: ObjectId (ref: User),
  items: [
    {
      listingId: ObjectId,
      sellerId: ObjectId (ref: User),
      title: String,
      price: Number,
      quantity: Number,
      images: [String]
    }
  ],
  totalAmount: Number,
  status: Enum ['pending', 'confirmed', 'delivered', 'completed', 'cancelled', 'disputed'],
  paymentMethod: Enum ['cash', 'online', 'card', 'upi'],
  paymentStatus: Enum ['pending', 'paid', 'refunded'],
  deliveryDetails: {
    meetupLocation: String,
    meetupTime: Date,
    deliveryMethod: Enum ['pickup', 'delivery', 'hostel_exchange'],
    buyerHostel: String,
    notes: String
  },
  confirmation: {
    buyerConfirmed: Boolean,
    buyerConfirmedAt: Date,
    sellerConfirmed: Boolean,
    sellerConfirmedAt: Date
  },
  ratings: {
    buyerRating: Number (1-5),
    sellerRating: Number (1-5),
    buyerReview: String (max 500),
    sellerReview: String (max 500)
  },
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}
```

### Notification Model
```javascript
{
  userId: ObjectId (ref: User, indexed),
  type: Enum (12 types),
  title: String (max 100),
  message: String (max 500),
  relatedId: ObjectId,
  relatedModel: Enum ['Order', 'Listing', 'Message', 'Review', 'Report', 'Announcement'],
  isRead: Boolean,
  readAt: Date,
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  createdAt: Date (TTL: 30 days)
}
```

---

## 🔄 **INTEGRATION WITH EXISTING SYSTEMS**

### Socket.io Integration
- Real-time notification delivery alongside messages
- Persistent notifications stored even if user offline
- Chat messages now create notification records

### Listing Status Updates
- Cart creation: Listings remain `available`
- Order creation: Listings → `pending`
- Order delivery confirmed: Listings → `sold`
- Order cancelled: Listings → `available` again

### User Notifications
- Buyers: Order confirmations, delivery updates, completion
- Sellers: New orders, buyer confirmations, payments
- Both: Cancellations, disputes, reviews

---

## 🚀 **DEPLOYMENT CHECKLIST**

### Backend (Render)
1. ✅ Install nodemailer: `npm install nodemailer`
2. ✅ Add environment variables in Render dashboard:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
3. ✅ Redeploy backend
4. ✅ Test SMTP connection (check logs for "SMTP Server ready")

### Testing
```bash
# Test cart endpoints
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"listingId": "listing_id", "quantity": 1}'

# Test order creation
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "cash"}'

# Test notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 **USAGE EXAMPLES**

### Complete Order Flow

```javascript
// 1. Add items to cart
POST /api/cart
{ "listingId": "abc123", "quantity": 1 }

// 2. View cart
GET /api/cart
// Response: totalAmount: 45000

// 3. Create order
POST /api/orders
{
  "paymentMethod": "cash",
  "deliveryDetails": {
    "meetupLocation": "Hostel Common Room",
    "meetupTime": "2024-11-17T15:00:00Z"
  }
}
// ✅ Buyer gets email
// ✅ Seller gets email
// ✅ Both get notifications

// 4. Seller confirms delivery
PUT /api/orders/order_id/confirm
// ✅ Buyer gets email to confirm

// 5. Buyer confirms delivery
PUT /api/orders/order_id/confirm
// ✅ Order status → delivered
// ✅ Listings → sold

// 6. Buyer completes order
PUT /api/orders/order_id/complete
// ✅ Both parties get completion email
// ✅ Transaction finalized
```

---

## ⚙️ **CONFIGURATION OPTIONS**

### Email Customization

Edit templates in `server/utils/emailService.js`:

```javascript
// Customize email styling
const mailOptions = {
  from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
  to: user.email,
  subject: 'Your Subject',
  html: `
    <div style="font-family: Arial; max-width: 600px;">
      <!-- Your custom HTML here -->
    </div>
  `
};
```

### Notification Priority Rules

```javascript
// High priority notifications (immediate attention)
- order_placed, order_confirmed, order_cancelled

// Medium priority (informational)
- order_completed, message, review_received

// Low priority (can wait)
- wishlist_price_drop
```

---

## 🐛 **TROUBLESHOOTING**

### SMTP Not Working

1. **Check logs:**
```bash
# Should see: "✅ SMTP Server ready to send emails"
# If error, check credentials
```

2. **Gmail issues:**
   - Enable 2-Step Verification
   - Use App Password (not regular password)
   - Allow less secure apps (not recommended)

3. **Test connection:**
```javascript
// Run in Node.js
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'your@gmail.com', pass: 'app_password' }
});
transporter.verify((error, success) => {
  console.log(error || 'Ready to send emails!');
});
```

### Notifications Not Appearing

1. Check MongoDB connection
2. Verify notification creation in database
3. Check Socket.io connection for real-time delivery
4. Clear browser cache

### Order Confirmation Not Working

1. Ensure both buyer and seller call `/confirm` endpoint
2. Check order status progression
3. Verify listing status updates

---

## 📚 **ADDITIONAL RESOURCES**

- [Nodemailer Documentation](https://nodemailer.com/)
- [Socket.io Docs](https://socket.io/docs/)
- [MongoDB TTL Indexes](https://docs.mongodb.com/manual/core/index-ttl/)

---

**Version:** 1.0.0  
**Last Updated:** November 16, 2024  
**Contributors:** Development Team
