const express = require("express");

const {
  sendMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", sendMessage);

router.get("/:conversationId", getMessages);

router.delete("/:id", deleteMessage);

module.exports = router;