const express = require("express");

const {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation,
} = require("../controllers/conversationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All conversation routes require authentication
router.use(authMiddleware);

router.post("/", createConversation);

router.get("/", getConversations);

router.get("/:id", getConversation);

router.delete("/:id", deleteConversation);

router.patch("/:id/rename", renameConversation);

module.exports = router;