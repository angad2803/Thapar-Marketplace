# University Marketplace Management Portal (UMS) - API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "password": "password123",
  "university": "University of Technology",
  "phoneNumber": "+1234567890",
  "studentId": "STU001"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "university": "University of Technology",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john.doe@university.edu",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "John Updated",
  "phoneNumber": "+1234567899",
  "profileImage": "image_url"
}
```

### Change Password

```http
PUT /api/auth/password
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## Listing Endpoints

### Get All Listings

```http
GET /api/listings?category=Electronics&minPrice=100&maxPrice=1000&page=1&limit=20
```

**Query Parameters:**

- `category`: Filter by category (Electronics, Books, Furniture, etc.)
- `condition`: Filter by condition (New, Like New, Good, Fair, Poor)
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `search`: Search keyword
- `status`: Filter by status (default: available)
- `sort`: Sort field (default: -createdAt)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "listing_id",
      "title": "MacBook Pro 2021",
      "description": "Excellent condition...",
      "price": 1200,
      "category": "Electronics",
      "condition": "Like New",
      "images": ["/uploads/image.jpg"],
      "sellerId": {
        "_id": "seller_id",
        "name": "John Doe",
        "email": "john@university.edu"
      },
      "status": "available",
      "views": 45,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Listing

```http
GET /api/listings/:id
```

### Create Listing

```http
POST /api/listings
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

- `title`: Listing title (required)
- `description`: Detailed description (required)
- `price`: Price in dollars (required)
- `category`: Category (required)
- `condition`: Item condition (required)
- `location`: Meetup location
- `isNegotiable`: Boolean (true/false)
- `tags`: Array of tags
- `images`: Image files (1-5 images, max 5MB each)

### Update Listing

```http
PUT /api/listings/:id
Authorization: Bearer <token>
```

### Delete Listing

```http
DELETE /api/listings/:id
Authorization: Bearer <token>
```

### Get My Listings

```http
GET /api/listings/my/listings
Authorization: Bearer <token>
```

### Add to Wishlist

```http
POST /api/listings/:id/wishlist
Authorization: Bearer <token>
```

### Remove from Wishlist

```http
DELETE /api/listings/:id/wishlist
Authorization: Bearer <token>
```

### Get Wishlist

```http
GET /api/listings/wishlist
Authorization: Bearer <token>
```

---

## Chat Endpoints

### Get Conversations

```http
GET /api/chat/conversations
Authorization: Bearer <token>
```

### Get Messages with User

```http
GET /api/chat/:userId
Authorization: Bearer <token>
```

### Send Message

```http
POST /api/chat
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "receiverId": "user_id",
  "content": "Hello, is this item still available?",
  "listingId": "listing_id" // optional
}
```

### Mark Message as Read

```http
PUT /api/chat/:id/read
Authorization: Bearer <token>
```

### Delete Message

```http
DELETE /api/chat/:id
Authorization: Bearer <token>
```

### Get Unread Count

```http
GET /api/chat/unread/count
Authorization: Bearer <token>
```

---

## Admin Endpoints

**Note:** All admin endpoints require admin role

### Get Dashboard Stats

```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

### Get All Users

```http
GET /api/admin/users?page=1&limit=20&search=john&role=user
Authorization: Bearer <admin_token>
```

### Get User Details

```http
GET /api/admin/users/:id
Authorization: Bearer <admin_token>
```

### Update User Status

```http
PUT /api/admin/users/:id/status
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "isActive": false
}
```

### Delete User

```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin_token>
```

### Get All Listings (Admin)

```http
GET /api/admin/listings?status=available
Authorization: Bearer <admin_token>
```

### Delete Listing (Admin)

```http
DELETE /api/admin/listings/:id
Authorization: Bearer <admin_token>
```

### Create Announcement

```http
POST /api/admin/announcements
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "title": "System Maintenance",
  "content": "The system will be down for maintenance...",
  "type": "maintenance",
  "priority": "high",
  "targetAudience": "all",
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

### Get All Announcements

```http
GET /api/admin/announcements
Authorization: Bearer <admin_token>
```

### Update Announcement

```http
PUT /api/admin/announcements/:id
Authorization: Bearer <admin_token>
```

### Delete Announcement

```http
DELETE /api/admin/announcements/:id
Authorization: Bearer <admin_token>
```

---

## Report Endpoints

### Create Report

```http
POST /api/reports
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "listingId": "listing_id",
  "reason": "Spam",
  "description": "This listing is spam and contains misleading information"
}
```

**Reason Options:**

- Spam
- Inappropriate Content
- Misleading Information
- Scam/Fraud
- Duplicate Listing
- Prohibited Item
- Other

### Get My Reports

```http
GET /api/reports/my/reports
Authorization: Bearer <token>
```

### Get All Reports (Admin)

```http
GET /api/reports?status=pending&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Get Single Report (Admin)

```http
GET /api/reports/:id
Authorization: Bearer <admin_token>
```

### Update Report (Admin)

```http
PUT /api/reports/:id
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "status": "resolved",
  "reviewNotes": "Listing removed and user warned",
  "actionTaken": "listing_removed"
}
```

**Action Taken Options:**

- none
- warning
- listing_removed
- user_suspended
- user_banned

### Delete Report (Admin)

```http
DELETE /api/reports/:id
Authorization: Bearer <admin_token>
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- Applies to all `/api` endpoints

---

## File Upload

- **Max File Size:** 5MB per file
- **Max Files:** 5 images per listing
- **Allowed Types:** JPEG, JPG, PNG, GIF, WebP

---

## Categories

- Electronics
- Books
- Furniture
- Clothing
- Sports
- Stationery
- Vehicles
- Services
- Other

## Conditions

- New
- Like New
- Good
- Fair
- Poor

---

## Testing

### Test Accounts

After running `npm run seed`, you can use these accounts:

**Admin:**

- Email: `admin@university.edu`
- Password: `admin123`

**Regular Users:**

- Email: `john.smith@university.edu` | Password: `password123`
- Email: `emma.j@university.edu` | Password: `password123`
- Email: `michael.b@university.edu` | Password: `password123`

---

## Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67,
  "environment": "development"
}
```
