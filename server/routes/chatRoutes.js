const express = require("express");
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessageValidation,
  userIdValidation,
  mongoIdValidation,
  validate,
} = require("../middleware/validation");

// All routes are protected
router.use(protect);

// Chat routes
router.get("/conversations", getConversations);
router.get("/unread/count", getUnreadCount);
router.get("/:userId", userIdValidation, validate, getMessages);
router.post("/", sendMessageValidation, validate, sendMessage);
router.put("/:id/read", mongoIdValidation, validate, markAsRead);
router.delete("/:id", mongoIdValidation, validate, deleteMessage);

module.exports = router;
