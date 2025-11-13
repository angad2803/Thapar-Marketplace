# 🎓 University Marketplace Management Portal (UMS)

## Complete Setup & Deployment Guide

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [Testing](#testing)
4. [Deployment](#deployment)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites Check

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version
```

### 1-Minute Setup

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start MongoDB
mongod

# 5. Seed database (in new terminal)
npm run seed

# 6. Start server
npm run dev
```

Server will be running at: `http://localhost:3000`

---

## 📦 Detailed Setup

### Step 1: Install Dependencies

```bash
cd server
npm install
```

**Dependencies installed:**

- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - Cross-origin requests
- helmet - Security headers
- express-rate-limit - Rate limiting
- express-validator - Input validation
- multer - File uploads
- dotenv - Environment variables
- compression - Response compression
- morgan - HTTP logging

### Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/university_marketplace

# JWT
JWT_SECRET=your_very_secure_secret_key_change_in_production
JWT_EXPIRE=30d

# Security
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100       # 100 requests per window

# CORS
CORS_ORIGIN=http://localhost:8080  # Your frontend URL

# Upload
MAX_FILE_SIZE=5242880              # 5MB in bytes
UPLOAD_PATH=./uploads
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**

```bash
# Start MongoDB service
mongod

# Or on Windows (if installed as service)
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**

1. Create free account at mongodb.com/atlas
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

Example Atlas URI:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university_marketplace
```

### Step 4: Seed Database

```bash
npm run seed
```

This creates:

- **Admin user**: admin@university.edu / admin123
- **3 test users** with sample listings
- **6 sample listings** across different categories

### Step 5: Start Server

**Development Mode (with auto-reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

**Expected Output:**

```
═══════════════════════════════════════════════════════════
  🎓 University Marketplace Management Portal (UMS)
═══════════════════════════════════════════════════════════
  ✓ Server running on: http://localhost:3000
  ✓ Environment: development
  ✓ Database: Connected
═══════════════════════════════════════════════════════════
```

---

## 🧪 Testing

### Test with cURL

**1. Health Check**

```bash
curl http://localhost:3000/api/health
```

**2. Register User**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@university.edu",
    "password": "test123",
    "university": "Test University"
  }'
```

**3. Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123"
  }'
```

Save the token from response!

**4. Get Listings**

```bash
curl http://localhost:3000/api/listings
```

**5. Get Current User (with token)**

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test with Postman

1. **Import Collection**

   - Create new collection "UMS API"
   - Add environment variable `baseUrl` = `http://localhost:3000`
   - Add environment variable `token` = (empty for now)

2. **Test Authentication**

   - POST `{{baseUrl}}/api/auth/login`
   - Save token from response to environment variable
   - Use `{{token}}` in Authorization header for protected routes

3. **Test All Endpoints**
   - Follow API_DOCUMENTATION.md
   - Test each endpoint category
   - Verify error handling

---

## 🌐 Deployment

### Deploying to Heroku

**1. Install Heroku CLI**

```bash
npm install -g heroku
```

**2. Login to Heroku**

```bash
heroku login
```

**3. Create Heroku App**

```bash
heroku create university-marketplace-api
```

**4. Set Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_secret
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set CORS_ORIGIN=your_frontend_url
```

**5. Deploy**

```bash
git push heroku main
```

**6. Seed Production Database**

```bash
heroku run npm run seed
```

### Deploying to Railway

**1. Install Railway CLI**

```bash
npm install -g @railway/cli
```

**2. Login and Initialize**

```bash
railway login
railway init
```

**3. Set Environment Variables**

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret
railway variables set MONGODB_URI=your_mongodb_uri
```

**4. Deploy**

```bash
railway up
```

### Deploying to DigitalOcean

**1. Create Droplet**

- Ubuntu 22.04 LTS
- Basic plan ($6/month)
- SSH key authentication

**2. Connect and Setup**

```bash
ssh root@your_droplet_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
npm install -g pm2

# Clone repository
git clone your_repo_url
cd server
npm install

# Setup environment
nano .env
# (paste your production environment variables)

# Start with PM2
pm2 start server.js --name ums-api
pm2 startup
pm2 save
```

**3. Setup Nginx (Reverse Proxy)**

```bash
sudo apt-get install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/ums-api
```

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ums-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**4. Setup SSL (Let's Encrypt)**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

---

## 🔧 Troubleshooting

### MongoDB Connection Failed

**Problem:** `MongoNetworkError: failed to connect`

**Solutions:**

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Verify connection string in .env
# Should be: mongodb://localhost:27017/university_marketplace
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**

```bash
# Find process using port 3000
lsof -i :3000  # On Mac/Linux
netstat -ano | findstr :3000  # On Windows

# Kill the process
kill -9 <PID>  # On Mac/Linux
taskkill /PID <PID> /F  # On Windows

# Or change port in .env
PORT=3001
```

### Module Not Found

**Problem:** `Error: Cannot find module 'express'`

**Solution:**

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### JWT Token Invalid

**Problem:** `JsonWebTokenError: invalid token`

**Solutions:**

1. Ensure JWT_SECRET is set in .env
2. Check token format: `Bearer <token>`
3. Token may have expired (check JWT_EXPIRE)
4. Re-login to get new token

### File Upload Fails

**Problem:** `Error: File size too large`

**Solutions:**

1. Check MAX_FILE_SIZE in .env (default 5MB)
2. Ensure image is JPEG/PNG/GIF/WebP
3. Check file permissions on uploads folder

```bash
chmod 755 uploads
```

### Rate Limit Exceeded

**Problem:** `Too many requests from this IP`

**Solutions:**

1. Wait 15 minutes
2. Adjust rate limits in .env:

```env
RATE_LIMIT_WINDOW_MS=900000  # Increase window
RATE_LIMIT_MAX_REQUESTS=200  # Increase limit
```

---

## 📊 Monitoring

### Check Server Health

```bash
curl http://localhost:3000/api/health
```

### View Logs

```bash
# Development
npm run dev  # Logs to console

# Production (with PM2)
pm2 logs ums-api
pm2 monit
```

### Monitor MongoDB

```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use university_marketplace

# Check collections
show collections

# Count documents
db.users.countDocuments()
db.listings.countDocuments()
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong random string
- [ ] Use MongoDB Atlas or secured MongoDB instance
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN to your frontend domain
- [ ] Enable rate limiting
- [ ] Set up backup strategy for database
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Review and test all endpoints
- [ ] Enable database authentication
- [ ] Use environment variables for all secrets
- [ ] Implement logging strategy
- [ ] Set up error tracking (e.g., Sentry)

---

## 📞 Support

For issues or questions:

1. Check API_DOCUMENTATION.md
2. Review this setup guide
3. Check GitHub issues
4. Contact development team

---

**Happy Coding! 🚀**
