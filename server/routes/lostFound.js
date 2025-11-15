const express = require("express");
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  updateStatus,
  deleteItem,
} = require("../controllers/lostFoundController");
const { protect, authorize } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer for lost & found images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "lostfound-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
}).array("images", 3);

// Public routes
router.get("/", getAllItems);
router.get("/:id", getItemById);

// Admin only routes
router.post("/", protect, authorize("admin"), upload, createItem);
router.put("/:id/status", protect, authorize("admin"), updateStatus);
router.delete("/:id", protect, authorize("admin"), deleteItem);

module.exports = router;
