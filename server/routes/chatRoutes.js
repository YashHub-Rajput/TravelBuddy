// File: server/routes/chatRoutes.js
const express = require("express");
const {
  getOrCreateDirectChat,
  createGroupChat,
  getMyChats,
  getChatMessages,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", getMyChats);
router.post("/direct/:userId", getOrCreateDirectChat);
router.post("/group", createGroupChat);
router.get("/:chatId/messages", getChatMessages);

module.exports = router;
