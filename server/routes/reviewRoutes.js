const express = require("express");
const router = express.Router();
const {
  createReview,
  getUserReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validation");

// Validation rules
const createReviewValidation = [
  body("reviewedUserId")
    .notEmpty()
    .withMessage("Reviewed user ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
  body("listingId")
    .notEmpty()
    .withMessage("Listing ID is required")
    .isMongoId()
    .withMessage("Invalid listing ID"),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
  body("transaction")
    .notEmpty()
    .withMessage("Transaction type is required")
    .isIn(["buyer", "seller"])
    .withMessage("Transaction must be either buyer or seller"),
];

const updateReviewValidation = [
  param("id").isMongoId().withMessage("Invalid review ID"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
];

// Routes
router.post("/", protect, createReviewValidation, validate, createReview);
router.get("/my-reviews", protect, getMyReviews);
router.get("/user/:userId", getUserReviews);
router.put("/:id", protect, updateReviewValidation, validate, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
