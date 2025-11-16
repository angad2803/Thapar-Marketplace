const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Store active users
const activeUsers = new Map(); // userId -> socketId

/**
 * Initialize Socket.IO for chat
 */
const initializeChatSocket = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Add user to active users
    activeUsers.set(socket.userId, socket.id);

    // Emit online status to all users
    io.emit("user:online", { userId: socket.userId });

    // Send list of online users to the connected user
    socket.emit("users:online", Array.from(activeUsers.keys()));

    // Join user to their personal room
    socket.join(socket.userId);

    // Handle sending messages
    socket.on("message:send", async (data) => {
      try {
        const { receiverId, content, listingId, isEncrypted } = data;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          return socket.emit("error", { message: "Receiver not found" });
        }

        // Create conversation ID
        const conversationId = Message.createConversationId(
          socket.userId,
          receiverId
        );

        // Save message to database (content is already encrypted if isEncrypted=true)
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          receiverId,
          content,
          listingId,
          isEncrypted: isEncrypted || false,
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "name email profileImage publicKey")
          .populate("receiverId", "name email profileImage publicKey")
          .populate("listingId", "title price images");

        // Send message to sender (confirmation)
        socket.emit("message:received", populatedMessage);

        // Send message to receiver (if online)
        io.to(receiverId).emit("message:new", populatedMessage);

        // Create persistent notification
        await Notification.create({
          userId: receiverId,
          type: "message",
          title: "New Message",
          message: `${socket.user.name} sent you a message`,
          relatedId: message._id,
          relatedModel: "Message",
          priority: "medium",
        });

        // Send real-time notification to receiver
        io.to(receiverId).emit("notification:new", {
          type: "message",
          message: `New message from ${socket.user.name}`,
          data: populatedMessage,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing:start", (receiverId) => {
      io.to(receiverId).emit("user:typing", {
        userId: socket.userId,
        userName: socket.user.name,
      });
    });

    socket.on("typing:stop", (receiverId) => {
      io.to(receiverId).emit("user:stop-typing", {
        userId: socket.userId,
      });
    });

    // Handle message read receipts
    socket.on("message:read", async (messageId) => {
      try {
        const message = await Message.findById(messageId);

        if (message && message.receiverId.toString() === socket.userId) {
          await message.markAsRead();

          // Notify sender that message was read
          io.to(message.senderId.toString()).emit("message:read", {
            messageId,
            readAt: message.readAt,
          });
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);

      // Remove user from active users
      activeUsers.delete(socket.userId);

      // Emit offline status to all users
      io.emit("user:offline", { userId: socket.userId });
    });
  });
};

module.exports = { initializeChatSocket, activeUsers };
