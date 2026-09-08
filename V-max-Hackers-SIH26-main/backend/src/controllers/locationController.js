import SavedLocation from '../models/SavedLocation.js'
import { successResponse } from '../utils/response.js'
import weatherService from '../services/weather/weatherService.js'

/**
 * Get all saved locations
 */
const getLocations = async (req, res, next) => {
  try {
    const locations = await SavedLocation.find({
      userId: req.user._id
    }).sort({
      isFavorite: -1,
      createdAt: -1
    })

    const enrichedLocations = await Promise.all(
      locations.map(async location => {
        try {
          const [weatherData, forecastData] = await Promise.all([
            weatherService.getWeather(
              location.latitude,
              location.longitude
            ),
            weatherService.getForecast(
              location.latitude,
              location.longitude,
              3
            )
          ])

          const current = weatherData?.forecast?.current
          const forecast =
            forecastData?.models?.openMeteo?.daily || []

          return {
            ...location.toObject(),

            id: location._id,

            region: location.state,

            lat: location.latitude,
            lng: location.longitude,

            // Current weather
            condition:
              current?.weatherDescription ||
              current?.condition ||
              'Unknown',

            tempC: current?.temperature ?? null,

            feelsLikeC:
              current?.apparentTemperature ?? null,

            humidity:
              current?.humidity ?? null,

            windSpeedKmh:
              current?.windSpeed ?? null,

            windDirection:
              current?.windDirection ?? '',

            updatedTime: new Date().toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit'
            }),

            // 3-day forecast
            forecast3Day: forecast.slice(0, 3).map(day => ({
              day: day.date
                ? new Date(day.date).toLocaleDateString([], {
                    weekday: 'short'
                  })
                : '--',

              condition:
                day.weatherDescription ||
                day.condition ||
                'Unknown',

              temp:
                day.temperature ??
                day.temperatureMax ??
                null
            }))
          }
        } catch (weatherError) {
          // Don't make the entire saved-locations request fail
          // if one weather provider/location is temporarily unavailable.
          console.error(
            `Weather enrichment failed for ${location.city}:`,
            weatherError.message
          )

          return {
            ...location.toObject(),

            id: location._id,

            region: location.state,

            lat: location.latitude,
            lng: location.longitude,

            condition: 'Weather unavailable',
            tempC: null,
            feelsLikeC: null,
            humidity: null,
            windSpeedKmh: null,
            windDirection: '',
            updatedTime: null,
            forecast3Day: []
          }
        }
      })
    )

    return successResponse(
      res,
      200,
      'Locations retrieved successfully',
      enrichedLocations
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Add a new saved location
 */
const addLocation = async (req, res, next) => {
  try {
    const { name, city, state, country, latitude, longitude, isFavorite } =
      req.body

    // Basic validation
    if (
      !name ||
      !city ||
      !country ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, city, country, latitude and longitude are required'
      })
    }

    // Check if location already exists
    const existingLocation = await SavedLocation.findOne({
      userId: req.user._id,
      latitude,
      longitude
    })

    if (existingLocation) {
      return res.status(409).json({
        success: false,
        message: 'This location is already saved'
      })
    }

    // If user wants this as favorite,
    // remove favorite from other locations
    if (isFavorite === true) {
      await SavedLocation.updateMany(
        { userId: req.user._id },
        { $set: { isFavorite: false } }
      )
    }

    const location = await SavedLocation.create({
      userId: req.user._id,
      name,
      city,
      state,
      country,
      latitude,
      longitude,
      isFavorite: isFavorite || false
    })

    return successResponse(res, 201, 'Location added successfully', location)
  } catch (error) {
    next(error)
  }
}

/**
 * Update a saved location
 */
const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params

    const location = await SavedLocation.findOne({
      _id: id,
      userId: req.user._id
    })

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      })
    }

    const { name, city, state, country, latitude, longitude, isFavorite } =
      req.body

    // If changing favorite to true,
    // remove favorite from other locations
    if (isFavorite === true) {
      await SavedLocation.updateMany(
        {
          userId: req.user._id,
          _id: { $ne: id }
        },
        {
          $set: { isFavorite: false }
        }
      )
    }

    if (name !== undefined) location.name = name
    if (city !== undefined) location.city = city
    if (state !== undefined) location.state = state
    if (country !== undefined) location.country = country
    if (latitude !== undefined) location.latitude = latitude
    if (longitude !== undefined) location.longitude = longitude
    if (isFavorite !== undefined) {
      location.isFavorite = isFavorite
    }

    await location.save()

    return successResponse(res, 200, 'Location updated successfully', location)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a saved location
 */
const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params

    const location = await SavedLocation.findOneAndDelete({
      _id: id,
      userId: req.user._id
    })

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      })
    }

    return successResponse(res, 200, 'Location deleted successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Set a location as favorite
 */
const setFavorite = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check location ownership
    const location = await SavedLocation.findOne({
      _id: id,
      userId: req.user._id
    })

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      })
    }

    // Remove favorite from all user's locations
    await SavedLocation.updateMany(
      {
        userId: req.user._id,
        _id: { $ne: id }
      },
      {
        $set: { isFavorite: false }
      }
    )

    // Set selected location as favorite
    location.isFavorite = true
    await location.save()

    return successResponse(
      res,
      200,
      'Favorite location updated successfully',
      location
    )
  } catch (error) {
    next(error)
  }
}

export {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  setFavorite
}
