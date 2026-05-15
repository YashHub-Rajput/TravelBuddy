// File: server/services/socketService.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { Chat, Message } = require("../models/Chat");

let io;

/**
 * initSocket – Attaches Socket.io to the HTTP server.
 * Call once during server startup.
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // ── Auth middleware for socket connections ─────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId}`);

    // Each user joins their own personal room for direct notifications
    socket.join(socket.userId);

    // ── Join a chat room ─────────────────────────────────────────────────
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("leave_chat", (chatId) => {
      socket.leave(chatId);
    });

    // ── Send a message ───────────────────────────────────────────────────
    socket.on("send_message", async ({ chatId, content }) => {
      try {
        // Security: verify sender is a chat participant
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId,
        });
        if (!chat) return;

        // Persist message to DB
        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          content,
          readBy: [socket.userId],
        });

        await message.populate("sender", "name avatar");

        // Update chat's lastMessage pointer
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        // Broadcast to all participants in the room
        io.to(chatId).emit("new_message", message);
      } catch (err) {
        console.error("Socket send_message error:", err.message);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    // ── Typing indicators ────────────────────────────────────────────────
    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("user_typing", { userId: socket.userId, chatId });
    });

    socket.on("stop_typing", ({ chatId }) => {
      socket.to(chatId).emit("user_stop_typing", { userId: socket.userId });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};

/** Get the initialized io instance (throws if not yet initialized) */
const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket first.");
  return io;
};

module.exports = { initSocket, getIo };
