const express = require("express");
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserProfile,
} = require("../controllers/userController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { param } = require("../middleware/validation");

// User profile routes
router.get("/:userId/profile", optionalAuth, getUserProfile);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

// Follow/Unfollow routes
router.post("/:userId/follow", protect, followUser);
router.delete("/:userId/follow", protect, unfollowUser);

module.exports = router;
