const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  updateUserBadges,
  deleteUser,
  bulkBanUsers,
  getAllListings,
  deleteListing,
  bulkDeleteListings,
  getAllReviews,
  deleteReview,
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getDashboardStats,
  getPlatformAnalytics,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { mongoIdValidation, validate } = require("../middleware/validation");

// All routes are protected and admin-only
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/analytics", getPlatformAnalytics);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", mongoIdValidation, validate, getUserDetails);
router.put("/users/:id/status", mongoIdValidation, validate, updateUserStatus);
router.put("/users/:id/role", mongoIdValidation, validate, updateUserRole);
router.put("/users/:id/badges", mongoIdValidation, validate, updateUserBadges);
router.delete("/users/:id", mongoIdValidation, validate, deleteUser);
router.post("/users/bulk-ban", bulkBanUsers);

// Listing management
router.get("/listings", getAllListings);
router.delete("/listings/:id", mongoIdValidation, validate, deleteListing);
router.post("/listings/bulk-delete", bulkDeleteListings);
// Delete all listings
router.delete(
  "/listings/all",
  require("../controllers/adminController").deleteAllListings
);

// Review management
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", mongoIdValidation, validate, deleteReview);

// Announcement management
router
  .route("/announcements")
  .get(getAllAnnouncements)
  .post(createAnnouncement);

router
  .route("/announcements/:id")
  .put(mongoIdValidation, validate, updateAnnouncement)
  .delete(mongoIdValidation, validate, deleteAnnouncement);

module.exports = router;
