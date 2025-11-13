require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet()); // Set security headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
    credentials: true,
  })
);

// Session middleware (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use("/api", limiter);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Serve static files (uploads)
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to University Marketplace Management Portal API",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      auth: "/api/auth",
      listings: "/api/listings",
      chat: "/api/chat",
      admin: "/api/admin",
      reports: "/api/reports",
      health: "/api/health",
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🎓 University Marketplace Management Portal (UMS)");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  ✓ Server running on: http://localhost:${PORT}`);
  console.log(`  ✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `  ✓ Database: ${process.env.MONGODB_URI ? "Connected" : "Not configured"}`
  );
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("  📚 API Endpoints:");
  console.log(`     - Auth:      http://localhost:${PORT}/api/auth`);
  console.log(`     - Listings:  http://localhost:${PORT}/api/listings`);
  console.log(`     - Chat:      http://localhost:${PORT}/api/chat`);
  console.log(`     - Admin:     http://localhost:${PORT}/api/admin`);
  console.log(`     - Reports:   http://localhost:${PORT}/api/reports`);
  console.log(`     - Health:    http://localhost:${PORT}/api/health`);
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`✗ Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`✗ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠ SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✓ HTTP server closed");
    process.exit(0);
  });
});

module.exports = app;
