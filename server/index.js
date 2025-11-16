require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const lostFoundRoutes = require("./routes/lostFound");
const { initializeChatSocket } = require("./socket/chatSocket");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  })
);

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/ziddi";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✓ MongoDB connected"))
  .catch((e) => console.error("✗ MongoDB connection error:", e));

// Initialize Socket.IO for chat
initializeChatSocket(io);

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lost-found", lostFoundRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Root endpoint - API documentation
app.get("/", (req, res) => {
  res.json({
    message: "HostelKart API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/health",
      auth: {
        base: "/api/auth",
        routes: [
          "POST /register",
          "POST /login",
          "GET /me",
          "GET /google",
          "PUT /update-profile",
        ],
      },
      listings: {
        base: "/api/listings",
        routes: [
          "GET /",
          "POST /",
          "GET /:id",
          "PUT /:id",
          "DELETE /:id",
          "GET /my-listings",
          "GET /wishlist",
        ],
      },
      users: {
        base: "/api/users",
        routes: [
          "GET /:userId/profile",
          "POST /:userId/follow",
          "DELETE /:userId/follow",
          "GET /:userId/listings",
          "GET /:userId/reviews",
        ],
      },
      chat: {
        base: "/api/chat",
        routes: [
          "GET /conversations",
          "GET /:recipientId",
          "POST /:recipientId",
        ],
      },
      reviews: {
        base: "/api/reviews",
        routes: [
          "POST /",
          "GET /user/:userId",
          "GET /my-reviews",
          "PUT /:reviewId",
          "DELETE /:reviewId",
        ],
      },
      lostFound: {
        base: "/api/lost-found",
        routes: [
          "GET /",
          "GET /:id",
          "POST /",
          "PUT /:id/status",
          "DELETE /:id",
        ],
      },
      admin: {
        base: "/api/admin",
        routes: [
          "GET /stats",
          "GET /users",
          "PUT /users/:userId/status",
          "PUT /users/:userId/badges",
          "GET /reviews",
          "DELETE /reviews/:reviewId",
        ],
      },
    },
    documentation: "Visit the frontend for full documentation",
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: ["/", "/api/health"],
  });
});

// Start server with Socket.IO
server.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ WebSocket server ready`);
});
