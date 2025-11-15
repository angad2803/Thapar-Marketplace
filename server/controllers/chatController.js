const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * @desc    Get conversations for current user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$receiverId", new mongoose.Types.ObjectId(userId)],
                    },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    // Populate user details
    for (let conv of conversations) {
      const otherUserId =
        conv.lastMessage.senderId.toString() === userId
          ? conv.lastMessage.receiverId
          : conv.lastMessage.senderId;

      conv.otherUser = await User.findById(otherUserId).select(
        "name email profileImage university"
      );
    }

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get messages between two users
 * @route   GET /api/chat/:userId
 * @access  Private
 */
exports.getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    // Create conversation ID
    const conversationId = Message.createConversationId(
      currentUserId,
      otherUserId
    );

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort("createdAt")
      .populate("senderId", "name email profileImage publicKey")
      .populate("receiverId", "name email profileImage publicKey")
      .populate("listingId", "title price images");

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message
 * @route   POST /api/chat
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, listingId, isEncrypted } = req.body;
    const senderId = req.user.id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Create conversation ID
    const conversationId = Message.createConversationId(senderId, receiverId);

    // Create message
    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      content,
      listingId,
      isEncrypted: isEncrypted || false,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email profileImage publicKey")
      .populate("receiverId", "name email profileImage publicKey")
      .populate("listingId", "title price images");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/chat/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the receiver
    if (message.receiverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await message.markAsRead();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/chat/:id
 * @access  Private
 */
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/chat/unread/count
 * @access  Private
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};
