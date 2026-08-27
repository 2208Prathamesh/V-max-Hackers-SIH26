import express from 'express'
import {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  setFavorite
} from '../controllers/locationController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validationMiddleware from '../middleware/validationMiddleware.js'
import {
  locationSchema,
  updateLocationSchema
} from '../validators/locationValidator.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getLocations)
router.post('/', validationMiddleware(locationSchema), addLocation)
router.put('/:id', validationMiddleware(updateLocationSchema), updateLocation)
router.delete('/:id', deleteLocation)
router.patch('/:id/favorite', setFavorite)

export default router
