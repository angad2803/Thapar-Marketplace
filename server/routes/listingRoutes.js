const express = require("express");
const router = express.Router();
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/listingController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createListingValidation,
  updateListingValidation,
  listingQueryValidation,
  mongoIdValidation,
  validate,
} = require("../middleware/validation");

// Public routes (with optional auth for personalization)
router.get("/", optionalAuth, listingQueryValidation, validate, getListings);
router.get("/wishlist", protect, getWishlist);
router.get("/my/listings", protect, getMyListings);
router.get("/:id", optionalAuth, mongoIdValidation, validate, getListing);

// Protected routes
router.post(
  "/",
  protect,
  upload.array("images", 5),
  createListingValidation,
  validate,
  createListing
);

router.put(
  "/:id",
  protect,
  upload.array("images", 5),
  updateListingValidation,
  validate,
  updateListing
);

router.delete("/:id", protect, mongoIdValidation, validate, deleteListing);

// Wishlist routes
router.post(
  "/:id/wishlist",
  protect,
  mongoIdValidation,
  validate,
  addToWishlist
);
router.delete(
  "/:id/wishlist",
  protect,
  mongoIdValidation,
  validate,
  removeFromWishlist
);

module.exports = router;
