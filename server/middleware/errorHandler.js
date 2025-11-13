/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV === "development") {
    console.error("Error Stack:", err.stack);
    console.error("Error Details:", err);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      statusCode: 404,
      message,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
    error = {
      statusCode: 400,
      message,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      statusCode: 400,
      message,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      statusCode: 401,
      message: "Invalid token",
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      statusCode: 401,
      message: "Token expired",
    };
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    error = {
      statusCode: 400,
      message: "File size too large. Maximum size is 5MB",
    };
  }

  // Multer file type error
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error = {
      statusCode: 400,
      message: "Too many files uploaded",
    };
  }

  res.status(error.statusCode || err.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  });
};

/**
 * Not Found Middleware
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
