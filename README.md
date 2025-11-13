"# University Marketplace

A full-stack marketplace platform for university students to buy, sell, bid on, and swap items.

## 🏗️ Project Structure

```
university-marketplace/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Client dependencies
│
├── server/                # Backend Node.js/Express API
│   ├── routes/            # API route handlers
│   ├── models/            # MongoDB models
│   ├── middleware/        # Express middleware
│   ├── index.js           # Server entry point
│   └── package.json       # Server dependencies
│
└── package.json           # Root workspace scripts
```

## ✨ Features

- 🛒 **Marketplace**: Buy and sell items
- 💰 **Bidding System**: Bid on items
- 🔄 **Item Swapping**: Trade items with other users
- 🛍️ **Shopping Cart**: Manage your purchases
- 🔐 **Authentication**: Secure user authentication with JWT
- 📦 **Order Management**: Track your orders

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or bun package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd university-marketplace
   ```

2. **Install all dependencies**

   ```bash
   npm run install:all
   ```

   Or install separately:

   ```bash
   npm run install:client
   npm run install:server
   ```

3. **Configure environment variables**

   **Server (.env in server/ folder):**

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost/ziddi
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

   **Client (.env in client/ folder):**

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start MongoDB**

   ```bash
   mongod
   ```

5. **Run the application**

   Development mode (both client and server):

   ```bash
   npm run dev
   ```

   Or run separately:

   ```bash
   # Terminal 1 - Server
   npm run dev:server

   # Terminal 2 - Client
   npm run dev:client
   ```

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`

- `/api/auth` - Authentication routes
- `/api/products` - Product management
- `/api/cart` - Shopping cart operations
- `/api/bid` - Bidding functionality
- `/api/swap` - Item swapping
- `/api/order` - Order management
- `/api/health` - Health check endpoint

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **CORS**: Enabled for cross-origin requests

## 📝 Available Scripts

### Root Level

- `npm run install:all` - Install all dependencies (client + server)
- `npm run dev` - Run both client and server in development mode
- `npm run dev:client` - Run only the client
- `npm run dev:server` - Run only the server
- `npm run build:client` - Build the client for production
- `npm start` - Start the production server

### Client (in client/ folder)

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server (in server/ folder)

- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## 🌐 Default Ports

- **Client**: http://localhost:8080
- **Server**: http://localhost:3000

## 📦 Building for Production

1. **Build the client**

   ```bash
   npm run build:client
   ```

2. **Start the server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

Your Team Name

---

**Note**: Make sure MongoDB is running before starting the server. Update the environment variables according to your setup.
"
