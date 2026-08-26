import express from 'express'

import {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  setFavorite
} from '../controllers/locationController.js'

import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getLocations)

router.post('/', addLocation)

router.put('/:id', updateLocation)

router.delete('/:id', deleteLocation)

router.patch('/:id/favorite', setFavorite)

export default router
