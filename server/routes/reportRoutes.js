const express = require("express");
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReport,
  updateReport,
  deleteReport,
  getMyReports,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createReportValidation,
  mongoIdValidation,
  validate,
} = require("../middleware/validation");

// User routes
router.post("/", protect, createReportValidation, validate, createReport);
router.get("/my/reports", protect, getMyReports);

// Admin routes
router.get("/", protect, authorize("admin"), getAllReports);
router.get(
  "/:id",
  protect,
  authorize("admin"),
  mongoIdValidation,
  validate,
  getReport
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  mongoIdValidation,
  validate,
  updateReport
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  mongoIdValidation,
  validate,
  deleteReport
);

module.exports = router;
