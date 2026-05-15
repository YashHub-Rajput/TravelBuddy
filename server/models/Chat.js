// File: server/models/Chat.js
// Contains both Chat and Message models (they are tightly coupled)

const mongoose = require("mongoose");

// ── Message Schema ─────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content cannot be empty"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ── Chat Schema ────────────────────────────────────────────────────────────
const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    trip: {
      // Optional: links group chat to a trip
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },
    name: { type: String, trim: true }, // Used for group chats
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

// Prevent duplicate direct chats between the same two users
chatSchema.index({ type: 1, participants: 1 });

const Chat = mongoose.model("Chat", chatSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { Chat, Message };
