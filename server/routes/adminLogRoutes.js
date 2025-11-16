const express = require("express");
const router = express.Router();
const {
  getAdminLogs,
  createAdminLog,
} = require("../controllers/adminLogController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All admin log routes require admin
router.use(protect);
router.use(authorize("admin"));

router.get("/", getAdminLogs);
router.post("/", createAdminLog);

module.exports = router;
