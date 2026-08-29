import express from 'express'
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteAccount
} from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validationMiddleware from '../middleware/validationMiddleware.js'
import { updateUserSchema } from '../validators/userValidator.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/me', getProfile)
router.patch('/me', validationMiddleware(updateUserSchema), updateProfile)
router.post('/me/image', uploadProfileImage)
router.delete('/me', deleteAccount)

export default router
