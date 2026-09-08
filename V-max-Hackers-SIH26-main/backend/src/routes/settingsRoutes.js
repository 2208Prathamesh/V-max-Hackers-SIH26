import express from 'express'

import {
  getSettings,
  updateSettings,
  changePassword
} from '../controllers/settingsController.js'

import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getSettings)

router.put('/', updateSettings)

router.patch('/password', changePassword)

export default router
