import express from 'express'

import {
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/me', getProfile)
router.patch('/me', updateProfile)
router.delete('/me', deleteAccount)

export default router
