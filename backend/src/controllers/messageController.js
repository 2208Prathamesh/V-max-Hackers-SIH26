import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import chatService from '../services/chatService.js'
import { successResponse } from '../utils/response.js'

/**
 * Send a message to WeatherGPT
 */
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, messageType } = req.body

    console.log('[BACKEND CHAT] Request received:', { conversationId, content });

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      })
    }

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId,
      sender: 'user',
      content: content.trim(),
      messageType: messageType || 'text'
    })

    console.log('[BACKEND CHAT] Calling AI...');
    // Generate WeatherGPT response — pass user role and optional location for role-aware intelligence
    const aiResponse = await chatService.generateResponse({
      conversationId,
      userId: req.user._id,
      message: content.trim(),
      userRole: req.user?.role || 'user',
      latitude: req.body.latitude || null,
      longitude: req.body.longitude || null,
      userLocation: req.body.location || req.user?.location || null
    })
    console.log('[BACKEND CHAT] AI RESPONSE:', aiResponse);

    // Save AI response
    console.log('[BACKEND CHAT] Saving assistant message...');
    const aiMessage = await Message.create({
      conversationId,
      sender: 'ai',
      content: aiResponse.content,
      messageType: aiResponse.messageType || 'text',
      metadata: aiResponse.metadata || {}
    })
    console.log('[BACKEND CHAT] Assistant message saved:', aiMessage._id);

    // Update conversation timestamp
    conversation.updatedAt = new Date()
    await conversation.save()

    const responsePayload = { userMessage, aiMessage };
    console.log('[BACKEND CHAT] Sending response to frontend:', responsePayload);

    return successResponse(
      res,
      responsePayload,
      'Message sent successfully',
      201
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Get all messages of a conversation
 */
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }

    const messages = await Message.find({
      conversationId
    }).sort({ createdAt: 1 })

    return successResponse(
      res,
      messages,
      'Messages retrieved successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a message
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params

    const message = await Message.findById(id)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      userId: req.user._id
    })

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this message'
      })
    }

    await Message.findByIdAndDelete(id)

    return successResponse(res, null, 'Message deleted successfully', 200)
  } catch (error) {
    next(error)
  }
}

export { sendMessage, getMessages, deleteMessage }
export default { sendMessage, getMessages, deleteMessage }
