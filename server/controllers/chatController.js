// File: server/controllers/chatController.js
const { Chat, Message } = require("../models/Chat");

/**
 * POST /api/chats/direct/:userId
 * Find or create a 1-on-1 chat between current user and target user.
 */
const getOrCreateDirectChat = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    // Check for existing direct chat
    let chat = await Chat.findOne({
      type: "direct",
      participants: { $all: [currentUserId, userId], $size: 2 },
    }).populate("participants", "name avatar isVerified");

    if (!chat) {
      chat = await Chat.create({
        type: "direct",
        participants: [currentUserId, userId],
      });
      await chat.populate("participants", "name avatar isVerified");
    }

    res.json({ chat });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/chats/group
 * Create a group chat, optionally tied to a trip.
 */
const createGroupChat = async (req, res, next) => {
  try {
    const { name, tripId, participantIds } = req.body;

    const chat = await Chat.create({
      type: "group",
      name,
      trip: tripId,
      participants: [req.user._id, ...(participantIds || [])],
    });

    await chat.populate("participants", "name avatar isVerified");
    res.status(201).json({ chat });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/chats
 * Get all chats where current user is a participant.
 */
const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate("participants", "name avatar isVerified")
      .populate({ path: "lastMessage", populate: { path: "sender", select: "name" } })
      .populate("trip", "destination")
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/chats/:chatId/messages
 * Load paginated messages for a chat.
 */
const getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify current user is a participant
    const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });
    if (!chat) return res.status(403).json({ message: "Access denied." });

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Mark all unread messages as read
    await Message.updateMany(
      { chat: chatId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ messages: messages.reverse(), chatId });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrCreateDirectChat,
  createGroupChat,
  getMyChats,
  getChatMessages,
};
