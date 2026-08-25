const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const chatService = require("../services/chatService");
const { successResponse } = require("../utils/response");

/**
 * Send a message to WeatherGPT
 */
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId,
      sender: "user",
      content: content.trim(),
      messageType: "text",
    });

    // Generate WeatherGPT response
    const aiResponse = await chatService.generateResponse({
      conversationId,
      userId: req.user._id,
      message: content.trim(),
    });

    // Save AI response
    const aiMessage = await Message.create({
      conversationId,
      sender: "ai",
      content: aiResponse.content,
      messageType: aiResponse.messageType || "text",
      metadata: aiResponse.metadata || {},
    });

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    return successResponse(
      res,
      201,
      "Message sent successfully",
      {
        userMessage,
        aiMessage,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all messages of a conversation
 */
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });

    return successResponse(
      res,
      200,
      "Messages retrieved successfully",
      messages
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a message
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find message
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this message",
      });
    }

    await Message.findByIdAndDelete(id);

    return successResponse(
      res,
      200,
      "Message deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
};