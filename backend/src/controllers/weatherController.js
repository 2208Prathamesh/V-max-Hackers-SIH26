import weatherService from '../services/weather/weatherService.js'
import { successResponse } from '../utils/response.js'

/**
 * Get current weather
 *
 * GET /api/weather/current?city=Pune
 */
const getCurrentWeather = async (req, res, next) => {
    try {
        const { city, latitude, longitude } = req.query

        const lat =
            latitude !== undefined
                ? Number(latitude)
                : undefined

        const lon =
            longitude !== undefined
                ? Number(longitude)
                : undefined

        if (
            !city &&
            (
                lat === undefined ||
                lon === undefined ||
                Number.isNaN(lat) ||
                Number.isNaN(lon)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'City or latitude and longitude are required'
            })
        }

        const weather = await weatherService.getWeather(
            lat,
            lon
        )

        return successResponse(
          res,
          weather,
          'Current weather retrieved successfully',
          200
        )
    } catch (error) {
        next(error)
    }
}

/**
 * Get weather forecast
 *
 * GET /api/weather/forecast?city=Pune&days=7
 */
const getForecast = async (req, res, next) => {
    try {
        const { city, latitude, longitude, days = 7 } = req.query

        const lat =
            latitude !== undefined
                ? Number(latitude)
                : undefined

        const lon =
            longitude !== undefined
                ? Number(longitude)
                : undefined

        if (
            !city &&
            (
                lat === undefined ||
                lon === undefined ||
                Number.isNaN(lat) ||
                Number.isNaN(lon)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'City or latitude and longitude are required'
            })
        }

        const numberOfDays = Number(days)

        if (
            Number.isNaN(numberOfDays) ||
            numberOfDays < 1 ||
            numberOfDays > 7
        ) {
            return res.status(400).json({
                success: false,
                message: 'Days must be between 1 and 7'
            })
        }

        const forecast = await weatherService.getForecast(
            lat,
            lon,
            numberOfDays
        )

        return successResponse(
            res,
            forecast,
            'Weather forecast retrieved successfully',
            200
        )
    } catch (error) {
        next(error)
    }
}

/**
 * Get hourly weather forecast
 *
 * GET /api/weather/hourly?city=Pune
 */
const getHourlyForecast = async (req, res, next) => {
    try {
        const {
            city,
            latitude,
            longitude,
            hours = 24
        } = req.query

        const lat =
            latitude !== undefined
                ? Number(latitude)
                : undefined

        const lon =
            longitude !== undefined
                ? Number(longitude)
                : undefined

        if (
            !city &&
            (
                lat === undefined ||
                lon === undefined ||
                Number.isNaN(lat) ||
                Number.isNaN(lon)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'City or latitude and longitude are required'
            })
        }

        const numberOfHours = Number(hours)

        if (
            Number.isNaN(numberOfHours) ||
            numberOfHours < 1 ||
            numberOfHours > 48
        ) {
            return res.status(400).json({
                success: false,
                message: 'Hours must be between 1 and 48'
            })
        }

        const forecast = await weatherService.getHourlyForecast({
            latitude: lat,
            longitude: lon,
            hours: numberOfHours
        })

        return successResponse(
            res,
            forecast,
            'Hourly forecast retrieved successfully',
            200
        )
    } catch (error) {
        next(error)
    }
}

export { getCurrentWeather, getForecast, getHourlyForecast }
