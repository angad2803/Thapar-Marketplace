const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getAllListings,
  deleteListing,
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { mongoIdValidation, validate } = require("../middleware/validation");

// All routes are protected and admin-only
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", mongoIdValidation, validate, getUserDetails);
router.put("/users/:id/status", mongoIdValidation, validate, updateUserStatus);
router.delete("/users/:id", mongoIdValidation, validate, deleteUser);

// Listing management
router.get("/listings", getAllListings);
router.delete("/listings/:id", mongoIdValidation, validate, deleteListing);

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
