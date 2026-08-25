const weatherService = require("../services/weatherService");
const { successResponse } = require("../utils/response");

/**
 * Get current weather
 *
 * GET /api/weather/current?city=Pune
 */
const getCurrentWeather = async (req, res, next) => {
  try {
    const { city, latitude, longitude } = req.query;

    if (!city && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({
        success: false,
        message: "City or latitude and longitude are required",
      });
    }

    const weather = await weatherService.getCurrentWeather({
      city,
      latitude,
      longitude,
    });

    return successResponse(
      res,
      200,
      "Current weather retrieved successfully",
      weather
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get weather forecast
 *
 * GET /api/weather/forecast?city=Pune&days=7
 */
const getForecast = async (req, res, next) => {
  try {
    const {
      city,
      latitude,
      longitude,
      days = 7,
    } = req.query;

    if (!city && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({
        success: false,
        message: "City or latitude and longitude are required",
      });
    }

    const numberOfDays = Number(days);

    if (
      Number.isNaN(numberOfDays) ||
      numberOfDays < 1 ||
      numberOfDays > 7
    ) {
      return res.status(400).json({
        success: false,
        message: "Days must be between 1 and 7",
      });
    }

    const forecast = await weatherService.getForecast({
      city,
      latitude,
      longitude,
      days: numberOfDays,
    });

    return successResponse(
      res,
      200,
      "Weather forecast retrieved successfully",
      forecast
    );
  } catch (error) {
    next(error);
  }
};

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
      hours = 24,
    } = req.query;

    if (!city && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({
        success: false,
        message: "City or latitude and longitude are required",
      });
    }

    const numberOfHours = Number(hours);

    if (
      Number.isNaN(numberOfHours) ||
      numberOfHours < 1 ||
      numberOfHours > 48
    ) {
      return res.status(400).json({
        success: false,
        message: "Hours must be between 1 and 48",
      });
    }

    const forecast = await weatherService.getHourlyForecast({
      city,
      latitude,
      longitude,
      hours: numberOfHours,
    });

    return successResponse(
      res,
      200,
      "Hourly forecast retrieved successfully",
      forecast
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
};