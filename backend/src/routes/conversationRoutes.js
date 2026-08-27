import express from 'express'
import {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation
} from '../controllers/conversationController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validationMiddleware from '../middleware/validationMiddleware.js'
import {
  createConversationSchema,
  renameConversationSchema
} from '../validators/chatValidator.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/', validationMiddleware(createConversationSchema), createConversation)
router.get('/', getConversations)
router.get('/:id', getConversation)
router.delete('/:id', deleteConversation)
router.patch('/:id/rename', validationMiddleware(renameConversationSchema), renameConversation)

export default router
