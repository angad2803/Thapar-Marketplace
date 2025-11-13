# University Marketplace - Development Guide

## 📋 Quick Start Guide

### First Time Setup

1. **Clone and navigate to the project**

   ```bash
   cd d:\SE
   ```

2. **Install root dependencies (for running both servers together)**

   ```bash
   npm install
   ```

3. **Install client and server dependencies**

   ```bash
   npm run install:all
   ```

4. **Setup environment files**

   Copy the example files and update with your values:

   ```bash
   # Client
   cp client/.env.example client/.env

   # Server
   cp server/.env.example server/.env
   ```

5. **Start MongoDB**

   ```bash
   mongod
   ```

6. **Run the application**

   ```bash
   npm run dev
   ```

   This will start:

   - Client on http://localhost:8080
   - Server on http://localhost:3000

## 🗂️ New Project Structure

```
university-marketplace/
│
├── 📁 client/                    # Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/       # React components
│   │   │   ├── 📁 ui/           # shadcn/ui components
│   │   │   ├── Navbar.tsx
│   │   │   └── NavLink.tsx
│   │   ├── 📁 pages/            # Page components
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PostItem.tsx
│   │   │   └── ProductDetails.tsx
│   │   ├── 📁 hooks/            # Custom hooks
│   │   ├── 📁 lib/              # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── 📁 public/               # Static assets
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── README.md
│
├── 📁 server/                    # Backend API
│   ├── 📁 routes/               # API endpoints
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── bid.js
│   │   ├── swap.js
│   │   └── order.js
│   ├── 📁 models/               # Database models
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── order.js
│   │   └── offer.js
│   ├── 📁 middleware/           # Express middleware
│   │   └── auth.js
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── README.md
│
├── package.json                  # Root scripts for both
├── README.md                     # Main documentation
└── .gitignore                    # Root gitignore

```

## 🔄 Migration Summary

### Changes Made

1. **Separated Frontend and Backend**

   - Moved all frontend code to `client/` folder
   - Moved all backend code to `server/` folder
   - Removed old `backend/` folder

2. **Updated Configurations**

   - Server routes now use `/api` prefix for better organization
   - Added environment variable support with `.env.example` files
   - Updated package.json files with better names and scripts

3. **Improved Server Code**

   - Added dotenv configuration
   - Improved error handling
   - Added health check endpoint
   - Better logging with status symbols

4. **Added Documentation**
   - Comprehensive README files for root, client, and server
   - Environment variable examples
   - Setup instructions

## 🔧 Development Workflow

### Working on Frontend

```bash
cd client
npm run dev
```

### Working on Backend

```bash
cd server
npm run dev
```

### Running Both Together

```bash
# From root directory
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build:client

# Start backend
npm start
```

## 📡 API Changes

**Old Routes:**

- `/auth` → `/products` → `/cart` etc.

**New Routes (with /api prefix):**

- `/api/auth`
- `/api/products`
- `/api/cart`
- `/api/bid`
- `/api/swap`
- `/api/order`
- `/api/health` (new)

**Important:** Update frontend API calls to use the new `/api` prefix!

## ✅ Benefits of New Structure

1. **Clear Separation**: Frontend and backend are completely separate
2. **Independent Deployment**: Can deploy client and server separately
3. **Better Organization**: Easier to navigate and understand
4. **Scalability**: Easy to add new features to either side
5. **Team Collaboration**: Different teams can work on client/server independently
6. **Modern Architecture**: Follows industry best practices

## 🚨 Breaking Changes

1. All API routes now require `/api` prefix
2. Update any hardcoded API URLs in frontend code
3. Environment variables are now required (see `.env.example` files)

## 📝 Next Steps

1. ✅ Update frontend API calls to use new `/api` prefix
2. ✅ Set up environment variables
3. ✅ Test all functionality
4. Consider adding:
   - Docker support
   - CI/CD pipeline
   - API documentation (Swagger)
   - Testing suites
   - Database migrations

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in server/.env

### Port Already in Use

- Change PORT in server/.env
- Change port in client/vite.config.ts

### CORS Errors

- Verify VITE_API_URL in client/.env
- Check CORS configuration in server/index.js

### Module Not Found

- Run `npm run install:all` from root
- Or `npm install` in both client and server folders

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Express Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

Happy coding! 🚀
