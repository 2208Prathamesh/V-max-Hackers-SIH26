const Conversation = require("../models/Conversation");
const { successResponse } = require("../utils/response");

/**
 * Create a new conversation
 */
const createConversation = async (req, res, next) => {
  try {
    const { title, category } = req.body;

    const conversation = await Conversation.create({
      userId: req.user._id,
      title: title || "New Conversation",
      category: category || "general",
    });

    return successResponse(
      res,
      201,
      "Conversation created successfully",
      conversation
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all conversations of logged-in user
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user._id,
    }).sort({ updatedAt: -1 });

    return successResponse(
      res,
      200,
      "Conversations retrieved successfully",
      conversations
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single conversation
 */
const getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return successResponse(
      res,
      200,
      "Conversation retrieved successfully",
      conversation
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a conversation
 */
const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return successResponse(
      res,
      200,
      "Conversation deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Rename a conversation
 */
const renameConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Conversation title is required",
      });
    }

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
      },
      {
        title: title.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return successResponse(
      res,
      200,
      "Conversation renamed successfully",
      conversation
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation,
};
