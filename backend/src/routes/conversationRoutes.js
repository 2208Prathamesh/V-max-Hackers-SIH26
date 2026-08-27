import express from 'express'

import {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation
} from '../controllers/conversationController.js'

import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// All conversation routes require authentication
router.use(authMiddleware)

router.post('/', createConversation)

router.get('/', getConversations)

router.get('/:id', getConversation)

router.delete('/:id', deleteConversation)

router.patch('/:id/rename', renameConversation)

export default router
