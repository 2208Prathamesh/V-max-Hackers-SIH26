import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { successResponse } from '../utils/response.js';

/**
 * Create a new conversation
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const createConversation = async (req, res, next) => {
  try {
    const { title, category } = req.body;

    const conversation = await Conversation.create({
      userId: req.user._id,
      title: title || 'New Conversation',
      category: category || 'general'
    });

    return successResponse(
      res,
      conversation,
      'Conversation created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all conversations of logged-in user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user._id
    }).sort({ updatedAt: -1 });

    return successResponse(
      res,
      conversations,
      'Conversations retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single conversation
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    return successResponse(
      res,
      conversation,
      'Conversation retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a conversation
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Clean up associated messages
    await Message.deleteMany({ conversationId: id });

    return successResponse(res, null, 'Conversation deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Rename a conversation
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const renameConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Conversation title is required'
      });
    }

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id
      },
      {
        title: title.trim()
      },
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    return successResponse(
      res,
      conversation,
      'Conversation renamed successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

export {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation
};

export default {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation
};
