import express from 'express'
import {
  sendMessage,
  getMessages,
  deleteMessage
} from '../controllers/messageController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validationMiddleware from '../middleware/validationMiddleware.js'
import { sendMessageSchema } from '../validators/chatValidator.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/', validationMiddleware(sendMessageSchema), sendMessage)
router.get('/:conversationId', getMessages)
router.delete('/:id', deleteMessage)

export default router
